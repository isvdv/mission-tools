const windows = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || now > current.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit) {
    throw new Error('Muitas requisicoes. Tente novamente em instantes.');
  }
}
