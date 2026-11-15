import {externalAssignment, externalDigest, validateExternalSubmission} from './external-work.mjs';
import {LOCAL_CHECK_FILENAME, LOCAL_CHECK_SCHEMA, LOCAL_CHECK_MAX_BYTES, LOCAL_CHECK_PROFILES, isLocalCheckInput} from './local-check-contract.mjs';
export {LOCAL_CHECK_FILENAME, LOCAL_CHECK_TOOL, LOCAL_CHECK_PROFILES} from './local-check-contract.mjs';

const encoder = new TextEncoder();
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exact = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const string = (value, max, nonempty = false) => typeof value === 'string' && value.length <= max && (!nonempty || value.length > 0);
const integer = (value, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= 0 && value <= max;
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const pathSyntax = value => string(value, 180, true) && !/[:\\\u0000-\u001f\u007f]/.test(value) && value.split('/').every(part => part && part !== '.' && part !== '..');
const boundary = '这是本机自报运行与材料一致性核对，仍待可信审核；不授予课程成绩、独立能力或奖励。';
const view = (status, title, detail, extra = {}) => Object.freeze({status, title, detail, boundary, trusted: false, ...extra});
const invalid = detail => view('invalid-report', '本地自测报告无法核对', detail);
const outcomes = new Set(['passed', 'failed', 'error', 'skipped', 'expected-failure', 'unexpected-success', 'incomplete']);

function parseReport(text, assignment) {
  if (typeof text !== 'string' || encoder.encode(text).length > LOCAL_CHECK_MAX_BYTES) throw Error('报告须为不超过 64 KiB 的 JSON 文本。');
  let report; try { report = JSON.parse(text); } catch { throw Error('报告不是有效 JSON；请重新运行检查工具。'); }
  const profile = LOCAL_CHECK_PROFILES[assignment.id];
  if (!exact(report, ['schema', 'taskId', 'contractRevision', 'profileId', 'createdAt', 'environment', 'command', 'process', 'inputs', 'changedPaths', 'result', 'diagnostic']) ||
      report.schema !== LOCAL_CHECK_SCHEMA || report.taskId !== assignment.id || report.contractRevision !== assignment.contractRevision ||
      report.profileId !== profile.profileId || !integer(report.createdAt) || JSON.stringify(report.command) !== JSON.stringify(profile.command))
    throw Error('报告的任务、合同版本、固定检查方式或字段不符；不能用 passed:true 或其他额外字段代替检查结果。');
  if (!exact(report.environment, ['python', 'platform', 'toolVersion']) || !string(report.environment.python, 120, true) ||
      !string(report.environment.platform, 120, true) || report.environment.toolVersion !== '1') throw Error('报告缺少检查工具或解释器信息。');
  const process = report.process;
  if (!exact(process, ['exitCode', 'timedOut', 'durationMs', 'timeoutSeconds', 'outputTruncated']) ||
      !(process.exitCode === null || Number.isSafeInteger(process.exitCode) && process.exitCode >= -255 && process.exitCode <= 4294967295) ||
      typeof process.timedOut !== 'boolean' || !integer(process.durationMs, 3600000) || !integer(process.timeoutSeconds, 300) || process.timeoutSeconds < 1 ||
      typeof process.outputTruncated !== 'boolean') throw Error('报告的退出状态或时限记录不完整。');
  if (!Array.isArray(report.inputs) || report.inputs.length < 1 || report.inputs.length > 96) throw Error('报告没有可核对的源码和测试输入。');
  const paths = new Set(); let bytes = 0;
  for (const row of report.inputs) {
    if (!exact(row, ['path', 'bytes', 'sha256']) || !pathSyntax(row.path) || !isLocalCheckInput(row.path, assignment) || paths.has(row.path) ||
        !integer(row.bytes, 65536) || !hash(row.sha256)) throw Error('报告含重复、不允许或无效的输入路径／摘要。');
    paths.add(row.path); bytes += row.bytes;
  }
  if (bytes > 512 * 1024 || !report.inputs.some(row => /^tests\/test_.*\.py$/.test(row.path)) ||
      assignment.requiredFiles.some(path => isLocalCheckInput(path, assignment) && !paths.has(path)))
    throw Error('报告缺少必需源码或测试，或输入总量超过 512 KiB。');
  if (!Array.isArray(report.changedPaths) || report.changedPaths.length > 96 || new Set(report.changedPaths).size !== report.changedPaths.length ||
      report.changedPaths.some(path => !pathSyntax(path) || !isLocalCheckInput(path, assignment)) || !string(report.diagnostic, 2000))
    throw Error('报告的运行中改稿记录或诊断格式无效。');
  if (report.result !== null) {
    const result = report.result;
    if (!exact(result, ['discovered', 'tests']) || !integer(result.discovered, 256) || !Array.isArray(result.tests) || result.tests.length > 256)
      throw Error('逐项测试结果缺失或超过上限。');
    const ids = new Set();
    for (const row of result.tests) {
      if (!exact(row, ['id', 'outcome', 'message']) || !string(row.id, 240, true) || ids.has(row.id) ||
          !outcomes.has(row.outcome) || !string(row.message, 700)) throw Error('逐项结果含重复 ID、未知状态或无效说明。');
      ids.add(row.id);
    }
  }
  return report;
}

// Receives text material only. No uploaded Python, shell command or report field is executed.
export async function inspectLocalCheck({taskId, files} = {}) {
  const assignment = externalAssignment(taskId);
  if (!assignment || !LOCAL_CHECK_PROFILES[taskId]) return invalid('这份委托没有已登记的本地检查方式。');
  if (!Array.isArray(files) || files.length > 128 || files.some(row => !exact(row, ['path', 'text']) || !pathSyntax(row.path) || typeof row.text !== 'string'))
    return invalid('请先整理有效的文本材料清单。');
  const names = new Set();
  let totalBytes = 0;
  for (const row of files) {
    const bytes = encoder.encode(row.text).length; totalBytes += bytes;
    if (bytes > LOCAL_CHECK_MAX_BYTES || totalBytes > 512 * 1024) return invalid('材料超过单文件 64 KiB 或总量 512 KiB 上限。');
    if (names.has(row.path)) return invalid('材料中有重复路径，请重新预览。'); names.add(row.path);
  }
  const attached = files.find(row => row.path === LOCAL_CHECK_FILENAME);
  if (!attached) return view('missing-report', '尚未附本地自测报告', '可下载检查工具，在自己的工程目录运行，再将 LOCAL-CHECK.json 与对应源码一同带回。');
  let report;
  try { report = parseReport(attached.text, assignment); } catch (error) { return invalid(error.message); }
  const included = new Map(files.map(row => [row.path, row]));
  const missing = [], changed = [], extra = [];
  for (const input of report.inputs) {
    const material = included.get(input.path);
    if (!material) { missing.push(input.path); continue; }
    if (encoder.encode(material.text).length !== input.bytes || await externalDigest(material.text) !== input.sha256) changed.push(input.path);
  }
  const reportedPaths = new Set(report.inputs.map(row => row.path));
  for (const row of files) if (isLocalCheckInput(row.path, assignment) && !reportedPaths.has(row.path)) extra.push(row.path);
  const context = {report, missing, changed, extra};
  if (changed.length || extra.length || report.changedPaths.length)
    return view('stale-report', '改稿后需要重跑自测', '以下源码或测试与报告不一致：' + [...new Set([...changed, ...extra, ...report.changedPaths])].join('、') + '。用当前材料重新运行，再带回新报告。', context);
  if (missing.length) return view('missing-inputs', '还缺报告对应的材料', `请补齐 ${missing.join('、')}，或在确定的交付目录重新运行；尚不能称材料一致。`, context);
  if (report.process.timedOut) return view('timed-out', '本机自测超时', '材料摘要一致，但本次未完成。检查死循环、未回收任务或挂起的子进程；修复后重跑。', context);
  if (report.result === null) return view('runner-error', '本机自测未形成结果', report.diagnostic || '检查进程异常退出，未形成逐项结果；请查看本机终端并重跑。', context);
  const {discovered, tests} = report.result;
  if (!discovered || !tests.length) return view('empty-tests', '没有实际测试结果', '发现或完成的测试为零。确认 tests/test_*.py 中有可运行的 unittest 测试，再重跑。', context);
  const failures = tests.filter(row => ['failed', 'error', 'unexpected-success', 'incomplete'].includes(row.outcome));
  if (failures.length) return view('self-reported-failed', '本机自测有待修项 · 材料一致', `本次记录 ${failures.length} 项失败、错误或未完成；请按下方具体结果修改后重跑。`, {...context, failures});
  if (report.process.exitCode !== 0) return view('process-error', '检查进程异常结束', '材料摘要一致，但退出码不为 0 或没有正常结束；逐项绿勾不能覆盖进程异常。', context);
  if (tests.length !== discovered || tests.some(row => row.outcome !== 'passed'))
    return view('partial-results', '本机自测仍有未覆盖项', '材料摘要一致，但有跳过、预期失败或未完成的用例；本次不能记为全部测试通过。', context);
  return view('self-reported-passed', '本机自测通过 · 材料一致', `报告记载 ${tests.length} 项所附测试通过，所附源码和测试摘要一致。这是自报结果，测试是否充分仍待可信审核。`, {...context, failures: []});
}

export async function inspectLocalCheckBundle(bundleText) {
  const checked = await validateExternalSubmission(bundleText);
  if (!checked.ok) return invalid('提交包本身未通过材料摘要核对，请重新预览或取回完整作品包。');
  return inspectLocalCheck({taskId: checked.bundle.taskId, files: checked.bundle.files});
}
