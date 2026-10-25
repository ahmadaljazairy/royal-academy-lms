# Storage Module Developer Guide & Recipe

## Part 1: How to Use the Module

> **Note:** `StorageModule` is decorated with `@Global()`. Importing it once in `AppModule` automatically makes `StorageService` available for injection across all feature modules without re-importing.

### Core Methods Reference

- **`generatePresignedPost(params)`**: Issues a pre-signed POST policy document allowing direct client-to-S3 uploads with storage-enforced size ceilings and MIME locks.

- **`verifyAndInspectObject(fileKey, scope)`**: Inspects uploaded object metadata in S3 prior to database persistence, automatically purging non-compliant or zero-byte files.

- **`generatePresignedDownload(fileKey, scope, expiresInSeconds?)`**: Generates a temporary pre-signed read URL for accessing assets stored in private buckets.

- **`getPublicUrl(fileKey)`**: Resolves the fully-qualified public CDN or S3 endpoint URI for public assets.

- **`objectExists(fileKey, scope)`**: Performs a `HEAD` check to confirm whether an object exists in the target storage bucket.

- **`deleteObject(fileKey, scope)`**: Removes an object key from the corresponding bucket.

- **`getScopeSpec(scope)`**: Resolves the path prefix, byte limit, MIME whitelist, and target bucket name for a given scope.

### Usage in Feature Services

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from '../../common/storage/storage.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly storageService: StorageService) {}

  // 1. Issue pre-signed direct upload ticket to client
  async requestAvatarTicket(userId: string, mimeType: string, originalFilename?: string) {
    return this.storageService.generatePresignedPost({
      scope: 'AVATAR',
      userId,
      mimeType,
      originalFilename,
    });
  }

  // 2. Verify object metadata on S3 before saving URI to PostgreSQL
  async confirmAvatarUpload(fileKey: string) {
    const verifiedObject = await this.storageService.verifyAndInspectObject(
      fileKey,
      'AVATAR',
    );
    
    return verifiedObject;
  }
}
```



## Part 2: Recipe — Adding a New Storage Scope

### Step 1: Update Scope Array in `@royal-academy/types`

Update `packages/types/src/storage/models.ts`:

```typescript
export const STORAGE_SCOPES = [
  'AVATAR',
  'COURSE_THUMBNAIL',
  'COURSE_VIDEO',
  'COURSE_ATTACHMENT',
  'CERTIFICATE_TEMPLATE', // <-- Add new scope identifier
] as const;

export type StorageScope = (typeof STORAGE_SCOPES)[number];
```

### Step 2: Configure Scope Rules in `storage.constants.ts`

Add the scope specification entry to `STORAGE_SCOPES`:

```typescript
export const STORAGE_SCOPES: Record<StorageScope, StorageScopeSpec> = {
  // ... existing scopes ...

  CERTIFICATE_TEMPLATE: {
    isPublic: false, // Stored in private bucket
    allowedMimeTypes: ['application/pdf', 'image/png'],
    maxSizeBytes: 20 * 1024 * 1024, // 20 MB limit
    pathPrefix: 'certificates/templates',
  },
} as const;
```

### Step 3: Consume in Feature Workflows

`StorageService` automatically resolves the target bucket, path prefix, and byte limits:

```typescript
const ticket = await this.storageService.generatePresignedPost({
  scope: 'CERTIFICATE_TEMPLATE',
  userId: adminId,
  mimeType: 'application/pdf',
});
```
