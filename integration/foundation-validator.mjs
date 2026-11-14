import {FOUNDATION_SCHEMAS as SCHEMAS} from './foundation-data.mjs';

export async function digest(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function taskCounts(value) {
  const hasLeaked = Object.hasOwn(value, 'leakedTasks');
  const hasPending = Object.hasOwn(value, 'stillPendingTasks');
  for (const key of ['leakedTasks', 'stillPendingTasks']) {
    if (Object.hasOwn(value, key) && (!Number.isSafeInteger(value[key]) || value[key] < 0)) {
      throw new Error('Invalid task cleanup count');
    }
  }
  if (hasPending && (!hasLeaked || value.stillPendingTasks > value.leakedTasks)) {
    throw new Error('Inconsistent task cleanup counts');
  }
  return {leaked: hasLeaked ? value.leakedTasks : 0, pending: hasPending ? value.stillPendingTasks : 0};
}

export function validateResult(raw, task, sourceDigest) {
  const rows = SCHEMAS[task];
  if (!rows || !raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid result');
  if (typeof raw.ok !== 'boolean' || typeof raw.passed !== 'boolean' || raw.foundationTask !== task ||
      raw.codeSha256 !== sourceDigest || raw.expectedChecks !== rows.length || typeof raw.stdout !== 'string' ||
      [...raw.stdout].length > 6000 || !Array.isArray(raw.checks) || !Array.isArray(raw.effects) ||
      raw.effects.length || !Array.isArray(raw.worldEvents) || raw.worldEvents.length) {
    throw new Error('Malformed foundation receipt');
  }
  if (raw.ok && Object.hasOwn(raw, 'error')) throw new Error('Success cannot contain fatal error');
  if (raw.checks.length > rows.length) throw new Error('Excess checks');
  raw.checks.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row) || row.id !== rows[index].id ||
        row.label !== rows[index].label || typeof row.passed !== 'boolean' || typeof row.detail !== 'string') {
      throw new Error('Untrusted check sequence');
    }
    const {leaked, pending} = taskCounts(row);
    if ((row.passed && (leaked > 0 || Object.hasOwn(row, 'error'))) || (pending > 0 && raw.ok)) {
      throw new Error('Cleanup evidence contradicts the verdict');
    }
  });
  if (!raw.ok) {
    if (raw.passed || !raw.error || typeof raw.error !== 'object' || Array.isArray(raw.error) ||
        typeof raw.error.name !== 'string' || typeof raw.error.message !== 'string') {
      throw new Error('Malformed fatal result');
    }
    taskCounts(raw.error);
    return raw;
  }
  if (raw.checks.length !== rows.length) throw new Error('Incomplete checks');
  if (raw.passed !== raw.checks.every(row => row.passed)) throw new Error('Inconsistent pass verdict');
  return raw;
}

