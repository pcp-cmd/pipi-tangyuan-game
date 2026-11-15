/** Display and input preferences are separate from every journey save. */
export const PREFERENCES_KEY = 'pipi.preferences';
export const DEFAULT_PREFERENCES = Object.freeze({ schema: 1, keyboard: 'wasd', motion: 'system', textSize: 17, codeSize: 17 });
const ARROW_MOVEMENT = Object.freeze({ ArrowUp: 'w', ArrowLeft: 'a', ArrowDown: 's', ArrowRight: 'd' });

const bounded = (value, min, max, fallback) => Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function normalizePreferences(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) && value.schema === 1 ? value : {};
  return Object.freeze({
    schema: 1,
    keyboard: ['wasd', 'arrows'].includes(source.keyboard) ? source.keyboard : 'wasd',
    motion: ['system', 'reduce', 'full'].includes(source.motion) ? source.motion : 'system',
    textSize: bounded(source.textSize, 15, 21, 17),
    codeSize: bounded(source.codeSize, 14, 26, 17),
  });
}

/** Canonical movement letters; modifiers and focused element belong to the caller. */
export function mapMovementKey(key, keyboard = 'wasd') {
  if (typeof key !== 'string') return null;
  if (keyboard === 'arrows') return Object.hasOwn(ARROW_MOVEMENT, key) ? ARROW_MOVEMENT[key] : null;
  return ['w', 'a', 's', 'd'].includes(key.toLowerCase()) ? key.toLowerCase() : null;
}

export function mountJournalPreferences({ root, storage, systemMotion, onChange = () => {} }) {
  if (!root?.ownerDocument || typeof onChange !== 'function') throw new TypeError('A preferences root and callback are required.');
  const doc = root.ownerDocument, win = doc.defaultView;
  const find = id => root.querySelector(`#${id}`);
  const controls = { keyboard: find('journalKeyboard'), motion: find('journalMotion'), textSize: find('journalTextSize'), codeSize: find('journalCodeSize') };
  const outputs = { textSize: find('journalTextSizeValue'), codeSize: find('journalCodeSizeValue') };
  const reset = find('journalPreferencesReset'), status = find('journalPreferencesStatus'), keyboardHelp = find('journalKeyboardHelp');
  if (Object.values(controls).some(node => !node) || Object.values(outputs).some(node => !node) || !reset || !status || !keyboardHelp) {
    throw new TypeError('The preferences controls are incomplete.');
  }
  let store = storage;
  if (store === undefined) { try { store = win?.localStorage; } catch { store = null; } }
  const system = systemMotion || win?.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches: false };
  let value = DEFAULT_PREFERENCES, disposed = false;
  try {
    const raw = store?.getItem(PREFERENCES_KEY);
    if (raw) value = normalizePreferences(JSON.parse(raw));
  } catch { status.textContent = '显示设置暂不能读取，先使用默认值。'; }

  const motionListeners = new Set();
  const reduced = () => value.motion === 'reduce' || (value.motion === 'system' && system.matches);
  let priorMotion = reduced();
  const motionPreference = Object.freeze({
    get matches() { return reduced(); },
    addEventListener(type, listener) { if (type === 'change' && typeof listener === 'function') motionListeners.add(listener); },
    removeEventListener(type, listener) { if (type === 'change') motionListeners.delete(listener); },
  });

  function apply(notify = false) {
    const reducedMotion = reduced();
    for (const [name, control] of Object.entries(controls)) control.value = String(value[name]);
    for (const [name, output] of Object.entries(outputs)) output.textContent = String(value[name]);
    doc.documentElement.style.setProperty('--text-body', `${value.textSize}px`);
    doc.documentElement.style.setProperty('--text-control', `${value.textSize}px`);
    doc.documentElement.style.setProperty('--text-small', `${Math.max(14, value.textSize - 2)}px`);
    doc.documentElement.style.setProperty('--text-code', `${value.codeSize}px`);
    doc.documentElement.style.setProperty('--text-code-large', `${value.codeSize + 4}px`);
    doc.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
    doc.documentElement.dataset.keyboardLayout = value.keyboard;
    keyboardHelp.textContent = `${value.keyboard === 'arrows' ? '方向键' : 'W A S D'}行走 · E 互动 · Esc 停下`;
    if (reducedMotion !== priorMotion) {
      priorMotion = reducedMotion;
      const event = Object.freeze({ type: 'change', matches: reducedMotion, media: '(prefers-reduced-motion: reduce)', target: motionPreference });
      for (const listener of [...motionListeners]) listener(event);
    }
    if (notify) onChange(value);
  }

  function commit(next) {
    if (disposed) return;
    value = normalizePreferences(next);
    apply(true);
    try {
      if (!store) throw new Error('No preference storage.');
      store.setItem(PREFERENCES_KEY, JSON.stringify(value));
      status.textContent = '';
    } catch { status.textContent = '本次设置已应用，暂未保存；关闭页面后可能恢复默认。'; }
  }
  const handlers = [];
  for (const [name, control] of Object.entries(controls)) {
    const type = name.endsWith('Size') ? 'input' : 'change';
    const handler = () => commit({ ...value, [name]: name.endsWith('Size') ? Number(control.value) : control.value });
    control.addEventListener(type, handler); handlers.push([control, type, handler]);
  }
  const restoreDefaults = () => commit(DEFAULT_PREFERENCES);
  const systemChanged = () => { if (!disposed) apply(true); };
  const storageChanged = event => {
    if (disposed || event.key !== PREFERENCES_KEY || (event.storageArea && event.storageArea !== store)) return;
    try { value = event.newValue ? normalizePreferences(JSON.parse(event.newValue)) : DEFAULT_PREFERENCES; apply(true); status.textContent = ''; }
    catch { status.textContent = '另一页面的显示设置无法读取，保留当前设置。'; }
  };
  reset.addEventListener('click', restoreDefaults);
  system.addEventListener?.('change', systemChanged);
  win?.addEventListener?.('storage', storageChanged);
  apply();
  return Object.freeze({
    get value() { return value; },
    motionPreference,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const [control, type, handler] of handlers) control.removeEventListener(type, handler);
      reset.removeEventListener('click', restoreDefaults);
      system.removeEventListener?.('change', systemChanged);
      win?.removeEventListener?.('storage', storageChanged);
      motionListeners.clear();
    },
  });
}
