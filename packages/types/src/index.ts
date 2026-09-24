/**
 * @packageDocumentation
 * Central contract surface for the workspace. Re-exports all standardized wire
 * envelopes, object storage definitions, session models, and identity interfaces.
 *
 * All exports are strictly isomorphic (zero-runtime Node.js or database dependencies)
 * to ensure safe consumption across backend microservices, web apps, and workers.
 */

export * from './api/index.js';
export * from './storage/index.js';
export * from './auth/index.js';
export * from './user/index.js';