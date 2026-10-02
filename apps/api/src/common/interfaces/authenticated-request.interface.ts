/**
 * @file Authenticated Express Request Interface
 * @module @template/api/common/interfaces/authenticated-request
 */

import type { Request } from 'express';
import type { UserSession } from '@template/types';

/**
 * Express Request decorated by `SessionAuthGuard` with a validated Redis session payload.
 */
export interface AuthenticatedRequest extends Request {
    /** Stateful Redis session payload. */
    user: UserSession;

    /** Validated session identifier extracted from the HTTP cookie. */
    sessionId: string;
}