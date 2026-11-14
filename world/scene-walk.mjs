// A hand-authored network on the existing island illustration, not a navmesh.
// Only feet follow these paths. There is no arbitrary terrain click-to-walk,
// sprite-body collision, dynamic obstacle avoidance, game state or storage here.
const rawNodes = {
  start: [825, 800], low: [855, 740], bend: [875, 675], fork: [915, 610],
  east: [1015, 565], shop: [1110, 530], upper: [1080, 515], west: [970, 575],
  field: [1205, 545], campOld: [1240, 645], pier: [610, 825],
  pierJoin: [735, 825], harborWait: [650, 825], harbor: [550, 825],
  stairs: [755, 465], stairJoin: [730, 490], hill: [805, 535], lighthouse: [785, 420],
  workshop: [1110, 500], campJoin: [1140, 545], campSouth: [1145, 670],
  campTurn: [1240, 680], camp: [1290, 670],
};
export const WALK_NODES = Object.freeze(Object.fromEntries(Object.entries(rawNodes).map(([id, p]) => [id, Object.freeze({ x: p[0], y: p[1] })])));
export const WALK_EDGES = Object.freeze([
  ['start', 'low'], ['low', 'bend'], ['bend', 'fork'], ['fork', 'east'],
  ['east', 'shop'], ['shop', 'upper'], ['fork', 'west'], ['west', 'east'],
  ['start', 'pierJoin'], ['pierJoin', 'harborWait'], ['harborWait', 'pier'], ['pier', 'harbor'],
  ['fork', 'hill'], ['hill', 'stairJoin'], ['stairJoin', 'stairs'], ['stairs', 'lighthouse'],
  ['shop', 'workshop'], ['shop', 'campJoin'], ['campJoin', 'field'],
  ['campJoin', 'campSouth'], ['campSouth', 'campTurn'], ['campTurn', 'campOld'], ['campTurn', 'camp'],
].map(edge => Object.freeze(edge)));
export const WALK_PLACES = Object.freeze({
  harbor: Object.freeze(['harbor', 'harborWait']), workshop: Object.freeze(['workshop', 'east']),
  lighthouse: Object.freeze(['lighthouse', 'stairJoin']), camp: Object.freeze(['camp', 'campSouth']),
});
// Conservative protected feet areas inspected against scene-background.png.
// These are explicit routing guards, not a claim about every illustrated pixel.
export const WALK_BLOCKS = Object.freeze([
  { id: 'open-sea', left: 0, top: 0, right: 570, bottom: 700 },
  { id: 'workshop-building', left: 870, top: 260, right: 1260, bottom: 490 },
  { id: 'lighthouse-building', left: 735, top: 0, right: 880, bottom: 390 },
  { id: 'northern-cliff', left: 920, top: 0, right: 1487, bottom: 250 },
  { id: 'camp-tent', left: 1265, top: 450, right: 1460, bottom: 625 },
  { id: 'campfire', left: 1165, top: 570, right: 1230, bottom: 635 },
  { id: 'fence', left: 1005, top: 585, right: 1110, bottom: 650 },
].map(Object.freeze));
const validPoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1487 && p.y >= 0 && p.y <= 1058;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function segmentClear(a, b) {
  if (!validPoint(a) || !validPoint(b)) return false;
  return WALK_BLOCKS.every(r => {
    let lo = 0, hi = 1;
    for (const [origin, delta, min, max] of [[a.x, b.x - a.x, r.left, r.right], [a.y, b.y - a.y, r.top, r.bottom]]) {
      if (delta === 0) { if (origin < min || origin > max) return true; }
      else { const ends = [(min - origin) / delta, (max - origin) / delta].sort((x, y) => x - y); lo = Math.max(lo, ends[0]); hi = Math.min(hi, ends[1]); }
      if (lo > hi) return true;
    }
    return false;
  });
}
// The old same-tile ±90px art offset can put a companion inside the fence or
// tent. Keep the logical tile, but shorten only that visual separation until
// the whole connector clears the protected feet areas.
export function boardActorPoint(point, offset = 0) {
  const start = { x: point?.[0], y: point?.[1] };
  if (!validPoint(start) || !Number.isFinite(offset) || Math.abs(offset) > 90 || !segmentClear(start, start)) throw new RangeError('Invalid board anchor');
  for (let amount = Math.abs(offset); amount >= 0; amount = Math.max(0, amount - 10)) {
    const end = { x: start.x + Math.sign(offset) * amount, y: start.y };
    if (segmentClear(start, end)) return end;
    if (!amount) break;
  }
  return start;
}
function project(point, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));
  return { x: a.x + dx * t, y: a.y + dy * t };
}
function shortest(from, to) {
  const costs = new Map([[from, 0]]), parents = new Map(), pending = new Set(Object.keys(WALK_NODES));
  while (pending.size) {
    const current = [...pending].sort((a, b) => (costs.get(a) ?? Infinity) - (costs.get(b) ?? Infinity))[0];
    if (!costs.has(current)) break;
    pending.delete(current);
    if (current === to) { const result = [to]; while (result[0] !== from) result.unshift(parents.get(result[0])); return { cost: costs.get(to), nodes: result }; }
    for (const [a, b] of WALK_EDGES) {
      const next = a === current ? b : b === current ? a : null;
      if (!pending.has(next)) continue;
      const cost = costs.get(current) + distance(WALK_NODES[current], WALK_NODES[next]);
      if (cost < (costs.get(next) ?? Infinity)) { costs.set(next, cost); parents.set(next, current); }
    }
  }
  throw new RangeError('Disconnected authored walk route');
}
export function pathToPlace(start, placeId, { follower = false } = {}) {
  if (!validPoint(start) || !Object.hasOwn(WALK_PLACES, placeId)) return null;
  const target = WALK_PLACES[placeId][follower ? 1 : 0];
  // Join the nearest safe segment. Initial board art can be up to 90px beside
  // the path; arbitrary distant/blocked origins are refused, never teleported.
  const joins = WALK_EDGES.map(([a, b]) => {
    const point = project(start, WALK_NODES[a], WALK_NODES[b]);
    return { a, b, point, gap: distance(start, point) };
  }).filter(join => join.gap <= 100 && segmentClear(start, join.point)).sort((a, b) => a.gap - b.gap);
  if (!joins.length) return null;
  const join = joins[0];
  const options = [join.a, join.b].map(id => { const path = shortest(id, target); return { ...path, cost: path.cost + distance(join.point, WALK_NODES[id]) }; }).sort((a, b) => a.cost - b.cost);
  const points = [{ ...start }, join.point, ...options[0].nodes.map(id => ({ ...WALK_NODES[id] }))]
    .filter((p, i, all) => !i || distance(p, all[i - 1]) > .000001);
  if (!points.every((p, i) => !i || segmentClear(points[i - 1], p))) return null;
  return points;
}
export const pathLength = points => points.reduce((n, p, i) => n + (i ? distance(points[i - 1], p) : 0), 0);
export function pathFrame(points, travel) {
  if (!Array.isArray(points) || !points.length || !points.every(validPoint) || !Number.isFinite(travel) || travel < 0) throw new RangeError('Invalid walk frame');
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], length = distance(a, b);
    if (travel < length) return { x: a.x + (b.x - a.x) * travel / length, y: a.y + (b.y - a.y) * travel / length, dx: b.x - a.x, segment: i, remaining: length - travel, done: false };
    travel -= length;
  }
  return { ...points.at(-1), dx: 0, segment: points.length, remaining: 0, done: true };
}

