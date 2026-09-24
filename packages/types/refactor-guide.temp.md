# Migration Guide: Adopting Canonical `@template/types` Contracts

This guide documents the deprecation map, structural changes, and step-by-step refactoring targets required when transitioning `apps/api` (backend) and `apps/web` (frontend) from the legacy flat types to the modular domain contracts.

---

## 1. Deprecation & Replacement Matrix

Use this table as a quick reference when finding and replacing legacy imports across the workspace.

| Legacy Type / Interface | Canonical Target | Module Subpath | Rationale / Breaking Risk |
| --- | --- | --- | --- |
| `UserProfile` | `AuthUser` *(for identity)*<br>

<br>`UserProfileResponse` *(for full profile)* | `@template/types/user`<br>

<br>`@template/types` | **High confusion risk.** `UserProfile` only contained base `User` fields. Disambiguates core identity from full profile data. |
| `RegisterInput` | `RegisterRequest` | `@template/types/auth`<br>

<br>`@template/types` | Standardizes client $\rightarrow$ server network payloads under the `*Request` suffix. |
| `LoginInput` | `LoginRequest` | `@template/types/auth`<br>

<br>`@template/types` | Standardizes client $\rightarrow$ server network payloads under the `*Request` suffix. |
| `LogoutResult` | `LogoutResponse` | `@template/types/auth`<br>

<br>`@template/types` | Standardizes server $\rightarrow$ client network payloads under the `*Response` suffix. |
| `AuthUserResponse` | `AuthUser` | `@template/types/user`<br>

<br>`@template/types` | The response payload is functionally identical to the sanitized identity model. |
| `AvatarUploadTicketResponse` | `PresignedPostUploadResponse` | `@template/types/storage`<br>

<br>`@template/types` | Replaces a domain-specific alias with the underlying generic object storage response. |

---

## 2. Backend Refactoring Checklist (`apps/api`)

### A. Authentication & DTO Contracts

Update all NestJS DTO classes to implement the canonical `*Request` interfaces rather than the legacy `*Input` aliases.

* **Register DTO (`apps/api/src/modules/auth/dto/register.dto.ts`):**
```typescript
// Before: import type { RegisterInput } from '@template/types';
import type { RegisterRequest } from '@template/types';

export class RegisterDto implements RegisterRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  displayName!: string;

  @IsBoolean()
  termsAccepted!: boolean;
}

```


* **Login DTO (`apps/api/src/modules/auth/dto/login.dto.ts`):**
```typescript
// Before: import type { LoginInput } from '@template/types';
import type { LoginRequest } from '@template/types';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

```


* **Profile Update DTO (`apps/api/src/modules/user/dto/update-profile.dto.ts`):**
```typescript
import type { UpdateProfileRequest } from '@template/types';

export class UpdateProfileDto implements UpdateProfileRequest {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  headline?: string;

  // Remaining fields adhere to UpdateProfileRequest
}

```



### B. Session & Request Typing

Update Express / NestJS custom parameter decorators to utilize `UserSession` from the `auth` domain:

```typescript
import type { UserSession } from '@template/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof UserSession | undefined, ctx: ExecutionContext): UserSession | unknown => {
    const req = ctx.switchToHttp().getRequest();
    const session = req.session?.user as UserSession | undefined;
    return data ? session?.[data] : session;
  },
);

```

### C. Controller Return Annotations

Replace ambiguous `UserProfile` and `AuthUserResponse` annotations with explicit models:

```typescript
// Authentication Controller
@Post('register')
async register(@Body() dto: RegisterDto): Promise<AuthUser> {
  return this.authService.register(dto);
}

// User Profile Controller
@Get('me')
async getProfile(@CurrentUser('userId') userId: string): Promise<UserProfileResponse> {
  return this.userService.getFullProfile(userId);
}

@Get(':id/public')
async getPublicProfile(@Param('id') id: string): Promise<PublicProfileResponse> {
  return this.userService.getPublicProfile(id);
}

```

