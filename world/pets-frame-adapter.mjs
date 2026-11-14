import { frameRect } from './pets-animation-contract.mjs';

export const PETS_LEFT_FRAME_POLICY = Object.freeze({
  pipi: 'mirror-right-cell', tangyuan: 'mirror-right-cell',
});

export function petFrameSource(cat, frame, { originalLeft = false } = {}) {
  if (!Object.hasOwn(PETS_LEFT_FRAME_POLICY, cat)) throw new RangeError('Unknown companion');
  const mirrored = frame.state === 'running-left' && !originalLeft;
  const row = mirrored ? 1 : frame.row;
  return Object.freeze({ row, column: frame.column, mirrored, rect: frameRect(row, frame.column) });
}

export const PETS_GAZE_CALIBRATION = Object.freeze({
  pipi: Object.freeze({ screenRightIndex: 4, clockwise: 1 }),
  tangyuan: Object.freeze({ screenRightIndex: 4, clockwise: 1 }),
});
const normalize = angle => ((angle % 360) + 360) % 360;
const difference = (a, b) => ((a - b + 540) % 360) - 180;

export function gazeFrameForAngle(cat, angle, previous = null, hysteresis = 2) {
  const calibration = PETS_GAZE_CALIBRATION[cat];
  if (!calibration) throw new RangeError('Unknown companion');
  if (!Number.isFinite(angle)) return null;
  if (!Number.isFinite(hysteresis) || hysteresis < 0 || hysteresis >= 11.25) throw new RangeError('Invalid gaze hysteresis');
  const screenAngle = normalize(angle);
  let screenIndex = Math.round(screenAngle / 22.5) % 16;
  if (Number.isInteger(previous?.screenIndex) && Math.abs(difference(screenAngle, previous.screenIndex * 22.5)) <= 11.25 + hysteresis) screenIndex = previous.screenIndex;
  const index = (calibration.screenRightIndex + calibration.clockwise * screenIndex + 16) % 16;
  const row = 9 + Math.floor(index / 8), column = index % 8;
  return Object.freeze({ state: 'gaze', screenIndex, angleDegrees: screenIndex * 22.5, row, column, rect: frameRect(row, column) });
}

export function worldGazeAngle(origin, target) {
  if (![origin?.x, origin?.y, target?.x, target?.y].every(Number.isFinite)) return null;
  const dx = target.x - origin.x, dy = target.y - origin.y;
  return Math.hypot(dx, dy) > 1e-7 ? Math.atan2(dy, dx) * 180 / Math.PI : null;
}

export function clientPointInWorld(client, viewport, camera) {
  if (![client?.x, client?.y, viewport?.left, viewport?.top, camera?.x, camera?.y, camera?.scale].every(Number.isFinite) || camera.scale <= 0) return null;
  return { x: (client.x - viewport.left - camera.x) / camera.scale, y: (client.y - viewport.top - camera.y) / camera.scale };
}
