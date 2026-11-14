export function createArrivalIntent() {
  let epoch = 0, pending = null;
  return Object.freeze({
    cancel() { pending = null; return ++epoch; },
    current(token) { return token === epoch; },
    arm({ token, sceneId, hotspotId, movementId, continuation = null }) {
      if (token !== epoch || !Number.isSafeInteger(movementId)) return false;
      pending = { token, sceneId, hotspotId, movementId, continuation };
      return true;
    },
    take(view) {
      if (!pending) return null;
      const nav = view.navigation;
      if (view.physicalSceneId !== pending.sceneId || !nav || nav.movementId !== pending.movementId || nav.status === 'cancelled' || view.phase === 'recovery-required') {
        pending = null;
        return null;
      }
      if (nav.status !== 'arrived' || view.phase !== 'ready' || view.save?.dirty || view.save?.status !== 'saved') return null;
      const action = pending;
      pending = null;
      return view.nearby.some(item => item.id === action.hotspotId) ? action : null;
    }
  });
}
