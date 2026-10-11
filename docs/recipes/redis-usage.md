# Redis Cache Integration Recipe

## Architectural Rules

1. **Never call `RedisService` directly in feature services or controllers:** All cache operations must be encapsulated inside a **Domain Cache Repository** (e.g., `AuthCacheRepository`).

2. **Never hardcode raw string keys (`"user_" + id`):** Every key pattern, parameter, payload shape, and default TTL must be defined using `defineRedisContract()`.

3. **Return clean key parameters in `key()` callbacks:** `defineRedisContract` automatically prepends `<namespace>:v<version>:`. Callbacks must return only raw parameter segments (e.g., `(id) => id`, not `` `namespace:v1:${id}` ``).

4. **Keep payload types in `packages/types`:** Define cached payload schemas under `packages/types/src/<domain>/cache.ts`.

5. **Use versioned namespace identifiers (`v1`, `v2`):** Pass `version` to `defineRedisContract` (defaults to `1`) to isolate old and new cache entries automatically during schema breaking changes.


### Pattern 1: Defining the Payload in `@template/types`

Add the denormalized cache payload type to the domain's dedicated `cache.ts` file:

```typescript
// packages/types/src/course/cache.ts

/** * Cached Course Summary Snapshot * Key Pattern: course:summary:v1:<courseId> */
export interface CourseSummaryPayload {
  readonly courseId: string;
  readonly title: string;
  readonly instructorName: string;
  readonly totalModules: number;
  readonly priceInCents: number;
  readonly cachedAt: string;
}
```

Re-export it in `packages/types/src/course/index.ts`:

```typescript
export * from './cache.js';
```

### Pattern 2: Defining Contracts in the Domain Module

Create `apps/api/src/modules/course/cache/course-cache.contracts.ts`:

```typescript
import {
  defineRedisContract,
  sanitizeKeySegment,
} from '@/common/redis/redis.contract.js';
import type { CourseSummaryPayload } from '@template/types';

export const COURSE_CACHE_CONTRACTS = {
  /**   * Caches course overview details for quick catalog reads.   * Key Format: course:summary:v1:<courseId>   * TTL: 1 Hour (3,600 seconds)   */
  summary: defineRedisContract<[courseId: string], CourseSummaryPayload>({
    namespace: 'course:summary',
    version: 1,
    ttl: 60 * 60, // 1 hour
    key: (courseId) => courseId, // Pure parameter (builder handles namespace & v1)
  }),

  /**   * Tracks active concurrent viewers per course stream.   * Key Format: course:viewers:v1:<courseId>   * TTL: 5 Minutes (300 seconds)   */
  activeViewers: defineRedisContract<[courseId: string], { count: number }>({
    namespace: 'course:viewers',
    version: 1,
    ttl: 60 * 5,
    key: (courseId) => courseId,
  }),
} as const;
```

### Pattern 3: Creating the Domain Cache Repository

Create `apps/api/src/modules/course/cache/course-cache.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service.js';
import { COURSE_CACHE_CONTRACTS } from '../cache/course-cache.contracts.js';
import type { CourseSummaryPayload } from '@template/types';

@Injectable()
export class CourseCacheRepository {
  constructor(private readonly redis: RedisService) {}

  async getSummary(courseId: string): Promise<CourseSummaryPayload | null> {
    return this.redis.get(COURSE_CACHE_CONTRACTS.summary, courseId);
  }

  /**   * Standard write using contract's default TTL.   */
  async setSummary(summary: CourseSummaryPayload): Promise<void> {
    await this.redis.set(
      COURSE_CACHE_CONTRACTS.summary,
      summary,
      summary.courseId,
    );
  }

  /**   * Dynamic TTL write (overriding contract default TTL when needed).   */
  async setSummaryWithCustomTtl(
    summary: CourseSummaryPayload,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.setWithTtl(
      COURSE_CACHE_CONTRACTS.summary,
      summary,
      ttlSeconds,
      summary.courseId,
    );
  }

  async invalidateSummary(courseId: string): Promise<void> {
    await this.redis.del(COURSE_CACHE_CONTRACTS.summary, courseId);
  }
}
```

### Pattern 4: Atomic Pipelines & Multi-Key Operations

When executing batch writes or pipeline operations, use `redis.raw` in combination with contract key generators to preserve atomic execution while avoiding hardcoded strings:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service.js';
import { COURSE_CACHE_CONTRACTS } from '../cache/course-cache.contracts.js';

@Injectable()
export class CourseCacheRepository {
  constructor(private readonly redis: RedisService) {}

  /**   * Atomically invalidates course details and updates active viewer count using an ioredis pipeline.   */
  async resetCourseState(courseId: string): Promise<void> {
    const summaryKey = COURSE_CACHE_CONTRACTS.summary.key(courseId);
    const viewersKey = COURSE_CACHE_CONTRACTS.activeViewers.key(courseId);

    // Batch commands over a single socket pipeline write
    await this.redis.raw
      .pipeline()
      .del(summaryKey)
      .setex(
        viewersKey,
        COURSE_CACHE_CONTRACTS.activeViewers.ttl,
        JSON.stringify({ count: 0 }),
      )
      .exec();
  }
}
```

### Pattern 5: Consuming in Domain Business Logic

`CourseService` consumes the repository with clear semantic intent and zero knowledge of Redis keys or serialization:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import { CourseCacheRepository } from './repositories/course-cache.repository.js';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,    private readonly courseCache: CourseCacheRepository,  ) {}

  async getCourseSummary(courseId: string) {
    // 1. Try Cache Read
    const cached = await this.courseCache.getSummary(courseId);
    if (cached) {
      return cached;
    }

    // 2. Fallback to PostgreSQL
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true, _count: { select: { modules: true } } },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    // 3. Populate Cache
    const payload = {
      courseId: course.id,
      title: course.title,
      instructorName: course.instructor.name,
      totalModules: course._count.modules,
      priceInCents: course.priceInCents,
      cachedAt: new Date().toISOString(),
    };

    await this.courseCache.setSummary(payload);
    return payload;
  }
}
```

#### Note: Path & Segment Sanitization with `sanitizeKeySegment()`

When generating Redis keys that include HTTP request paths, resource URIs, or user-supplied strings, raw characters like `/` or whitespace can mess up key organization or break Redis GUI inspectors.

Import `sanitizeKeySegment` from `@/common/redis/redis.contract.js` inside contract files:

```typescript
import {
  defineRedisContract,
  sanitizeKeySegment,
} from '@/common/redis/redis.contract.js';

export const ROUTE_CACHE_CONTRACTS = {
  /**   * Caches rate limits or responses per route path.   * Input path:  "/api/v1/users/profile"   * Output key:  "route:cache:v1:api:v1:users:profile:usr_123"   */
  endpoint: defineRedisContract<[path: string, userId: string], void>({
    namespace: 'route:cache',
    version: 1,
    ttl: 300,
    key: (path, userId) => `${sanitizeKeySegment(path)}:${userId}`,
  }),
} as const;
```

#### Transformation Rules:

- Strips leading/trailing slashes: `/api/v1/auth/` $\rightarrow$ `api/v1/auth`

- Converts internal slashes and spaces to colons: `api/v1/auth login` $\rightarrow$ `api:v1:auth:login`

- Normalizes output to lowercase.