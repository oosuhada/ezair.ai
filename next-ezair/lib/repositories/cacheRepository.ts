type CacheRecord = { value: unknown; expiresAt: number };
const cache = new Map<string, CacheRecord>();

export async function getCachedApiResponse<T>(key: string): Promise<T | null> {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function setCachedApiResponse(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}
