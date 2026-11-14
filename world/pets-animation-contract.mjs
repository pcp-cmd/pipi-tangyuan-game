// Source-independent candidate adapter. It does not mutate original sprite bytes.
// Column counts and timing match the current Pets v2 row reference.
export const PETS_V2_GEOMETRY = Object.freeze({ width: 1536, height: 2288, columns: 8, rows: 11, frameWidth: 192, frameHeight: 208 });
const row = (index, durations) => Object.freeze({ row: index, durations: Object.freeze(durations) });
export const PETS_V2_ANIMATIONS = Object.freeze({
  idle: row(0, [280, 110, 110, 140, 140, 320]),
  'running-right': row(1, [120, 120, 120, 120, 120, 120, 120, 220]),
  'running-left': row(2, [120, 120, 120, 120, 120, 120, 120, 220]),
  waving: row(3, [140, 140, 140, 280]),
  jumping: row(4, [140, 140, 140, 140, 280]),
  failed: row(5, [140, 140, 140, 140, 140, 140, 140, 240]),
  waiting: row(6, [150, 150, 150, 150, 150, 260]),
  running: row(7, [120, 120, 120, 120, 120, 220]),
  review: row(8, [150, 150, 150, 150, 150, 280]),
});

export function frameRect(rowIndex, column) {
  if (!Number.isInteger(rowIndex) || !Number.isInteger(column) || rowIndex < 0 || rowIndex >= 11 || column < 0 || column >= 8) throw new RangeError('Invalid Pets v2 frame');
  return Object.freeze({ x: column * 192, y: rowIndex * 208, width: 192, height: 208 });
}

export function animationFrameAt(state, elapsedMs, { loop = true, reducedMotion = false } = {}) {
  const animation = PETS_V2_ANIMATIONS[state];
  if (!animation) throw new RangeError('Unknown Pets animation state');
  if (reducedMotion) return Object.freeze({ state: 'idle', row: 0, column: 0, rect: frameRect(0, 0) });
  const total = animation.durations.reduce((a, b) => a + b, 0);
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  let t = loop ? elapsed % total : Math.min(elapsed, total);
  let column = animation.durations.length - 1;
  for (let i = 0; i < animation.durations.length; i++) {
    if (t < animation.durations[i]) { column = i; break; }
    t -= animation.durations[i];
  }
  return Object.freeze({ state, row: animation.row, column, rect: frameRect(animation.row, column) });
}

// These are animation choices, never a movement or collision engine.
// A failed/unknown direction must not silently start the task-working row.
export function locomotionAnimation(direction) {
  if (direction === 'left') return 'running-left';
  if (direction === 'right') return 'running-right';
  throw new RangeError('Only approved side-facing locomotion rows are mapped');
}

// Look poses are gaze directions, not full-body compass-facing walk cycles.
export function lookDirectionFrame(angleDegrees) {
  if (!Number.isFinite(angleDegrees)) throw new RangeError('Look angle must be finite');
  const a = ((angleDegrees % 360) + 360) % 360;
  const index = Math.round(a / 22.5) % 16;
  const rowIndex = 9 + Math.floor(index / 8), column = index % 8;
  return Object.freeze({ angleDegrees: index * 22.5, row: rowIndex, column, rect: frameRect(rowIndex, column) });
}
