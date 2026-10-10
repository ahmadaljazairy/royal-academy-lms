# Guard Integration Recipe

## Architectural Rules for Guards

1. **Decorator-Driven Execution:** Configure guard behavior exclusively via custom route decorators (`@Roles()`, `@RateLimit()`) using NestJS `Reflector` metadata.

2. **Execution Pipeline Order:** Apply guards in strict logical order at the controller or route level:

1. `SessionAuthGuard` *(Establishes user session context)*

2. `RateLimitGuard` *(Protects infrastructure & endpoints from abuse)*

3. `RolesGuard` *(Enforces role-based authorization)*

3. **Decoupled Key Resolution:** Guards must never hardcode DTO property lookups (e.g., `req.body.email`). Pass dynamic target extractors via the `keyResolver` function option.

4. **Resiliency & Failure Strategies:**

- **Authorization Guards (`RolesGuard`):** Must **Fail-Closed** (`403 Forbidden` if user context or role metadata is missing).

- **Traffic Control Guards (`RateLimitGuard`):** Must **Fail-Open** (log errors and allow traffic during Redis/cache outages to preserve API availability).

## 1. RolesGuard (Role-Based Access Control)

### Purpose

Restricts endpoint access based on user roles attached to the request context (`req.user`) by `SessionAuthGuard`.

### Decorator Usage

Import `Roles` from `@/common/decorators` and `RolesGuard` from `@/common/guards`.

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '@/common/decorators/index.js';
import { RolesGuard } from '@/common/guards/index.js';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  // Restrict to a single role
  @Roles('ADMIN')
  @Get('dashboard')
  async getDashboard() {}

  // Restrict to any matching role in the list
  @Roles('ADMIN', 'INSTRUCTOR')
  @Post('announcements')
  async createAnnouncement() {}
}
```

## 2. RateLimitGuard (Sliding-Window Dual-Bucket Rate Limiter)

### Purpose

Protects endpoints against volumetric DoS, credential stuffing, and brute-force attacks using atomic Redis Sorted Sets (`ZSET`).

### Configuration Options (`RateLimitOptions`)

When calling `@RateLimit(options)`, configure behavior using the following options:

| **Property** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| **`limit`** | `number` | *Required* | Max allowed requests for the IP bucket within the rolling window. |
| **`ttlSeconds`** | `number` | `60` | Duration of the rolling window in seconds. |
| **`keyPrefix`** | `string` | `'global'` | Custom namespace bucket prefix for Redis keys (e.g., `'auth:login'`). |
| **`keyResolver`** | `(req) => string \\| undefined` | `undefined` | Optional function extracting a specific target identifier (email, account ID, API key). Activates Bucket 2. |
| **`targetLimit`** | `number` | `limit` | Optional separate limit cap for Bucket 2 (Target Bucket). |

### Usage Patterns

#### Pattern A: Single-Bucket (IP Volumetric Limit)

Use when limiting total requests from a single IP address regardless of request payload.

```typescript
// Shorthand: 10 requests per 60 seconds per IP
@RateLimit(10, 60)
@Get('public-catalog')
async getCatalog() {}

// Explicit object configuration
@RateLimit({
  limit: 30,
  ttlSeconds: 60,
  keyPrefix: 'catalog:search',
})
@Get('search')
async searchCatalog() {}
```

#### Pattern B: Dual-Bucket (IP Limit + Account Target Limit)

Use on sensitive authentication or resource endpoints to block both single-IP spamming and distributed botnets targeting specific accounts.

```typescript
@RateLimit({
  limit: 100,         // Bucket 1: Max 100 requests per IP
  targetLimit: 5,     // Bucket 2: Max 5 requests targeting any single account
  ttlSeconds: 60,
  keyPrefix: 'auth:login',
  keyResolver: (req) => req.body?.email || req.body?.username,
})
@Post('login')
async login(@Body() dto: LoginDto) {}
```

#### Pattern C: Custom Target Resolution (Query, Path Params, or Headers)

Use `keyResolver` to inspect URL parameters, query strings, or tenant headers dynamically.

```typescript
// Targeting via URL Query Parameter
@RateLimit({
  limit: 20,
  targetLimit: 3,
  ttlSeconds: 300,
  keyPrefix: 'auth:reset-password',
  keyResolver: (req) => req.query.email as string,
})
@Get('reset-password')
async requestPasswordReset(@Query('email') email: string) {}

// Targeting via Authenticated Session Context
@RateLimit({
  limit: 50,
  targetLimit: 10,
  ttlSeconds: 60,
  keyPrefix: 'reports:export',
  keyResolver: (req: AuthenticatedRequest) => req.user?.userId,
})
@Post('export')
async exportReport(@CurrentUser() user: UserSession) {}
```

## 3. Combining Guards on Controllers

Guards can be applied at the controller level (for all routes) or overridden on individual route handlers:

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Roles, RateLimit, CurrentUser } from '@/common/decorators/index.js';
import { RolesGuard, RateLimitGuard } from '@/common/guards/index.js';
import type { UserSession } from '@template/types';

@Controller('courses')
@UseGuards(RateLimitGuard, RolesGuard) // Order: RateLimit -> Roles
export class CourseController {
  @Roles('INSTRUCTOR', 'ADMIN')
  @RateLimit({
    limit: 60,
    targetLimit: 5,
    ttlSeconds: 60,
    keyPrefix: 'course:create',
    keyResolver: (req) => req.body?.title,
  })
  @Post()
  async createCourse(
    @CurrentUser() user: UserSession,    @Body() dto: CreateCourseDto,  ) {}
}
```