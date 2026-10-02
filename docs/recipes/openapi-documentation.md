# OpenAPI Documentation & Schema Composition Recipe

## Architectural Rules

1. **Never create physical envelope DTO classes (`UserProfileEnvelopeDto`, `ChangePasswordEnvelopeDto`):** Always use `@ApiDoc()` with OpenAPI `allOf` schema composition.
2. **Never manually stack separate `@ApiResponse`, `@ApiOperation`, or `@HttpCode` decorators:** Use `@ApiDoc()` as the single source of truth for endpoint documentation.
3. **Synchronize runtime and documentation:** Passing `status` or `message` to `@ApiDoc()` updates both Swagger UI and the runtime HTTP response envelope simultaneously.
4. **Keep security and documentation orthogonal:** Keep auth/rate-limiting decorators (`@UseGuards(JwtAuthGuard)`, `@Throttle()`, `@Roles()`) separate from `@ApiDoc()`.

## Wire Contract Mapping

```
                                @ApiDoc()
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        ▼                                                     ▼
Compile-Time OpenAPI                                 Runtime Request Pipe
```

| **Layer** | **Component** | **Target Payload / Envelope** |
| --- | --- | --- |
| **Compile-Time OpenAPI** | `BaseSuccessEnvelopeDto` | `data: $ref(UserResponseDto)` |
| **Compile-Time OpenAPI** | `ApiErrorResponseDto` | `data: null` |
| **Runtime Request Pipe** | `TransformResponseInterceptor` | `ApiSuccessResponse<T>` |
| **Runtime Request Pipe** | `AllExceptionsFilter` | `ApiErrorResponse` |

## Usage Patterns

### Pattern 1: Single Resource Endpoint (`GET`)

Return a domain DTO directly. `@ApiDoc()` wraps `data` with `UserResponseDto` in Swagger.

```typescript
import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiDoc } from '@/common/decorators/api-doc.decorator.js';
import { UserService } from './user.service.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import type { ApiSuccessResponse } from '@template/types';

@Controller('users')
export class UserController {
 constructor(private readonly userService: UserService) {}

@Get(':id')
 @ApiDoc({
 summary: 'Retrieve user profile by ID',
 type: UserResponseDto,
 errors: [HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
 })
 async findById(
 @Param('id') id: string,
 ): Promise<ApiSuccessResponse<UserResponseDto>> {
 const user = await this.userService.findById(id);
 return user as unknown as ApiSuccessResponse<UserResponseDto>;
 }
}
```

### Pattern 2: Mutation Endpoint with Custom Message (`POST` / `PATCH`)

Provide `status: HttpStatus.CREATED` (or `201`) and a custom `message`. `@ApiDoc()` configures `@HttpCode()`, `@ResponseMessage()`, and Swagger UI concurrently.

```typescript
import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiDoc } from '@/common/decorators/api-doc.decorator.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import type { ApiSuccessResponse } from '@template/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiDoc({
    summary: 'Register a new account',
    status: HttpStatus.CREATED,
    message: 'Account registered successfully. Please verify your email.',
    type: UserResponseDto,
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT, HttpStatus.INTERNAL_SERVER_ERROR],
  })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const user = await this.authService.register(dto);
    return user as unknown as ApiSuccessResponse<UserResponseDto>;
  }
}
```

### Pattern 3: Collection Endpoint (`GET` Array)

Pass an array type `type: [CourseOverviewDto]` (or `isArray: true`). `@ApiDoc()` generates an array schema for `data` inside the Swagger OpenAPI definition.

```typescript
import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiDoc } from '@/common/decorators/api-doc.decorator.js';
import { CourseService } from './course.service.js';
import { CourseOverviewDto } from './dto/course-overview.dto.js';
import type { ApiPaginatedResponse, PaginationQueryDto } from '@template/types';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiDoc({
    summary: 'List paginated courses',
    type: [CourseOverviewDto], // Array syntax automatically wraps schema as CourseOverviewDto[]
    errors: [HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED],
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ApiPaginatedResponse<CourseOverviewDto>> {
    const result = await this.courseService.findAll(query);
    return result as unknown as ApiPaginatedResponse<CourseOverviewDto>;
  }
}
```

### Pattern 4: Empty / Void Response (`DELETE` or Action)

Omit `type`. `@ApiDoc()` sets `data: null` in the success schema.

```typescript
import { Controller, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiDoc } from '@/common/decorators/api-doc.decorator.js';
import { UserService } from './user.service.js';
import type { ApiSuccessResponse } from '@template/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  @ApiDoc({
    summary: 'Delete user account',
    status: HttpStatus.OK,
    message: 'User account deleted successfully.',
    errors: [HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND],
  })
  async remove(@Param('id') id: string): Promise<ApiSuccessResponse<null>> {
    await this.userService.remove(id);
    return null as unknown as ApiSuccessResponse<null>;
  }
}
```