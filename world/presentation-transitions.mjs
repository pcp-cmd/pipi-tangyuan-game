export function createPresentationTransitions({ motionPreference }) {
  const groups = new Map();
  let disposed = false;

  function cancel(group) {
    const animations = groups.get(group);
    if (!animations) return;
    groups.delete(group);
    for (const animation of animations) {
      try { animation.cancel(); } catch { /* A decorative effect cannot block navigation or saving. */ }
    }
  }

  function cancelAll() {
    for (const group of [...groups.keys()]) cancel(group);
  }

  function enter(group, elements) {
    cancel(group);
    if (disposed || motionPreference.matches) return;
    const animations = new Set();
    groups.set(group, animations);
    for (const element of elements) {
      if (typeof element?.animate !== 'function') continue;
      let animation;
      try {
        animation = element.animate(
          [{ opacity: .35 }, { opacity: 1 }],
          { duration: group === 'scene' ? 220 : 180, easing: 'ease-out' }
        );
      } catch { continue; }
      animations.add(animation);
      const release = () => {
        animations.delete(animation);
        if (!animations.size && groups.get(group) === animations) groups.delete(group);
      };
      animation.onfinish = release;
      animation.oncancel = release;
    }
    if (!animations.size) groups.delete(group);
  }

  const preferenceChanged = () => { if (motionPreference.matches) cancelAll(); };
  motionPreference.addEventListener?.('change', preferenceChanged);
  return Object.freeze({
    enter, cancel, cancelAll,
    dispose() {
      disposed = true;
      cancelAll();
      motionPreference.removeEventListener?.('change', preferenceChanged);
    }
  });
}
