import { buildWorkerRequest, parseWorkerResult } from './contracts.mjs';
import {runBudgetMs} from './run-policy.mjs';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const boundedText = (value, limit) => typeof value === 'string' && value.length <= limit;

function createPythonWorker() {
  const moduleURL = new URL('./python-worker.js', import.meta.url).href;
  const bootstrap = URL.createObjectURL(new Blob([`import ${JSON.stringify(moduleURL)};`], { type: 'text/javascript' }));
  let released = false;
  const release = () => {
    if (!released) URL.revokeObjectURL(bootstrap);
    released = true;
  };
  try {
    const worker = new Worker(bootstrap, { type: 'module' });
    const terminate = worker.terminate.bind(worker);
    worker.terminate = () => { release(); terminate(); };
    worker.addEventListener('message', release, { once: true });
    worker.addEventListener('error', release, { once: true });
    return worker;
  } catch (error) {
    release();
    throw error;
  }
}

export function createRuntime({
  onStatus = () => {},
  workerFactory = createPythonWorker,
  now = () => performance.now(),
  setTimer = (callback, delay) => setTimeout(callback, delay),
  clearTimer = timer => clearTimeout(timer),
  startupTimeoutMs = 45000,
  runTimeoutMs = null
} = {}) {
  if (runTimeoutMs !== null && (!Number.isFinite(runTimeoutMs) || runTimeoutMs <= 0)) throw new Error('Invalid execution budget.');
  let phase = 'idle';
  let worker = null;
  let generation = 0;
  let pending = null;
  let initialization = null;
  let version = '';

  function status(next, message = '') {
    phase = next;
    try { onStatus(Object.freeze({ phase, message, version })); } catch {}
  }

  function retire() {
    generation++;
    const previous = worker;
    worker = null;
    if (previous) previous.terminate();
  }

  function settleInitialization(ready) {
    if (!initialization) return;
    const current = initialization;
    initialization = null;
    clearTimer(current.timer);
    current.resolve(ready);
  }

  function finish(outcome, restart = false) {
    if (!pending) return;
    const current = pending;
    pending = null;
    clearTimer(current.timer);
    retire();
    status(restart ? 'idle' : 'failed', outcome.message || '');
    current.resolve({ ...outcome, elapsedMs: Math.max(0, now() - current.startedAt) });
    if (restart) void prepare();
  }

  function fail(message) {
    if (pending) finish({ kind: 'runtime-error', message });
    else {
      retire();
      settleInitialization(false);
      status('failed', message);
    }
  }

  function prepare() {
    if (phase === 'disposed') return Promise.resolve(false);
    if (phase === 'ready' || phase === 'running') return Promise.resolve(true);
    if (initialization) return initialization.promise;
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    initialization = { promise, resolve, timer: null, deadline: now() + startupTimeoutMs };
    status('preparing');
    try {
      const created = workerFactory();
      worker = created;
      const currentGeneration = ++generation;
      const isCurrent = () => worker === created && generation === currentGeneration;
      initialization.timer = setTimer(() => {
        if (isCurrent() && phase === 'preparing') fail('Python 准备超时，请检查连接后重试。');
      }, startupTimeoutMs);
      created.onmessage = ({ data }) => {
        if (!isCurrent()) return;
        if (!object(data)) return fail('Python 返回了无法识别的消息。');
        if (data.type === 'ready' && phase === 'preparing') {
          if (now() >= initialization.deadline) return fail('Python 准备超时，请检查连接后重试。');
          if (!boundedText(data.version, 40)) return fail('无法确认 Python 版本。');
          version = data.version;
          settleInitialization(true);
          status('ready');
        } else if (data.type === 'fatal') {
          fail('Python 准备失败，请重试。');
        } else if (data.type === 'result' && phase === 'running' && pending && data.id === pending.id) {
          if (now() >= pending.deadline) {
            finish({ kind: 'timed-out', message: '代码运行超过本次提交时限，已停止。本次游戏指令没有生效。' });
            return;
          }
          try {
            finish({ ...parseWorkerResult(data.result, pending.request, pending.sourceDigest), rawResult: data.result }, true);
          } catch (error) {
            fail(error.message);
          }
        }
      };
      created.onerror = event => {
        event.preventDefault?.();
        if (isCurrent()) fail('Python 运行环境中断，请重试。');
      };
      created.onmessageerror = () => {
        if (isCurrent()) fail('Python 消息读取失败，请重试。');
      };
    } catch {
      fail('无法启动 Python，请使用支持 WebAssembly 的现代浏览器后重试。');
    }
    return promise;
  }

  function run(task) {
    if (phase !== 'ready' || !worker) throw new Error('Python 尚未准备好，或已有代码正在运行。');
    if (!object(task) || !object(task.request) || !boundedText(task.requestId, 100) || !task.requestId.length ||
        !/^[a-f0-9]{64}$/.test(task.sourceDigest) || !Number.isFinite(task.deadline)) throw new Error('无效的提交快照。');
    const request = buildWorkerRequest({ ...task.request, player: task.request.state });
    const id = task.requestId;
    const startedAt = now();
    if (startedAt >= task.deadline) throw new Error('提交已过期，请重新运行。');
    const routeBudget = runBudgetMs(request);
    const budget = runTimeoutMs === null ? routeBudget : Math.min(routeBudget, runTimeoutMs);
    const deadline = Math.min(startedAt + budget, task.deadline);
    const promise = new Promise(resolve => {
      pending = { id, request, sourceDigest: task.sourceDigest, resolve, startedAt, deadline, timer: null };
    });
    status('running');
    pending.timer = setTimer(() => {
      if (pending?.id === id) finish({ kind: 'timed-out', message: '代码运行超过本次提交时限，已停止。本次游戏指令没有生效。' });
    }, Math.max(0, deadline - now()));
    try {
      worker.postMessage({ type: 'run', id, request });
    } catch {
      fail('代码未能发送到 Python，请重试。');
    }
    return promise;
  }

  function end(next) {
    if (phase === 'disposed' || phase === next) return;
    const current = pending;
    pending = null;
    if (current) clearTimer(current.timer);
    retire();
    settleInitialization(false);
    status(next);
    current?.resolve({ kind: 'cancelled', message: '已停止。本次游戏指令没有生效。', elapsedMs: Math.max(0, now() - current.startedAt) });
  }

  return Object.freeze({ prepare, run, stop: () => end('stopped'), dispose: () => end('disposed') });
}
