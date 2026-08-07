// A minimal in-memory, per-instance TTL cache. Deliberately not Redis or
// anything shared across processes — every use of this is for absorbing
// repeated identical reads within a few seconds (e.g. many viewers polling
// the same live match), where slight cross-instance inconsistency under an
// ASG is a non-issue and a shared cache would be overkill.
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();

export async function withCache<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const cached = store.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const value = await load();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

/** Test-only: clears every cached entry so test cases don't leak cached
 *  responses into each other within the same test file/module registry. */
export function clearAllCache(): void {
  store.clear();
}
