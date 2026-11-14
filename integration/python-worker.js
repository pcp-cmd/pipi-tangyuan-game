import { loadPyodide } from '../dist/runtime/v0.27.7/pyodide.mjs';
import { createPythonBridge } from './python-bridge.mjs';
import { codeDigest } from './contracts.mjs';
import {foundationRequestFields, foundationSchema} from './foundation-route.mjs';
let bridge;
try {
  bridge = await createPythonBridge({
    loadPyodide,
    indexURL: new URL('../dist/runtime/v0.27.7/', import.meta.url).href,
    readAsset: async name => {
      const response = await fetch(new URL(`./python/${name}`, import.meta.url));
      if (!response.ok) throw new Error('Python 课程文件下载失败。');
      return response.text();
    }
  });
  self.postMessage({ type: 'ready', version: bridge.version });
} catch { self.postMessage({ type: 'fatal', error: 'Python 判题环境加载失败。' }); }
self.onmessage = async ({ data }) => {
  if (data?.type !== 'run' || !bridge) return;
  try { self.postMessage({ type: 'result', id: data.id, result: await bridge.execute(data.request) }); }
  catch (error) {
    const source = typeof data.request?.code === 'string' ? data.request.code : '';
    const result = { ok: false, passed: false, checks: [], effects: [], stdout: '', codeSha256: await codeDigest(source), error: { name: 'RuntimeError', message: String(error).slice(0, 2000) } };
    if (data.request?.judgeKind === 'foundations') {
      try { const fields=foundationRequestFields(data.request.lessonId,data.request.scene); Object.assign(result,{foundationTask:fields.foundationTask,foundationContractDigest:fields.foundationContractDigest,expectedChecks:foundationSchema(fields.foundationTask).length,worldEvents:[]}); } catch {}
    }
    self.postMessage({type:'result',id:data.id,result});
  }
};
