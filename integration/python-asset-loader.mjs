import { codeDigest } from './contracts.mjs';
import { PYTHON_ASSETS } from './python-assets.mjs';

// Keep each download and its digest check together, with at most three in flight.
// Every new interpreter still verifies every asset before Python is initialized.
export async function loadVerifiedPythonAssets(readAsset) {
  const entries = Object.entries(PYTHON_ASSETS);
  const assets = {};
  let next = 0;
  let failed = false;
  async function loadNext() {
    while (!failed) {
      const entry = entries[next++];
      if (!entry) return;
      const [name, digest] = entry;
      try {
        const source = await readAsset(name);
        if (await codeDigest(source) !== digest) throw new Error(`Python asset mismatch: ${name}`);
        assets[name] = source;
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, entries.length) }, loadNext));
  return assets;
}
