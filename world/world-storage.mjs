import { INTEGRATED_SAVE_KEY } from '../integration/state.mjs';

export const WORLD_PREFIX = 'pipi-world-integration-v5:';
export const WORLD_SAVE_KEY = WORLD_PREFIX + INTEGRATED_SAVE_KEY;

export function createWorldStorage(nativeStorage, nativeLocks) {
  const keys = () => Array.from({ length: nativeStorage.length }, (_, index) => nativeStorage.key(index)).filter(key => typeof key === 'string' && key.startsWith(WORLD_PREFIX));
  const storage = {
    get length() { return keys().length; }, key: index => keys()[index]?.slice(WORLD_PREFIX.length) ?? null,
    // A fresh snapshot per operation avoids rebuilding the namespace for each
    // key in a legacy recovery scan. Never cache this across lock acquisitions.
    keys: () => keys().map(key => key.slice(WORLD_PREFIX.length)),
    getItem: key => nativeStorage.getItem(WORLD_PREFIX + key),
    setItem: (key, value) => nativeStorage.setItem(WORLD_PREFIX + key, value),
    removeItem: key => nativeStorage.removeItem(WORLD_PREFIX + key)
  };
  const locks = nativeLocks?.request ? { request: (key, callback) => nativeLocks.request(WORLD_PREFIX + key, callback) } : null;
  return { storage, locks };
}
