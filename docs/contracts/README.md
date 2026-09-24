**@template/types**

***

# @template/types

Central contract surface for the workspace. Re-exports all standardized wire
envelopes, object storage definitions, session models, and identity interfaces.

All exports are strictly isomorphic (zero-runtime Node.js or database dependencies)
to ensure safe consumption across backend microservices, web apps, and workers.

## Interfaces

- [ApiErrorResponse](interfaces/ApiErrorResponse.md)
- [ApiSuccessResponse](interfaces/ApiSuccessResponse.md)
- [AuthUser](interfaces/AuthUser.md)
- [ChangePasswordRequest](interfaces/ChangePasswordRequest.md)
- [ChangePasswordResponse](interfaces/ChangePasswordResponse.md)
- [ConfirmAvatarUploadRequest](interfaces/ConfirmAvatarUploadRequest.md)
- [ConfirmAvatarUploadResponse](interfaces/ConfirmAvatarUploadResponse.md)
- [LoginRequest](interfaces/LoginRequest.md)
- [LogoutResponse](interfaces/LogoutResponse.md)
- [PaginationMeta](interfaces/PaginationMeta.md)
- [PaginationQuery](interfaces/PaginationQuery.md)
- [PresignedDownloadResponse](interfaces/PresignedDownloadResponse.md)
- [PresignedPostUploadRequest](interfaces/PresignedPostUploadRequest.md)
- [PresignedPostUploadResponse](interfaces/PresignedPostUploadResponse.md)
- [PublicProfileResponse](interfaces/PublicProfileResponse.md)
- [RegisterRequest](interfaces/RegisterRequest.md)
- [RequestAvatarUploadRequest](interfaces/RequestAvatarUploadRequest.md)
- [UpdateProfileRequest](interfaces/UpdateProfileRequest.md)
- [UserProfileResponse](interfaces/UserProfileResponse.md)
- [UserSession](interfaces/UserSession.md)
- [VerifiedStorageObject](interfaces/VerifiedStorageObject.md)

## Type Aliases

- [ApiPaginatedResponse](type-aliases/ApiPaginatedResponse.md)
- [ApiResponse](type-aliases/ApiResponse.md)
- [AuthUserResponse](type-aliases/AuthUserResponse.md)
- [AvatarUploadTicketResponse](type-aliases/AvatarUploadTicketResponse.md)
- [LoginInput](type-aliases/LoginInput.md)
- [LogoutResult](type-aliases/LogoutResult.md)
- [RegisterInput](type-aliases/RegisterInput.md)
- [Role](type-aliases/Role.md)
- [SortOrder](type-aliases/SortOrder.md)
- [StorageScope](type-aliases/StorageScope.md)
- [~~UserProfile~~](type-aliases/UserProfile.md)

## Variables

- [ROLES](variables/ROLES.md)
- [STORAGE\_SCOPES](variables/STORAGE_SCOPES.md)
