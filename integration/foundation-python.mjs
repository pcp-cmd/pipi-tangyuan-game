import {FOUNDATION_CONTRACT_DIGEST} from './foundation-data.mjs';
export function installFoundationPython(pyodide,assets){
  pyodide.globals.set('_bridge_foundation_source',assets['foundation-runner.py']);
  pyodide.globals.set('_bridge_foundation_contracts',assets['foundation-contracts.json']);
  pyodide.runPython("_bridge_foundations = {'__name__': '_pipi_foundations_runner'}\nexec(compile(_bridge_foundation_source, 'foundation-runner.py', 'exec'), _bridge_foundations)\n_bridge_foundations['_install_foundations'](_bridge_foundation_contracts)\ndel _bridge_foundation_source, _bridge_foundation_contracts");
}
export async function executeFoundationPython(pyodide){
  const raw=JSON.parse(await pyodide.runPythonAsync("await _bridge_foundations['_execute_foundations'](_bridge_request_json)"));
  raw.foundationContractDigest=FOUNDATION_CONTRACT_DIGEST;
  return raw;
}
