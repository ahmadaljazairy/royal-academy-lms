/**
 * @file Object Storage Management Service
 * @module @royal-academy/api/common/storage/storage.service
 * @description Handles S3/MinIO bucket initialization, policy configuration, hardware-enforced
 * presigned POST upload policies, presigned download URLs, and post-upload verification.
 */

import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    PutBucketPolicyCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    type OnModuleInit,
} from '@nestjs/common';
import type {
    PresignedDownloadResponse,
    PresignedPostUploadResponse,
    StorageScope,
    VerifiedStorageObject,
} from '@royal-academy/types';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
    STORAGE_DEFAULTS,
    STORAGE_SCOPES,
    type StorageScopeSpec,
} from './storage.constants.js';

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private readonly s3Client: S3Client;

    public readonly publicBucket: string;
    public readonly privateBucket: string;
    private readonly endpoint: string;
    private readonly cdnBaseUrl?: string;

    constructor() {
        this.endpoint = process.env.S3_ENDPOINT ?? STORAGE_DEFAULTS.ENDPOINT;
        this.publicBucket =
            process.env.S3_PUBLIC_BUCKET_NAME ?? STORAGE_DEFAULTS.PUBLIC_BUCKET;
        this.privateBucket =
            process.env.S3_PRIVATE_BUCKET_NAME ?? STORAGE_DEFAULTS.PRIVATE_BUCKET;
        this.cdnBaseUrl = process.env.S3_CDN_URL;

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region: process.env.S3_REGION ?? STORAGE_DEFAULTS.REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
                secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadminpassword',
            },
            forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
        });
    }

    /**
     * Verifies or creates public and private buckets on module startup.
     */
    async onModuleInit(): Promise<void> {
        await this.ensureBucket(this.publicBucket, true);
        await this.ensureBucket(this.privateBucket, false);
    }

    /**
     * Ensures target bucket exists, creating it and applying policies if absent.
     */
    private async ensureBucket(
        bucketName: string,
        isPublic: boolean,
    ): Promise<void> {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
            this.logger.log(`Storage bucket "${bucketName}" verified.`);
        } catch {
            this.logger.warn(
                `Bucket "${bucketName}" not found. Creating bucket (isPublic=${isPublic})...`,
            );
            try {
                await this.s3Client.send(
                    new CreateBucketCommand({ Bucket: bucketName }),
                );
                this.logger.log(`Created bucket "${bucketName}" successfully.`);

                if (isPublic) {
                    await this.applyPublicReadPolicy(bucketName);
                }
            } catch (error) {
                this.logger.error(
                    `Failed to initialize bucket "${bucketName}":`,
                    error instanceof Error ? error.stack : error,
                );
            }
        }
    }

    /**
     * Applies an anonymous public-read S3 policy statement to a public bucket.
     */
    private async applyPublicReadPolicy(bucketName: string): Promise<void> {
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadAccess',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucketName}/*`],
                },
            ],
        };

        try {
            await this.s3Client.send(
                new PutBucketPolicyCommand({
                    Bucket: bucketName,
                    Policy: JSON.stringify(policy),
                }),
            );
            this.logger.log(
                `Configured public read policy for bucket "${bucketName}".`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to set public policy for "${bucketName}":`,
                error instanceof Error ? error.stack : error,
            );
        }
    }

    /**
     * Resolves storage scope specifications and maps to the appropriate bucket name.
     */
    public getScopeSpec(scope: StorageScope): {
        spec: StorageScopeSpec;
        bucket: string;
    } {
        const spec = STORAGE_SCOPES[scope];
        if (!spec) {
            throw new BadRequestException(`Unsupported storage scope: ${scope}`);
        }
        const bucket = spec.isPublic ? this.publicBucket : this.privateBucket;
        return { spec, bucket };
    }

    /**
     * Issues a Presigned POST upload policy document with storage-level size limits and MIME locks.
     */
    async generatePresignedPost(params: {
        scope: StorageScope;
        userId: string;
        mimeType: string;
        originalFilename?: string;
    }): Promise<PresignedPostUploadResponse> {
        const { spec, bucket } = this.getScopeSpec(params.scope);

        const normalizedMime = params.mimeType.toLowerCase();
        if (!spec.allowedMimeTypes.includes(normalizedMime)) {
            throw new BadRequestException(
                `Invalid MIME type "${params.mimeType}" for scope ${params.scope}. Allowed: ${spec.allowedMimeTypes.join(', ')}`,
            );
        }

        const extension = params.originalFilename
            ? extname(params.originalFilename).toLowerCase()
            : `.${normalizedMime.split('/')[1]}`;
        const fileKey = `${spec.pathPrefix}/${params.userId}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
        const expiresInSeconds = STORAGE_DEFAULTS.PRESIGNED_UPLOAD_TTL_SECONDS;

        try {
            const presignedPost = await createPresignedPost(this.s3Client, {
                Bucket: bucket,
                Key: fileKey,
                Conditions: [
                    ['content-length-range', 1, spec.maxSizeBytes],
                    ['eq', '$Content-Type', normalizedMime],
                    ['eq', '$bucket', bucket],
                    ['eq', '$key', fileKey],
                ],
                Fields: {
                    'Content-Type': normalizedMime,
                },
                Expires: expiresInSeconds,
            });

            return {
                uploadUrl: presignedPost.url,
                fields: presignedPost.fields,
                fileKey,
                bucket,
                expiresInSeconds,
            };
        } catch (error) {
            this.logger.error(
                `Failed to generate Presigned POST for ${params.scope}:`,
                error instanceof Error ? error.stack : error,
            );
            throw new InternalServerErrorException(
                'Unable to issue media upload token.',
            );
        }
    }

    /**
     * Confirms on-disk object metadata in S3/MinIO prior to database attachment.
     * Auto-purges uploaded objects that violate byte bounds or MIME whitelists.
     */
    async verifyAndInspectObject(
        fileKey: string,
        scope: StorageScope,
    ): Promise<VerifiedStorageObject> {
        const { spec, bucket } = this.getScopeSpec(scope);

        let head;
        try {
            head = await this.s3Client.send(
                new HeadObjectCommand({
                    Bucket: bucket,
                    Key: fileKey,
                }),
            );
        } catch {
            throw new NotFoundException(
                `Uploaded object not found in storage bucket "${bucket}".`,
            );
        }

        const actualSize = head.ContentLength ?? 0;
        const actualMime = (head.ContentType ?? '').toLowerCase();

        if (actualSize === 0 || actualSize > spec.maxSizeBytes) {
            await this.deleteObject(fileKey, scope);
            const maxMb = spec.maxSizeBytes / (1024 * 1024);
            throw new BadRequestException(
                `File size (${actualSize} bytes) violates bounds (max: ${maxMb}MB). Object removed.`,
            );
        }

        if (!spec.allowedMimeTypes.includes(actualMime)) {
            await this.deleteObject(fileKey, scope);
            throw new BadRequestException(
                `File Content-Type "${actualMime}" is not permitted for scope ${scope}. Object removed.`,
            );
        }

        return {
            fileKey,
            publicUrl: spec.isPublic ? this.getPublicUrl(fileKey) : '',
            sizeBytes: actualSize,
            mimeType: actualMime,
        };
    }

    /**
     * Generates a temporary presigned URL for reading private bucket objects.
     */
    async generatePresignedDownload(
        fileKey: string,
        scope: StorageScope,
        expiresInSeconds: number = STORAGE_DEFAULTS.PRESIGNED_DOWNLOAD_TTL_SECONDS,
    ): Promise<PresignedDownloadResponse> {
        const { bucket } = this.getScopeSpec(scope);

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileKey,
        });

        try {
            const downloadUrl = await getSignedUrl(this.s3Client, command, {
                expiresIn: expiresInSeconds,
            });

            return {
                downloadUrl,
                expiresInSeconds,
            };
        } catch (error) {
            this.logger.error(
                `Failed to generate download URL for "${fileKey}":`,
                error instanceof Error ? error.stack : error,
            );
            throw new InternalServerErrorException(
                'Unable to generate asset download link.',
            );
        }
    }

    /**
     * Resolves the fully-qualified public CDN or S3 endpoint URL for a public asset.
     */
    getPublicUrl(fileKey: string): string {
        if (!fileKey) return '';
        if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
            return fileKey;
        }
        if (this.cdnBaseUrl) {
            const cleanCdn = this.cdnBaseUrl.replace(/\/$/, '');
            return `${cleanCdn}/${fileKey}`;
        }
        const cleanEndpoint = this.endpoint.replace(/\/$/, '');
        return `${cleanEndpoint}/${this.publicBucket}/${fileKey}`;
    }

    /**
     * Checks whether an object key exists in the corresponding bucket.
     */
    async objectExists(fileKey: string, scope: StorageScope): Promise<boolean> {
        const { bucket } = this.getScopeSpec(scope);
        try {
            await this.s3Client.send(
                new HeadObjectCommand({
                    Bucket: bucket,
                    Key: fileKey,
                }),
            );
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Removes an object key from storage.
     */
    async deleteObject(fileKey: string, scope: StorageScope): Promise<void> {
        if (!fileKey) return;
        const { bucket } = this.getScopeSpec(scope);

        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: fileKey,
                }),
            );
            this.logger.log(`Deleted "${fileKey}" from bucket "${bucket}".`);
        } catch (error) {
            this.logger.warn(
                `Failed to delete "${fileKey}" from "${bucket}":`,
                error instanceof Error ? error.stack : error,
            );
        }
    }
}