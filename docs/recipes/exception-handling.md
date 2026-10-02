# Exception Handling & Error Envelope Recipe

This document defines the architectural standards for error handling across all backend microservices and domain modules.

## Architectural Rules

1. **Never manually construct error JSON bodies in controllers:** Throw standard NestJS HTTP exceptions or custom domain exceptions. Let `AllExceptionsFilter` format the outgoing wire envelope.

2. **Let database constraint errors bubble up:** Do not wrap simple Prisma operations in `try/catch` blocks just to re-throw a `409 Conflict` or `404 Not Found`. The filter automatically maps Prisma codes (`P2002` $\rightarrow$ `409`, `P2025` $\rightarrow$ `404`).

3. **Decoupled execution:** The error handling pipeline operates globally across all HTTP routes regardless of whether Swagger decorators (`@ApiEndpoint()`) are present.

4. **Information Leakage Prevention:** In `production` (`NODE_ENV=production`), all 500-level error messages are obfuscated to prevent exposing raw database details, infrastructure IPs, or internal stack traces to external clients.


## Wire Error Contract (`ApiErrorResponse`)

Every HTTP error returned by the API adheres strictly to this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "BadRequestException",
  "message": [
    "email must be a valid email address",
    "password must be longer than or equal to 8 characters"
  ],
  "data": null,
  "traceId": "c39b1a51-5e88-4f0e-a612-4e929b9876a1",
  "timestamp": "2026-10-02T08:15:30.000Z"
}
```

> **Note:** In `development` and `staging` environments, a `debugStack` string property is automatically appended to aid local debugging. It is automatically stripped in `production`.

## Usage Patterns

### Pattern 1: Throwing Managed Domain Exceptions

Throw built-in NestJS HTTP exceptions directly inside services or guards.

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      // Filter formats this into a 404 ApiErrorResponse
      throw new NotFoundException(`User with ID "${userId}" was not found.`);
    }

    return user;
  }
}
```

**Resulting Wire Envelope:**

```json
{
  "success": false,
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "User with ID \"usr_999\" was not found.",
  "data": null,
  "traceId": "a1b2c3d4-4321-9876-0000-111122223333",
  "timestamp": "2026-10-02T08:15:30.000Z"
}
```

### Pattern 2: Automatic ORM Constraint Mapping (Zero Boilerplate)

Allow Prisma operations to run cleanly without `try/catch` boilerplate. `AllExceptionsFilter` intercepts ORM driver errors automatically.

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import type { CreateCategoryRequest } from '@template/types';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryRequest) {
    // If 'slug' has a UNIQUE constraint and collides, Prisma throws P2002.
    // The filter catches P2002 and transforms it into a 409 Conflict.
    return this.prisma.category.create({
      data: { name: dto.name, slug: dto.slug },
    });
  }
}
```

| **Database Code** | **Origin** | **Automatic Status Code** | **Outgoing Error Type** |
| --- | --- | --- | --- |
| **`P2002`** | Prisma Unique Constraint Collision | `409 Conflict` | `ConflictException` |
| **`23505`** | PostgreSQL Native Unique Collision | `409 Conflict` | `ConflictException` |
| **`11000`** | MongoDB Duplicate Key Error | `409 Conflict` | `ConflictException` |
| **`P2025`** | Prisma Record To Update/Delete Not Found | `404 Not Found` | `NotFoundException` |

### Pattern 3: DTO Validation Error Arrays (`ValidationPipe`)

When payload validation fails via `class-validator`, `ValidationPipe` generates an array of validation error messages. The filter passes array messages through cleanly.

```typescript
// Incoming POST /auth/register request with invalid body
// Body: { "email": "invalid-email", "password": "123" }
```

**Resulting Wire Envelope:**

```json
{
  "success": false,
  "statusCode": 400,
  "error": "BadRequestException",
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "data": null,
  "traceId": "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
  "timestamp": "2026-10-02T08:15:30.000Z"
}
```

### Pattern 4: Incident Investigation & Log Correlation

Every error response returned to a client includes a unique `traceId` (also set in the `x-trace-id` HTTP header).

When a user or frontend developer reports an error:

1. Copy the `traceId` from the JSON error body or HTTP header (e.g., `c39b1a51-5e88-4f0e-a612-4e929b9876a1`).

2. Search server logs (Datadog, CloudWatch, or local terminal output) for that identifier:


```
[ERROR] [c39b1a51-5e88-4f0e-a612-4e929b9876a1] POST /api/v1/payments/checkout - 500 InternalServerError: Cannot read properties of undefined (reading 'charge')
[DEBUG] Context: {"traceId":"c39b1a51-5e88-4f0e-a612-4e929b9876a1","timestamp":"2026-10-02T08:15:30.000Z","path":"/api/v1/payments/checkout","method":"POST","statusCode":500,"clientIp":"192.168.1.1","userId":"usr_123","errorType":"TypeError"}
```

### Pattern 5: Explicit `try/catch` (When Recovery or Cleanup Is Required)

Only use `try/catch` blocks inside domain code when you need to perform an active cleanup action (e.g., deleting an uploaded S3 file, rolling back an external API call, or re-throwing a specialized domain error).

```typescript
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { StorageService } from '@/common/storage/storage.service.js';

@Injectable()
export class MediaService {
  constructor(private readonly storage: StorageService) {}

  async processUpload(file: Express.Multer.File) {
    const fileKey = await this.storage.upload(file);

    try {
      return await this.extractMetadata(fileKey);
    } catch (error) {
      // Active cleanup: Delete orphan file from storage before failing
      await this.storage.delete(fileKey);

      throw new UnprocessableEntityException(
        'Failed to process media file metadata. Upload rolled back.',
      );
    }
  }
}
```