// In-memory browser diagnostics only. Never affect recovery, save, or start gates.
export function markStartupTiming(phase, performanceClock = globalThis.performance) {
  try { performanceClock?.mark?.(`pipi:startup:${phase}`); }
  catch { /* Instrumentation is optional, gameplay is not. */ }
}
