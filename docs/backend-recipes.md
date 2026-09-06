# Backend Engineering Recipes

A practical guide for building consistent, secure, and production-ready modules in this API.

---

## 1. Creating an Endpoint (Secure-by-Default)

The API enforces global session authentication via `SessionAuthGuard`. Every route is locked down unless explicitly opted out.

### Rule
* **Protected Routes (Default):** Do not add `@UseGuards(SessionAuthGuard)`. It is active automatically.
* **Public Routes:** Decorate the handler or controller with `@Public()`.

### Example
```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('catalog')
export class CatalogController {
// Publicly accessible route
@Public()
@Get('courses')
async listCourses() {
return this.catalogService.findAll();
}

// Automatically locked behind Redis session auth
@Post('courses')
async createCourse() {
return this.catalogService.create();
}
}
```

---

## 2. Enforcing Role-Based Access Control (RBAC)

Use the `@Roles()` decorator to restrict endpoints to specific system roles.

### Rule
* `RolesGuard` runs globally right after `SessionAuthGuard`.
* If a route has no `@Roles()`, any authenticated user can access it.
* If a user's role is not listed, the API automatically halts execution with `403 Forbidden`.

### Example
```typescript
import { Controller, Delete, Param } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('admin')
export class AdminController {
@Delete('users/:id')
@Roles('ADMIN') // Type-safe from SystemRole
async deleteUser(@Param('id') id: string) {
return this.adminService.removeUser(id);
}
}
```

---

## 3. Reading the Authenticated User

Extract session identity context cleanly using the `@CurrentUser()` parameter decorator.

### Rule
* Never read `req.user` manually in your controllers.
* Pass property names to extract specific fields directly.

### Example
```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { UserSession } from '@template/types';

@Controller('dashboard')
export class DashboardController {
// Inject the entire session payload
@Get('profile')
async getProfile(@CurrentUser() user: UserSession) {
return user;
}

// Inject only a specific attribute
@Get('email')
async getEmail(@CurrentUser('email') email: string) {
return { email };
}
}
```

---

## 4. Applying Sensitive Rate Limits

Apply `@RateLimit(...)` with `@UseGuards(RateLimitGuard)` to CPU-heavy or sensitive endpoints (e.g., login, password resets, SMS dispatch).

### Rule
* Set a tight quota (e.g., 3–5 hits per minute).
* Use `trackEmail: true` when mitigating credential stuffing to avoid locking out users on shared corporate IPs.

### Example
```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RateLimit } from '../common/decorators/rate-limit.decorator.js';
import { RateLimitGuard } from '../common/guards/rate-limit.guard.js';

@Controller('auth')
export class PasswordResetController {
    @Public()
    @Post('forgot-password')
    @UseGuards(RateLimitGuard)
    @RateLimit({
        limit: 3,
        ttlSeconds: 60,
        keyPrefix: 'rl:forgot-pw',
        trackEmail: true,
    })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.sendResetLink(dto.email);
    }
}
```

---

## 5. Standardizing Responses and Custom Exceptions

The API uses `TransformResponseInterceptor` to wrap success outputs and `AllExceptionsFilter` to catch and sanitize errors.

### Rule
* **Success Messages:** Always add `@ResponseMessage('Human readable confirmation')`.
* **Return Naked Data:** Handlers should return raw domain data or DTOs; the interceptor packages `{ success: true, message, data, meta }` automatically.
* **Semantic Exceptions:** Throw standard NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`). Never return custom error JSON strings directly.

### Example
```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ResponseMessage } from '../common/decorators/response.decorators.js';

@Controller('lessons')
export class LessonController {
@Get(':id')
@ResponseMessage('Lesson details retrieved')
async getLesson(@Param('id') id: string) {
const lesson = await this.lessonService.findById(id);

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" does not exist.`);
    }

    return lesson; // Automatically enveloped
}
}
```