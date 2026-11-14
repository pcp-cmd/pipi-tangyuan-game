import {LIFECYCLE_CONTRACT_DIGEST} from './lifecycle-data.mjs';

// Caller has already checked every asset against the trusted hash manifest.
export function installLifecyclePython(pyodide, assets) {
  pyodide.globals.set('_bridge_lifecycle_source', assets['lifecycle-runner.py'] + '\n' + assets['lifecycle-scenes.py']);
  pyodide.globals.set('_bridge_lifecycle_contracts', assets['lifecycle-contracts.json']);
  pyodide.runPython(`
_bridge_lifecycle = {'__name__': '_pipi_lifecycle_runner'}
exec(compile(_bridge_lifecycle_source, 'lifecycle-runner.py', 'exec'), _bridge_lifecycle)
_bridge_lifecycle['_install_lifecycle'](_bridge_lifecycle_contracts)
del _bridge_lifecycle_source, _bridge_lifecycle_contracts
`);
}

export async function executeLifecyclePython(pyodide) {
  const raw = JSON.parse(await pyodide.runPythonAsync("await _bridge_lifecycle['_execute_lifecycle'](_bridge_request_json)"));
  // This stamps the verified deployed contract bundle, not caller-supplied metadata.
  raw.lifecycleContractDigest = LIFECYCLE_CONTRACT_DIGEST;
  return raw;
}
