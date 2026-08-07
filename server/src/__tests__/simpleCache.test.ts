import { withCache, invalidateCache, clearAllCache } from '../utils/simpleCache';

beforeEach(() => {
  clearAllCache();
});

describe('withCache', () => {
  it('calls the loader once and reuses the cached value within the TTL', async () => {
    const loader = jest.fn().mockResolvedValue('value-1');

    const first = await withCache('key-1', 1000, loader);
    const second = await withCache('key-1', 1000, loader);

    expect(first).toBe('value-1');
    expect(second).toBe('value-1');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('reloads once the TTL has expired', async () => {
    const loader = jest.fn().mockResolvedValueOnce('value-1').mockResolvedValueOnce('value-2');

    const first = await withCache('key-2', 10, loader);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const second = await withCache('key-2', 10, loader);

    expect(first).toBe('value-1');
    expect(second).toBe('value-2');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('keeps separate keys independent', async () => {
    const loaderA = jest.fn().mockResolvedValue('a');
    const loaderB = jest.fn().mockResolvedValue('b');

    await withCache('key-a', 1000, loaderA);
    await withCache('key-b', 1000, loaderB);

    expect(loaderA).toHaveBeenCalledTimes(1);
    expect(loaderB).toHaveBeenCalledTimes(1);
  });
});

describe('invalidateCache', () => {
  it('forces the next call to reload', async () => {
    const loader = jest.fn().mockResolvedValueOnce('value-1').mockResolvedValueOnce('value-2');

    await withCache('key-3', 5000, loader);
    invalidateCache('key-3');
    const second = await withCache('key-3', 5000, loader);

    expect(second).toBe('value-2');
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
