export function readDiscoveries(raw, placeIds) {
  const empty = { version: 1, visited: [] };
  if (!raw || typeof raw !== 'string' || raw.length > 4096) return empty;
  try {
    const record = JSON.parse(raw);
    if (record?.version !== 1 || !Array.isArray(record.visited)) return empty;
    return { version: 1, visited: [...new Set(record.visited.filter(id => placeIds.includes(id)))] };
  } catch { return empty; }
}

export function visitPlace(record, id, placeIds) {
  if (!placeIds.includes(id) || record.visited.includes(id)) return record;
  return { version: 1, visited: [...record.visited, id] };
}

export function loadDiscoveryStorage(storage, key, placeIds) {
  let record = readDiscoveries(null, placeIds);
  try {
    record = readDiscoveries(storage.getItem(key), placeIds);
    for (const id of placeIds) {
      if (storage.getItem(`${key}:${id}`) === '1') record = visitPlace(record, id, placeIds);
    }
    return { record, saved: true };
  } catch { return { record, saved: false }; }
}

export function saveDiscoveryStorage(storage, key, record) {
  try {
    for (const id of record.visited) {
      storage.setItem(`${key}:${id}`, '1');
      if (storage.getItem(`${key}:${id}`) !== '1') return false;
    }
    return true;
  } catch { return false; }
}
