export function createInteractionTimings({ now = () => performance.now(), limit = 80 } = {}) {
  const records = [], travel = new Map();
  function span(target, stage) {
    const start = now(); let ended = false;
    return (outcome = 'ready') => {
      if (ended) return; ended = true;
      const end = now();
      records.push(Object.freeze({ target, stage, outcome, start, end, elapsedMs: end - start }));
      if (records.length > limit) records.shift();
    };
  }
  return Object.freeze({ span,
    approach(target) { for (const end of travel.values()) end('superseded'); travel.clear(); travel.set(target, span(target, 'travel')); },
    arrive(target) { travel.get(target)?.('arrived'); travel.delete(target); },
    cancelTravel() { for (const end of travel.values()) end('cancelled'); travel.clear(); },
    snapshot: () => records.map(record => ({ ...record })),
  });
}
export const journeyTimings = createInteractionTimings();
