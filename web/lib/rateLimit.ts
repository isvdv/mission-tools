import { HttpError } from './server';

const windows = new Map<string, { count: number; resetAt: number }>();
const PRUNE_THRESHOLD = 1000;

function pruneExpired(now: number) {
  for (const [key, window] of windows) {
    if (now > window.resetAt) windows.delete(key);
  }
}

export function assertRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  if (windows.size > PRUNE_THRESHOLD) pruneExpired(now);

  const current = windows.get(key);

  if (!current || now > current.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit) {
    throw new HttpError('Muitas requisições. Tente novamente em instantes.', 429);
  }
}

/** Best-effort client address; only trustworthy behind a proxy that sets these headers. */
export function clientAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'local';
}