### D. Global Filters and Interceptors

Ensure `TransformResponseInterceptor` and `AllExceptionsFilter` produce payloads that conform to `ApiSuccessResponse<T, M>` and `ApiErrorResponse`:

```typescript
// Interceptor payload output shape:
{
  success: true,
  statusCode: context.switchToHttp().getResponse().statusCode,
  message: resMessage || 'Operation successful',
  data,
  traceId: req.headers['x-trace-id'] || generateTraceId(),
  timestamp: new Date().toISOString(),
  meta, // optional, matches PaginationMeta when returning lists
}

// Exception filter output shape:
{
  success: false,
  statusCode,
  error: errorTitle,
  message: Array.isArray(rawMsg) ? rawMsg : [rawMsg],
  data: null,
  traceId: req.headers['x-trace-id'],
  timestamp: new Date().toISOString(),
  debugStack: isProduction ? undefined : exception.stack,
}

```

---

## 3. Frontend Refactoring Checklist (`apps/web`)

### A. Global Fetcher / HTTP Client

Leverage the `ApiResponse<T>` discriminated union in your API client or Axios/Fetch wrapper to simplify response handling without unsafe casts:

```typescript
import type { ApiResponse } from '@template/types';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  const payload: ApiResponse<T> = await res.json();

  if (!payload.success) {
    // TypeScript automatically narrows payload to ApiErrorResponse
    const errMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message;
    throw new Error(errMessage || payload.error);
  }

  // TypeScript automatically narrows payload to ApiSuccessResponse<T>
  return payload.data;
}

```

### B. User Context & Component Props

Disambiguate session identity from detailed user profiles across React contexts and components:

```typescript
// AuthContext.tsx -> Use AuthUser
import type { AuthUser } from '@template/types';

interface AuthContextState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ProfilePage.tsx -> Use UserProfileResponse
import type { UserProfileResponse } from '@template/types';

interface ProfileViewProps {
  profile: UserProfileResponse;
}

// InstructorCard.tsx -> Use PublicProfileResponse
import type { PublicProfileResponse } from '@template/types';

interface InstructorCardProps {
  instructor: PublicProfileResponse;
}

```

### C. Direct Object Storage Upload Flow

Implement the direct-to-S3 form upload using `PresignedPostUploadResponse`:

```typescript
import type { PresignedPostUploadResponse } from '@template/types';

export async function uploadAssetToStorage(
  ticket: PresignedPostUploadResponse,
  file: File,
): Promise<void> {
  const formData = new FormData();

  // Presigned S3 policy fields must be appended BEFORE the file Blob
  Object.entries(ticket.fields).forEach(([key, val]) => {
    formData.append(key, val);
  });
  formData.append('file', file);

  const response = await fetch(ticket.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

```

---

## 4. Phased Execution Order

To avoid intermediate build failures across the Turborepo monorepo, refactor packages in the following sequence:

1. **Verify `@template/types` build:**
```bash
pnpm --filter @template/types run build

```


2. **Refactor Backend DTOs & Return Types (`apps/api`):**
* Update DTOs to implement the new request interfaces.
* Update services and controllers to return `AuthUser`, `UserProfileResponse`, and `PublicProfileResponse`.
* Run `pnpm --filter api type-check` to verify no contract mismatches exist.


3. **Refactor Interceptors & Filters (`apps/api`):**
* Align `TransformResponseInterceptor` and `AllExceptionsFilter` with the response envelopes.


4. **Refactor Frontend Client & Contexts (`apps/web`):**
* Update `AuthContext` to use `AuthUser`.
* Update profile and settings components to use `UserProfileResponse` or `PublicProfileResponse`.
* Update forms to use `RegisterRequest` and `LoginRequest`.
* Run `pnpm --filter web type-check`.


5. **Purge Deprecated Aliases:**
* Once all apps are updated, remove the backward-compatible aliases (`UserProfile`, `RegisterInput`, `LoginInput`, `LogoutResult`) from `@template/types`.