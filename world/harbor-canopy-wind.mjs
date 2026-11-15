/* Leaf-only replacement pixels from the original harbor plate. The source art
 * remains unchanged. Fixed trunk strips, roots, blue sky and patch boundaries
 * retain their original pixels; no translucent second tree is ever layered. */
const region = (id, x, y, width, height, phase, trunk, rows) => Object.freeze({
  id, x, y, width, height, phase, trunk: Object.freeze(trunk), rows: Object.freeze(rows.map(Object.freeze)),
});
export const CANOPIES = Object.freeze([
  region('lighthouse-pine', 628, 120, 125, 201, 0, [703, 723], [
    [133, 704, 716, 0], [151, 697, 725, .8], [172, 665, 740, .94],
    [208, 639, 748, .79], [235, 637, 749, .59], [267, 636, 748, .39],
    [292, 647, 743, .17], [319, 662, 736, 0],
  ]),
  region('shore-pine', 532, 252, 124, 166, 12, [597, 612], [
    [252, 578, 620, 0], [269, 577, 621, .97], [297, 556, 631, .91],
    [326, 548, 644, .76], [351, 542, 648, .59], [378, 536, 645, .36],
    [401, 549, 628, .15], [416, 561, 624, 0],
  ]),
]);
export const FIELD = Object.freeze({ x: 532, y: 120, width: 221, height: 298 });
export const TICK_MS = 125;
// A six-second breath with a resting interval. The smaller tree starts 1.5s later.
export const WIND_OFFSETS = Object.freeze([
  0,0,0,0,0,0,.5,1,1.5,2,2,1.5,1,.5,0,-.5,-.5,0,0,0,0,0,.5,1,
  2,3,3.5,3.5,3,2,1.5,1,.5,0,-.5,-1,-.5,0,0,0,0,0,0,0,0,0,0,0,
]);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function rowAt(rows, y) {
  if (y <= rows[0][0] || y >= rows.at(-1)[0]) return null;
  const i = rows.findIndex(row => row[0] >= y), a = rows[i - 1], b = rows[i], t = (y - a[0]) / (b[0] - a[0]);
  return a.slice(1).map((v, k) => v + (b[k + 1] - v) * t);
}
export function offsetsFor(tick) { return CANOPIES.map(({ phase }) => WIND_OFFSETS[(tick + phase) % WIND_OFFSETS.length]); }

