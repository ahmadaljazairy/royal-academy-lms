[**@template/types**](../README.md)

***

[@template/types](../README.md) / StorageScope

# Type Alias: StorageScope

> **StorageScope** = `"AVATAR"` \| `"COURSE_THUMBNAIL"` \| `"COURSE_VIDEO"` \| `"COURSE_ATTACHMENT"`

Defined in: storage/models.ts:14

Storage isolation partitions.
Governs asset directory paths, byte quotas, and bucket access policies:
- `AVATAR`: Public images, max 2MB.
- `COURSE_THUMBNAIL`: Public course banner images, max 5MB.
- `COURSE_VIDEO`: Private video streams, authenticated playback.
- `COURSE_ATTACHMENT`: Supplementary resources (PDFs, code archives).
