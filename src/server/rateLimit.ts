/**
 * Minimal in-memory rate limiter for public endpoints.
 * Best-effort: per Worker instance / server process. For a hardened
 * multi-instance deployment move this to Cloudflare WAF rules or KV/DO.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkPublicRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  bucket.count++;
  if (bucket.count > limit) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - bucket.count };
}