export function createSceneWalk({ render, onStatus = () => {}, now = () => performance.now(), requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame, speed = 220 } = {}) {
  if (typeof render !== 'function' || !Number.isFinite(speed) || speed <= 0) throw new TypeError('Invalid walk controller');
  let frame = null, generation = 0, active = false, disposed = false, positions = null;
  const clear = () => { if (frame !== null) cancelFrame(frame); frame = null; };
  function stop() { ++generation; clear(); const wasActive = active; active = false; if (wasActive) onStatus(false); return wasActive; }
  return Object.freeze({
    start(paths, { reducedMotion = false, onArrive = () => {} } = {}) {
      if (disposed) return false;
      if (!paths || Object.keys(paths).length !== 2 || !['pipi', 'tangyuan'].every(cat => Array.isArray(paths[cat]) && paths[cat].length && paths[cat].every(validPoint))) throw new RangeError('Both companion paths required');
      const routes = Object.fromEntries(Object.entries(paths).map(([cat, points]) => [cat, points.map(p => ({ ...p }))]));
      stop(); const token = generation, start = now(); active = true; onStatus(true);
      const tick = () => {
        frame = null;
        if (disposed || token !== generation || !active) return;
        const travel = reducedMotion ? Number.MAX_VALUE : Math.max(0, now() - start) * speed / 1000;
        positions = Object.fromEntries(Object.entries(routes).map(([cat, path]) => [cat, { ...pathFrame(path, travel), speed }]));
        render(structuredClone(positions));
        if (disposed || token !== generation || !active) return;
        if (Object.values(positions).every(p => p.done)) { active = false; onStatus(false); if (token === generation && !disposed) onArrive(); }
        else frame = requestFrame(tick);
      };
      tick(); return true;
    },
    stop,
    snapshot: () => ({ active, scheduled: frame !== null, disposed, positions: positions && structuredClone(positions) }),
    reset() { stop(); positions = null; },
    dispose() { stop(); disposed = true; },
  });
}
