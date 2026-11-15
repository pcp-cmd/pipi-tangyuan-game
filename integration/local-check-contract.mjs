// Local reports describe a learner's own run. They are not trusted review receipts.
export const LOCAL_CHECK_FILENAME = 'LOCAL-CHECK.json';
export const LOCAL_CHECK_SCHEMA = 'pipi-local-check/v1';
export const LOCAL_CHECK_MAX_BYTES = 64 * 1024;
export const LOCAL_CHECK_TOOL = Object.freeze({
  url: '../integration/local-check-tools.zip', filename: 'local-check-tools.zip',
  readme: '../docs/local-check-20261115/LEARNER-GUIDE.md',
});
const command = top => Object.freeze(['unittest', 'discover', '-s', 'tests', '-p', 'test_*.py', ...(top ? ['-t', '.'] : [])]);
export const LOCAL_CHECK_PROFILES = Object.freeze(Object.fromEntries([
  ['stockledger', false], ['repo-repair', false], ['durable-dispatch', true],
  ['tool-bridge', false], ['evidence-research', false], ['field-practice', false],
].map(([id, top]) => [id, Object.freeze({
  taskId: id, contractRevision: 1, profileId: `${id}-public-unittest/v1`,
  command: command(top), topLevel: top ? '.' : null,
})])));
export function isLocalCheckAttachment(path, assignment) {
  return path === LOCAL_CHECK_FILENAME &&
    LOCAL_CHECK_PROFILES[assignment?.id]?.contractRevision === assignment?.contractRevision;
}
export function isLocalCheckInput(path, assignment) {
  return typeof path === 'string' && /\.(?:py|json|csv)$/.test(path) && path !== LOCAL_CHECK_FILENAME &&
    !/^(?:work|evidence)\//.test(path) && !['CHECKPOINT.json', 'RESULT.json', 'MANIFEST.json'].includes(path) &&
    (assignment.allowedFiles.includes(path) || /^tests\/test_[A-Za-z0-9_-]{1,60}\.py$/.test(path));
}
