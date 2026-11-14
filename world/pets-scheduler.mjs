import { PETS_V2_ANIMATIONS, animationFrameAt } from './pets-animation-contract.mjs';
import { gazeFrameForAngle } from './pets-frame-adapter.mjs';

const cats = ['pipi', 'tangyuan'];
const ownerFields = ['journeyInstanceId', 'epoch', 'navigation', 'physicalSceneId', 'cat', 'lessonId', 'editorRevision'];
const totalDuration = state => PETS_V2_ANIMATIONS[state].durations.reduce((a, b) => a + b, 0);

export function createPetScheduler({ render, now = () => performance.now(), setTimer = setTimeout, clearTimer = clearTimeout, visible = true, reducedMotion = false } = {}) {
  if (typeof render !== 'function') throw new TypeError('A render callback is required');
  const records = new Map(cats.map(cat => [cat, { enabled: false, visible: true, busy: false, baseStart: now(), motion: null, facing: 'right', last: null, run: null, oneShot: null, review: false, gaze: null }]));
  let timer = null, disposed = false, owner = null, ownerKey = '', serial = 0;
  const get = cat => { if (!records.has(cat)) throw new RangeError('Unknown companion'); return records.get(cat); };
  const clear = () => { if (timer !== null) clearTimer(timer); timer = null; };
  const current = token => !disposed && owner !== null && token === owner;
  const currentRun = token => current(token?.owner) && records.get(token.cat)?.run?.token === token;
  const clearBrief = record => { record.oneShot = null; record.gaze = null; };
  const resetActivity = record => { clearBrief(record); record.run = null; record.review = false; record.busy = false; };
  function stateAt(record, time) {
    if (record.motion && time >= record.motion.until) { record.motion = null; record.baseStart = time; }
    if (record.oneShot && time >= record.oneShot.until) { record.oneShot = null; record.baseStart = time; }
    if (record.motion) return { state: `running-${record.facing}`, start: record.motion.start, until: record.motion.until };
    if (record.run) return { state: record.run.phase, start: record.run.start };
    if (record.busy) return { state: 'running', start: record.baseStart };
    if (record.oneShot) return { state: record.oneShot.state, start: record.oneShot.start, until: record.oneShot.until, once: true };
    if (record.review) return { state: 'review', start: record.baseStart };
    if (record.gaze) return { state: 'gaze', frame: record.gaze };
    return { state: 'idle', start: record.baseStart };
  }
  function tick() {
    clear();
    if (disposed || !visible) return;
    const time = now();
    let next = Infinity;
    for (const [cat, record] of records) {
      if (!record.enabled || !record.visible) continue;
      const selected = stateAt(record, time);
      const frame = reducedMotion ? animationFrameAt('idle', 0) : selected.frame ?? animationFrameAt(selected.state, time - selected.start, { loop: !selected.once });
      const key = `${frame.state}:${frame.row}:${frame.column}`;
      if (record.last !== key) { render(cat, frame); record.last = key; }
      if (reducedMotion || selected.frame) continue;
      const durations = PETS_V2_ANIMATIONS[selected.state].durations;
      const total = totalDuration(selected.state);
      const elapsed = selected.once ? Math.max(0, time - selected.start) : Math.max(0, time - selected.start) % total;
      const boundary = durations.slice(0, frame.column + 1).reduce((a, b) => a + b, 0);
      next = Math.min(next, Math.max(1, boundary - elapsed), selected.until ? Math.max(1, selected.until - time) : Infinity);
    }
    if (Number.isFinite(next)) timer = setTimer(tick, next);
  }
  function oneShot(cat, state, key) {
    const record = get(cat);
    if (disposed || !visible || reducedMotion || !record.enabled || !record.visible || record.motion || record.run || record.busy) return false;
    if (record.oneShot?.key === key || (state === 'waving' && ['jumping', 'failed', 'waving'].includes(record.oneShot?.state))) return false;
    const time = now(); record.gaze = null;
    record.oneShot = { state, key, start: time, until: time + totalDuration(state) };
    tick(); return true;
  }
  const api = {
    setContext(context) {
      if (disposed) return null;
      if (!context || !cats.includes(context.cat) || ownerFields.some(field => !['string', 'number'].includes(typeof context[field]) || (typeof context[field] === 'number' && !Number.isFinite(context[field])))) throw new TypeError('A complete visual owner is required');
      const key = JSON.stringify(ownerFields.map(field => context[field]));
      if (key === ownerKey) return owner;
      ownerKey = key; owner = Object.freeze(Object.fromEntries(ownerFields.map(field => [field, context[field]])));
      for (const record of records.values()) resetActivity(record);
      tick(); return owner;
    },
    contextToken: () => owner,
    beginRun(token = owner) {
      if (!current(token)) return null;
      for (const record of records.values()) resetActivity(record);
      const runToken = Object.freeze({ owner: token, cat: token.cat, serial: ++serial, kind: 'run' });
      get(token.cat).run = { token: runToken, phase: 'waiting', start: now() };
      tick(); return runToken;
    },
    beginWait(token = owner) {
      if (!current(token) || [...records.values()].some(record => record.run?.token.kind === 'run')) return null;
      for (const record of records.values()) resetActivity(record);
      const waitToken = Object.freeze({ owner: token, cat: token.cat, serial: ++serial, kind: 'wait' });
      get(token.cat).run = { token: waitToken, phase: 'waiting', start: now() };
      tick(); return waitToken;
    },
    endWait(token) {
      if (!currentRun(token) || token.kind !== 'wait') return false;
      const record = get(token.cat); record.run = null; record.baseStart = now(); tick(); return true;
    },
    setRunPhase(token, phase) {
      if (!currentRun(token) || token.kind !== 'run' || !['waiting', 'running'].includes(phase)) return false;
      const run = get(token.cat).run;
      if (run.phase !== phase) { run.phase = phase; run.start = now(); tick(); }
      return true;
    },
    completeRun(token, { status, saved } = {}) {
      if (!currentRun(token) || token.kind !== 'run') return false;
      const record = get(token.cat); record.run = null; record.baseStart = now();
      const state = status === 'success' && saved === true ? 'jumping' : ['incorrect', 'python-error'].includes(status) ? 'failed' : null;
      if (!state || !oneShot(token.cat, state, token)) tick();
      return true;
    },
    cancelRun(token) {
      if (disposed || (token !== undefined && !currentRun(token))) return false;
      for (const record of records.values()) { record.run = null; record.busy = false; clearBrief(record); }
      tick(); return true;
    },
    setReview(value, token = owner) {
      if (!current(token)) return false;
      const record = get(token.cat);
      if (record.review !== Boolean(value)) { record.review = Boolean(value); record.baseStart = now(); record.gaze = null; tick(); }
      return true;
    },
    wave(cat, token = owner) { return current(token) && oneShot(cat, 'waving', `wave:${++serial}`); },
    look(cat, angle, token = owner) {
      if (!current(token)) return false;
      const record = get(cat);
      if (record.motion || record.run || record.busy || record.oneShot || record.review || !visible || reducedMotion) return false;
      const frame = gazeFrameForAngle(cat, angle, record.gaze);
      if (!frame) return false;
      record.gaze = frame; tick(); return true;
    },
    clearLook(cat) { const record = get(cat); if (disposed || !record.gaze) return; record.gaze = null; record.baseStart = now(); tick(); },
    setMotion(cat, { moving, facing } = {}) {
      const record = get(cat); if (disposed) return;
      if (!['left', 'right'].includes(facing) || typeof moving !== 'boolean') throw new TypeError('A physical pose is required');
      const wasMoving = Boolean(record.motion), turned = facing !== record.facing;
      record.facing = facing;
      if (moving) { clearBrief(record); if (!record.motion) record.motion = { start: now(), until: Infinity }; else record.motion.until = Infinity; }
      else if (record.motion) { record.motion = null; record.baseStart = now(); }
      if (wasMoving !== moving || turned) tick();
    },
    setEnabled(cat, value) { const record = get(cat); if (disposed || record.enabled === Boolean(value)) return; record.enabled = Boolean(value); record.last = null; record.baseStart = now(); if (!record.enabled) clearBrief(record); tick(); },
    setCatVisible(cat, value) { const record = get(cat); if (disposed || record.visible === Boolean(value)) return; record.visible = Boolean(value); record.last = null; if (!record.visible) clearBrief(record); tick(); },
    refresh(cat) { const record = get(cat); if (disposed) return; record.last = null; tick(); },
    setBusy(cat, value) { const record = get(cat); if (disposed || record.busy === Boolean(value)) return; record.busy = Boolean(value); record.baseStart = now(); if (record.busy) clearBrief(record); tick(); },
    move(cat, { dx = 0, durationMs = 1200 } = {}) {
      const record = get(cat); if (disposed) return;
      if (!Number.isFinite(dx) || !Number.isFinite(durationMs) || durationMs < 0) throw new RangeError('Invalid visual movement');
      if (dx !== 0) record.facing = dx < 0 ? 'left' : 'right';
      const time = now(); record.motion = durationMs ? { start: time, until: time + durationMs } : null; clearBrief(record); tick();
    },
    stopMotion(cat) { const record = get(cat); if (disposed || !record.motion) return; record.motion = null; record.baseStart = now(); tick(); },
    setVisible(value) { if (disposed || visible === Boolean(value)) return; visible = Boolean(value); if (!visible) for (const record of records.values()) clearBrief(record); tick(); },
    setReducedMotion(value) { if (disposed || reducedMotion === Boolean(value)) return; reducedMotion = Boolean(value); for (const record of records.values()) { record.last = null; clearBrief(record); } tick(); },
    snapshot() { return { disposed, visible, reducedMotion, scheduled: timer !== null, owner, cats: Object.fromEntries([...records].map(([cat, record]) => [cat, { enabled: record.enabled, visible: record.visible, busy: record.busy, moving: Boolean(record.motion), facing: record.facing, state: stateAt(record, now()).state, runSerial: record.run?.token.serial ?? null, oneShot: record.oneShot?.state ?? null, review: record.review, gaze: record.gaze ? { row: record.gaze.row, column: record.gaze.column } : null }])) }; },
    dispose() { if (disposed) return; disposed = true; clear(); owner = null; for (const record of records.values()) resetActivity(record); },
  };
  return Object.freeze(api);
}
