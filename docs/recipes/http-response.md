# HTTP Response Architectural Recipe

This recipe explains how to write controller methods that take full advantage of automatic envelope wrapping, pagination typing, and custom messaging.

## Architectural Rules

1. **Return raw data or paginated objects directly from controllers:** Never manually construct `{ success: true, data: ... }` inside controllers or services. Let `TransformResponseInterceptor` handle wire envelope formatting automatically.

2. **Annotate return types using shared envelopes:** Controller methods should be typed with `Promise<ApiSuccessResponse<DTO>>` or `Promise<ApiPaginatedResponse<DTO>>`.

3. **Use `@ResponseMessage()` for custom feedback:** Set user-friendly feedback messages on mutations (`POST`, `PUT`, `DELETE`).

4. **Use `@BypassTransform()` for raw or external endpoints:** Use it on Stripe webhooks, file downloads, or SSE/streaming feeds that require un wrapped raw data.


## Patterns & Examples

### Pattern 1: Standard Single Entity Endpoint (`GET`)

Return the plain DTO or entity. The interceptor wraps it in `ApiSuccessResponse<UserResponse>`.

```typescript
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service.js';
import type { ApiSuccessResponse, UserResponse } from '@template/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UserResponse>> {
    // Service returns plain UserResponse entity
    const user = await this.userService.findById(id);
    return user as unknown as ApiSuccessResponse<UserResponse>;
  }
}
```

**Wire Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "usr_123",
    "email": "ahmad@example.com",
    "role": "STUDENT"
  },
  "traceId": "c39b1a51-5e88-4f0e-a612-4e929b9876a1",
  "timestamp": "2026-10-02T06:46:25.000Z"
}
```

### Pattern 2: Mutation with Custom Message (`POST` / `PATCH`)

Decorate the endpoint with `@ResponseMessage(...)` to set a custom feedback string in the envelope.

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ResponseMessage } from '@/common/decorators/response.decorators.js';
import { AuthService } from './auth.service.js';
import type { ApiSuccessResponse, RegisterRequest, UserResponse } from '@template/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ResponseMessage('Account created successfully. Please check your email to verify.')
  async register(
    @Body() dto: RegisterRequest,
  ): Promise<ApiSuccessResponse<UserResponse>> {
    const newUser = await this.authService.register(dto);
    return newUser as unknown as ApiSuccessResponse<UserResponse>;
  }
}
```

**Wire Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully. Please check your email to verify.",
  "data": {
    "id": "usr_456",
    "email": "naser@example.com",
    "role": "STUDENT"
  },
  "traceId": "e1f7a83d-3a1b-410c-9823-111122223333",
  "timestamp": "2026-10-02T06:46:25.000Z"
}
```

### Pattern 3: Paginated Collection Endpoint (`GET`)

Return an object matching `{ items: T[], meta: PaginationMeta }` from your service. The interceptor automatically extracts `items` into `data` and maps `meta` to construct `ApiPaginatedResponse<T>`.

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { CourseService } from './course.service.js';
import type { ApiPaginatedResponse, CourseOverview, PaginationQuery } from '@template/types';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(
    @Query() query: PaginationQuery,
  ): Promise<ApiPaginatedResponse<CourseOverview>> {
    // Service returns { items: CourseOverview[], meta: PaginationMeta }
    const result = await this.courseService.findAllPaginated(query);
    return result as unknown as ApiPaginatedResponse<CourseOverview>;
  }
}
```

**Wire Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "crs_1",
      "title": "Compiler Design in Python",
      "instructor": "Ahmad"
    },
    {
      "id": "crs_2",
      "title": "Advanced NestJS Monorepos",
      "instructor": "Ahmad"
    }
  ],
  "traceId": "8f9021b3-4412-4211-b8ef-1234567890ab",
  "timestamp": "2026-10-02T06:46:25.000Z",
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Pattern 4: Raw Endpoint Bypass (`@BypassTransform`)

Use `@BypassTransform()` for third-party webhooks, file exports, or raw streams where envelope wrapping would break external client expectations.

```typescript
import { Controller, Post, Req, Header } from '@nestjs/common';
import { BypassTransform } from '@/common/decorators/response.decorators.js';
import type { Request } from 'express';

@Controller('webhooks')
export class WebhookController {

  @Post('stripe')
  @BypassTransform()
  async handleStripeWebhook(@Req() req: Request) {
    // Returns raw string/JSON payload directly without envelope
    return { received: true };
  }
}
```

**Wire Response:**

```json
{
  "received": true
}
```