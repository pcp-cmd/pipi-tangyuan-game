import { buildWorkerRequest, codeDigest, parseWorkerResult } from './contracts.mjs';
import { loadVerifiedPythonAssets } from './python-asset-loader.mjs';
import {installFoundationPython, executeFoundationPython} from './foundation-python.mjs';
import {installLifecyclePython, executeLifecyclePython} from './lifecycle-python.mjs';

export async function createPythonBridge({ loadPyodide, readAsset, indexURL }) {
  const assets = await loadVerifiedPythonAssets(readAsset);
  const pyodide = await loadPyodide({ indexURL });
  pyodide.globals.set('_bridge_base_source', assets['base-runner.py']);
  pyodide.globals.set('_bridge_extension_source', assets['extension-contracts.py']);
  pyodide.globals.set('_bridge_module_state_source', assets['module-state.py']);
  pyodide.globals.set('_bridge_protocol_source', assets['protocol-runner.py']);
  pyodide.globals.set('_bridge_contracts_source', assets['protocol-contracts.py']);
  pyodide.globals.set('_bridge_protocol_lessons', assets['protocol-quests.json']);
  pyodide.runPython(`
_bridge_module_state = {}
exec(compile(_bridge_module_state_source, 'module-state.py', 'exec'), _bridge_module_state)
del _bridge_module_state_source
_bridge_base = {'__name__': '_pipi_base_runner'}
_bridge_protocol = {'__name__': '_pipi_protocol_runner'}
exec(compile(_bridge_base_source, 'base-runner.py', 'exec'), _bridge_base)
_bridge_base['_install_extensions'](_bridge_extension_source)
del _bridge_extension_source
exec(compile(_bridge_protocol_source, 'protocol-runner.py', 'exec'), _bridge_protocol)
_bridge_protocol['_install_protocol_runtime'](_bridge_contracts_source, _bridge_protocol_lessons)
del _bridge_base_source, _bridge_protocol_source, _bridge_contracts_source, _bridge_protocol_lessons
`);
  installLifecyclePython(pyodide, assets);
  installFoundationPython(pyodide, assets);
  pyodide.runPython("for _runner, _exports in [(_bridge_base, '_MODULE_EXPORTS'), (_bridge_protocol, '_EXPORTS'), (_bridge_lifecycle, '_EXPORTS'), (_bridge_foundations, '_EXPORTS')]:\n    _runner['_restore_exports'] = _bridge_module_state['protect_exported_types'](_runner[_exports])");
  let busy = false;
  let unusable = false;
  return Object.freeze({
    version: pyodide.runPython("__import__('sys').version.split()[0]"),
    async execute(input) {
      if (unusable) throw new Error('Runtime is unusable; create a fresh isolated runtime.');
      if (busy) throw new Error('A Python submission is already running.');
      const request = buildWorkerRequest({ ...input, player: input.state });
      busy = true;
      try {
        pyodide.globals.set('_bridge_request_json', JSON.stringify(request));
        const call = request.judgeKind === 'protocol' ? "_bridge_protocol['_execute_protocol'](_bridge_request_json)" : "_bridge_base['_execute'](_bridge_request_json)";
        const result = request.judgeKind === 'foundations' ? await executeFoundationPython(pyodide) : request.judgeKind === 'lifecycle' ? await executeLifecyclePython(pyodide) : JSON.parse(pyodide.runPython(call));
        result.codeSha256 = await codeDigest(request.code);
        if (request.judgeKind === 'foundations') {
          parseWorkerResult(result, request, result.codeSha256);
          if (result.error?.stillPendingTasks > 0 || result.checks.some(row => row.stillPendingTasks > 0)) unusable = true;
        }
        return result;
      } catch (error) {
        if (request.judgeKind === 'foundations') unusable = true;
        throw error;
      } finally { busy = false; }
    }
  });
}
