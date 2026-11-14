export function createRequestIds(randomUUID = () => crypto.randomUUID()) {
  const session = randomUUID();
  if (typeof session !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(session)) throw new TypeError('A unique page session UUID is required.');
  let count = 0;
  return () => {
    if (count >= Number.MAX_SAFE_INTEGER) throw new RangeError('Submission counter exhausted.');
    return `qa-${session}-${++count}`;
  };
}
