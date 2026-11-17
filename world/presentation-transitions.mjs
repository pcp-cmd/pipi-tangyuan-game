export const PRESENTATION_DEFAULTS = Object.freeze({
  duration: 180, sceneDuration: 220, hoverBrightness: 1.08, pressedBrightness: .96, selectedBrightness: .94,
  paperSelectionBrightness: 1.06, paperSelectionColor: '#e9d2a4', scrollbarThumb: '#947047', scrollbarTrack: '#ead9b5',
  disabledOpacity: .52, glowOpacity: .18, glowRadius: 2, glowColor: '#f3d5a0', focusColor: '#74482c', easing: 'ease-out',
});
const numeric = { paperSelectionBrightness: [1, 1.2], duration: [0, 800], sceneDuration: [0, 1000], hoverBrightness: [1, 1.3], pressedBrightness: [.7, 1], selectedBrightness: [.7, 1], disabledOpacity: [.3, .9], glowOpacity: [.1, .8], glowRadius: [1, 12] };
const cssNames = { paperSelectionBrightness: 'paper-selection-brightness', paperSelectionColor: 'paper-selection-color', scrollbarThumb: 'scrollbar-thumb', scrollbarTrack: 'scrollbar-track', duration: 'duration', sceneDuration: 'scene-duration', hoverBrightness: 'hover-brightness', pressedBrightness: 'pressed-brightness', selectedBrightness: 'selected-brightness', disabledOpacity: 'disabled-opacity', glowOpacity: 'glow-opacity', glowRadius: 'glow-radius', glowColor: 'glow-color', focusColor: 'focus-color', easing: 'easing' };
export function createPresentationTransitions({ motionPreference, root = globalThis.document?.documentElement }) {
  const groups = new Map(), completions = new Map(); let disposed = false, values = { ...PRESENTATION_DEFAULTS };
  function cancel(group) {
    const animations = groups.get(group); if (!animations) return; groups.delete(group);
    completions.get(group)?.();
    for (const animation of animations) { try { animation.cancel(); } catch { /* Effects cannot block navigation or saving. */ } }
  }
  function cancelAll() { for (const group of [...groups.keys()]) cancel(group); }
  function configure(changes = {}) {
    const next = { ...values };
    for (const [key, value] of Object.entries(changes)) {
      if (!Object.hasOwn(cssNames, key)) throw new RangeError(`Unknown presentation token: ${key}`);
      if (Object.hasOwn(numeric, key)) {
        const [min, max] = numeric[key];
        if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`Invalid presentation token: ${key}`);
      } else if (key === 'easing' ? !['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'].includes(value) : !/^#[0-9a-f]{6}$/i.test(value)) throw new RangeError(`Invalid presentation token: ${key}`);
      next[key] = value;
    }
    cancelAll(); values = next;
    for (const [key, value] of Object.entries(values)) root?.style.setProperty(`--interaction-${cssNames[key]}`, String(value) + (key.endsWith('Duration') || key === 'duration' ? 'ms' : key === 'glowRadius' ? 'px' : ''));
    return Object.freeze({ ...values });
  }
  configure();
  function playTransition(name, elements, { group = name === 'sceneEnter' ? 'scene' : 'panel' } = {}) {
    if (!['sceneEnter', 'panelEnter', 'panelExit'].includes(name)) throw new RangeError(`Unknown presentation transition: ${name}`);
    cancel(group); if (disposed || motionPreference.matches) return Promise.resolve();
    const animations = new Set(); groups.set(group, animations);
    let resolve, timer;
    const finished = new Promise(done => { resolve = done; });
    const complete = () => { clearTimeout(timer); if (completions.get(group) === complete) completions.delete(group); resolve(); };
    completions.set(group, complete);
    for (const element of elements) {
      if (typeof element?.animate !== 'function') continue;
      let animation;
      try { animation = element.animate(name === 'panelExit' ? [{ opacity: 1 }, { opacity: .35 }] : [{ opacity: .35 }, { opacity: 1 }],
        { duration: name === 'sceneEnter' ? values.sceneDuration : values.duration, easing: values.easing }); } catch { continue; }
      animations.add(animation);
      const release = () => { animations.delete(animation); if (!animations.size && groups.get(group) === animations) { groups.delete(group); complete(); } };
      animation.onfinish = release; animation.oncancel = release;
    }
    if (!animations.size) { groups.delete(group); complete(); }
    else timer = setTimeout(() => { if (groups.get(group) === animations) cancel(group); }, (name === 'sceneEnter' ? values.sceneDuration : values.duration) + 80);
    return finished;
  }
  const preferenceChanged = () => { if (motionPreference.matches) cancelAll(); };
  motionPreference.addEventListener?.('change', preferenceChanged);
  return Object.freeze({ playTransition, configure, tokens: () => Object.freeze({ ...values }),
    enter: (group, elements) => playTransition(group === 'scene' ? 'sceneEnter' : 'panelEnter', elements, { group }),
    cancel, cancelAll,
    dispose() { disposed = true; cancelAll(); motionPreference.removeEventListener?.('change', preferenceChanged); },
  });
}