// This art's leaves are green/ochre; distant water and sky are blue/violet.
// Six source pixels around a leaf edge allow it to reveal the same painted sky,
// with a smooth, invertible displacement instead of leaving the old silhouette.
function leafInfluence(original, width, height) {
  const mask = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
    const p = 4 * (y * width + x), r = original[p], g = original[p + 1], b = original[p + 2];
    if (!(b + 12 < g && b + 12 < r)) continue;
    for (let dx = -6; dx <= 6; dx++) {
      const n = x + dx;
      if (n > 0 && n < width - 1) mask[y * width + n] = Math.max(mask[y * width + n], 1 - smooth(1, 7, Math.abs(dx)));
    }
  }
  return mask;
}
export function makeFrame({ x, y, width, height, rows, trunk }, original, displacement, influence = leafInfluence(original, width, height)) {
  if (original.length !== width * height * 4) throw new Error('Canopy dimensions differ from the source.');
  const result = new Uint8ClampedArray(original);
  if (!displacement) return result;
  for (let j = 1; j < height - 1; j++) {
    const row = rowAt(rows, j + y);
    if (!row) continue;
    const [left, right, strength] = row;
    for (let i = 1; i < width - 1; i++) {
      const actualX = x + i;
      const fixedTrunk = actualX >= trunk[0] && actualX <= trunk[1];
      if (fixedTrunk) continue;
      const side = Math.min(smooth(left, left + 12, actualX), 1 - smooth(right - 12, right, actualX));
      const attach = actualX < trunk[0] ? 1 - smooth(trunk[0] - 12, trunk[0], actualX) : smooth(trunk[1], trunk[1] + 12, actualX);
      const shift = displacement * strength * side * attach * influence[j * width + i];
      if (!shift) continue;
      const sample = Math.max(0, Math.min(width - 1, i - shift)), lo = Math.floor(sample), hi = Math.min(width - 1, lo + 1), blend = sample - lo;
      for (let c = 0; c < 4; c++) result[4 * (j * width + i) + c] = original[4 * (j * width + lo) + c] * (1 - blend) + original[4 * (j * width + hi) + c] * blend;
    }
  }
  return result;
}
export function prepareComposite(original) {
  if (original.length !== FIELD.width * FIELD.height * 4) throw new Error('Harbor canopy field mismatch.');
  const bytes = new Uint8ClampedArray(original), original32 = new Uint32Array(bytes.buffer);
  const overlays = CANOPIES.map(item => {
    const source = new Uint8ClampedArray(item.width * item.height * 4);
    for (let y = 0; y < item.height; y++) {
      const start = 4 * ((item.y - FIELD.y + y) * FIELD.width + item.x - FIELD.x);
      source.set(bytes.subarray(start, start + item.width * 4), 4 * y * item.width);
    }
    const influence = leafInfluence(source, item.width, item.height), prior = new Uint32Array(source.buffer), frames = new Map();
    for (const offset of new Set(WIND_OFFSETS)) {
      const after = new Uint32Array(makeFrame(item, source, offset, influence).buffer), idx = [], values = [];
      for (let n = 0; n < after.length; n++) if (after[n] !== prior[n]) {
        idx.push((item.y - FIELD.y + Math.floor(n / item.width)) * FIELD.width + item.x - FIELD.x + n % item.width);
        values.push(after[n]);
      }
      frames.set(offset, { idx: Uint32Array.from(idx), values: Uint32Array.from(values) });
    }
    return frames;
  });
  return { original32, overlays };
}
export function composeFrame({ original32, overlays }, offsets, target) {
  const out = new Uint32Array(target.buffer, target.byteOffset, target.length / 4);
  out.set(original32);
  offsets.forEach((offset, i) => {
    const { idx, values } = overlays[i].get(offset);
    for (let n = 0; n < idx.length; n++) out[idx[n]] = values[n];
  });
  return target;
}
function currentHarbor(world, source) {
  return world.dataset.physicalScene === 'harbor.exterior' && source.complete && source.naturalWidth === 1487 && source.naturalHeight === 1058 &&
    [source.currentSrc, source.src].every(url => /\/assets\/scene-background\.webp(?:\?.*)?$/.test(url));
}
export function mountHarborCanopyWind({ document: doc = document, window: win = window, motionPreference = win.matchMedia('(prefers-reduced-motion: reduce)') } = {}) {
  const world = doc.getElementById('world'), source = doc.getElementById('sceneBackground');
  if (!world || !source) return Object.freeze({ dispose() {} });
  let patch = null, timer = null, tick = 0, available = true, disposed = false;
  function clear() {
    if (timer !== null) win.clearInterval(timer);
    timer = null; tick = 0;
    patch?.canvas.remove();
  }
  function draw() {
    const offsets = offsetsFor(tick++);
    if (offsets[0] === patch.offsets?.[0] && offsets[1] === patch.offsets?.[1]) return;
    composeFrame(patch.prepared, offsets, patch.frame.data);
    patch.ctx.putImageData(patch.frame, 0, 0); patch.offsets = offsets;
  }
  function refresh() {
    if (disposed || motionPreference.matches || doc.hidden || !currentHarbor(world, source)) { clear(); return; }
    if (timer !== null || !available) return;
    if (!patch) try {
      const { x, y, width, height } = FIELD, canvas = doc.createElement('canvas');
      canvas.className = 'harbor-canopy-wind'; canvas.setAttribute('aria-hidden', 'true');
      canvas.width = width; canvas.height = height; canvas.style.left = `${x}px`; canvas.style.top = `${y}px`;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!ctx) throw new Error('Canvas unavailable.');
      ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
      patch = { canvas, ctx, frame: ctx.createImageData(width, height), prepared: prepareComposite(ctx.getImageData(0, 0, width, height).data) };
    } catch { available = false; return; }
    patch.offsets = null; draw(); world.insertBefore(patch.canvas, source.nextSibling);
    timer = win.setInterval(draw, TICK_MS);
  }
  const observer = new win.MutationObserver(refresh);
  observer.observe(world, { attributes: true, attributeFilter: ['data-physical-scene'] });
  observer.observe(source, { attributes: true, attributeFilter: ['src'] });
  source.addEventListener('load', refresh); doc.addEventListener('visibilitychange', refresh);
  motionPreference.addEventListener?.('change', refresh);
  win.addEventListener('pagehide', clear); win.addEventListener('pageshow', refresh);
  refresh();
  return Object.freeze({ dispose() {
    disposed = true; clear(); patch = null; observer.disconnect(); source.removeEventListener('load', refresh);
    doc.removeEventListener('visibilitychange', refresh); motionPreference.removeEventListener?.('change', refresh);
    win.removeEventListener('pagehide', clear); win.removeEventListener('pageshow', refresh);
  } });
}
