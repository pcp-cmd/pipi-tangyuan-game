import {INTEGRATED_SAVE_KEY} from '../integration/state.mjs';
import {SAVE_KEY} from '../dist/engine.js';

const TEXT = {
  eligible: '主记录确实缺失。请选择与当前保留备份完全匹配的归档，再单独确认恢复。',
  'reading-file': '正在实际读取用于恢复的文件并核对原文…',
  verified: '恢复文件已读回，且与当前保留来源完整匹配。尚未写入主进度。',
  'local-state-blocked': '当前页面有已加载或待保存内容，不能用此入口替换。请先保留当前内容。',
  'authority-present': '主记录已经存在，本入口不会覆盖它。请保留文件并重新核对当前进度。',
  'authority-unavailable': '无法确认主记录是否缺失，已暂停恢复。读取失败不会被当作空存档。',
  'source-invalid': '恢复来源无法通过校验。原件保留，不会据此重建进度。',
  'source-unavailable': '恢复来源暂时无法完整读取。请保留原件并稍后刷新。',
  'no-live-source': '没有当前可匹配的浏览器备份。仅有外部文件或已经释放的归档暂不支持此入口，请保留文件。',
  'ambiguous-sources': '存在不同版本的恢复分支，不能自动选择或合并。请先保留各份原件。',
  'legacy-pending-present': '检测到旧版待恢复记录，本入口暂停；旧记录不会被清理。',
  'legacy-source-changed': '归档与本机旧版来源不同，已停止恢复，不会合并金币或覆盖旧来源。',
  'source-changed': '保留来源已经变化，请刷新后重新选回文件，旧验证不能继续使用。',
  'invalid-file': '没有读到完整有效的文件，未允许恢复。',
  'invalid-archive': '所选归档无法作为当前游戏的完整进度读取，未允许恢复。',
  'wrong-archive': '文件范围、摘要或原文不匹配，未允许恢复。',
  'file-read-failed': '文件读取失败，旧验证已取消；原件没有被改动。',
  'file-check-failed': '文件校验未完成，尚未允许恢复。',
  'locks-required': '当前浏览器无法协调多页面写入，已暂停恢复。',
  'waiting-for-lock': '正在等待并重新核对主记录与来源。不会覆盖已有主记录…',
  'verification-expired': '等候期间操作已取消或来源已切换，本次没有开始写入。',
  'verification-required': '需要重新选回文件并验证，不能沿用旧恢复证明。',
  'cancel-requested': '已请求取消等待中的恢复；最终是否已提交将由核对结果说明。',
  'outcome-check-required': '上次写入结果尚未核实，请先点“只读核对结果”，不要重复恢复。',
  'observed-absent': '只读核对仍未看到主记录。请重新选回文件并确认后再试；本次核对没有写入。',
  'observed-identical': '只读核对看到了与归档相同的主记录。本次核对没有再次写入或发放奖励。',
  'different-authority': '主记录与上次归档不同，已停止。本次核对没有覆盖它，请保留所有原件。',
  'outcome-unavailable': '仍无法读取主记录，结果尚不确定。请保留文件和页面，不会自动重试。',
  'reloaded': '已只读载入当前有效进度，没有再次写入或发放奖励。',
  'reload-blocked': '当前页面未能安全载入。本地待保存内容仍保留，请先导出并核对，不会强制丢弃。',
  'reload-not-ready': '请先确认恢复结果，再明确载入当前进度。',
};

export function mountMissingAuthoritySection({session, scope, container, document, window, confirm, ensureFocus, onBusyChange = () => {}, onReloaded = () => {}}) {
  if (typeof session.createMissingAuthorityRecovery !== 'function') return Object.freeze({refresh(){},cancel(){},dispose(){},snapshot:()=>({busy:false})});
  const node = (tag, text = '') => {const value=document.createElement(tag);value.textContent=text;return value;};
  const section=node('section');section.className='recovery-selection';section.id='missingAuthorityRecovery';section.hidden=true;
  const heading=node('h4','缺失主记录的恢复 · 独立操作');
  const explanation=node('p','只在主记录确实缺失、且文件完整匹配当前保留来源时恢复原文。这一步只写回主记录，之后需另点“只读载入”，当前画面暂不切换。请先恢复并载入，再考虑释放来源；本版暂不支持只有外部归档的恢复。不会合并或新增奖励，也不会删除浏览器备份。上方“释放”与本操作使用不同证明。');
  explanation.className='recovery-explanation';
  const status=node('p');status.id='missingRecoveryStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  status.className='recovery-status';
  const label=node('label','选回用于恢复完整进度的归档文件');label.htmlFor='missingRecoveryFile';label.className='recovery-file-label';
  const input=node('input');input.type='file';input.accept='.json,application/json';input.id='missingRecoveryFile';
  const preview=node('p','尚未读回恢复文件。');preview.id='missingRecoverySummary';preview.className='recovery-meta';
  const restore=node('button','确认并恢复缺失的主记录');restore.type='button';restore.className='recovery-release';restore.id='restoreMissingAuthority';
  const inspect=node('button','只读核对结果');inspect.type='button';inspect.className='secondary-button';inspect.id='inspectMissingRecovery';
  const reload=node('button','只读载入已核对的进度');reload.type='button';reload.className='secondary-button';reload.id='reloadMissingRecovery';
  section.append(heading,explanation,status,label,input,preview,restore,inspect,reload);container.append(section);
  let controller, ticket=null, generation=0, disposed=false, seenMissing=false;
  const setMessage = text => {if(!disposed)status.textContent=text;};
  function controls() {
    if(!controller||disposed)return;
    const view=controller.snapshot();section.hidden=!seenMissing;
    input.disabled=view.busy||view.needsInspection;restore.disabled=!view.canRestore||!ticket;
    inspect.disabled=view.busy||!view.canInspectOutcome;
    reload.disabled=!view.canReload;
    if(!view.canRestore)ticket=null;
    ensureFocus();onBusyChange();
  }
  function show(result) {
    if(result.status==='restored') setMessage('已按选中文件原文恢复缺失主记录。本次未删除浏览器备份，未合并或新增奖励。请再明确点击“只读载入已核对的进度”，当前页面不会自行丢弃内容。');
    else if(result.status==='restore-error')setMessage(result.outcome==='uncertain'?'恢复写入结果尚不确定，可能已经生效。请先只读核对，不会自动重复恢复。':'恢复尚未开始写入。原件保留，请刷新并重新核对。');
    else setMessage(TEXT[result.status]||'恢复验证已取消，请刷新后重新选择文件。');
  }
  controller=session.createMissingAuthorityRecovery({scope,onChange:view=>{show(view.lastResult??{status:view.phase});controls();}});
  function cancel() {
    generation++;ticket=null;input.value='';controller.cancel();preview.textContent='尚未读回当前恢复文件。';controls();
  }
  function refresh() {
    if(disposed||controller.snapshot().busy)return;
    generation++;ticket=null;input.value='';
    const result=controller.refresh();if(result.status!=='local-state-blocked')seenMissing=true;
    preview.textContent='尚未读回当前恢复文件。';show(result);controls();
  }
  input.addEventListener('click',()=>{cancel();setMessage('请选择用于恢复的实际归档文件。');});
  input.addEventListener('cancel',()=>{cancel();setMessage('没有选回恢复文件，未允许写入。');});
  input.addEventListener('change',async()=>{
    const token=++generation;ticket=null;const reading=controller.verifyFile(input.files?.[0]);controls();
    const result=await reading;if(disposed||token!==generation)return;
    if(result.status==='verified'){
      ticket=result.ticket;const s=result.summary;
      preview.textContent=`已读回 ${s.fileName}（${s.fileBytes.toLocaleString()} 字节）。归档版本 v${s.storedAssessmentVersion}，${s.coins} 金币、${s.xp} XP、${s.completed} 项历史完成记录（不代表当前版本验收已通过），${s.assistedDrafts} 份草稿带辅助标记。原文将逐字保留。`;
    }
    show(result);controls();
  });
  restore.addEventListener('click',async()=>{
    if(!ticket||!controller.snapshot().canRestore)return;
    const s=controller.snapshot().summary;
    if(!confirm(`确认从这份归档恢复缺失的主记录吗？文件包含 ${s.coins} 金币、${s.xp} XP 和 ${s.completed} 项历史完成记录，不代表当前版本验收已通过。这一步只写回，之后需另点“只读载入”，当前画面暂不切换。只恢复该完整分支，不合并或新增奖励，不删除保留备份；若主记录已出现，将拒绝覆盖。`)){setMessage('已取消恢复，主记录与所有备份均未因此改变。');return;}
    const restoring=controller.restoreVerified(ticket,{confirmed:true});ticket=null;controls();
    const result=await restoring;if(disposed)return;show(result);controls();
  });
  inspect.addEventListener('click',()=>{ticket=null;show(controller.inspectOutcome());controls();});
  reload.addEventListener('click',()=>{
    ticket=null;const result=controller.reloadObserved();show(result);
    if(result.status==='reloaded'){try{onReloaded();}catch{setMessage('主记录已读取，但页面显示尚未完整更新。请保留文件，不会重复写入。');}}
    controls();
  });
  const prefix=scope.endsWith(INTEGRATED_SAVE_KEY)?scope.slice(0,-INTEGRATED_SAVE_KEY.length):null;
  const relevant = key => key === null || key===scope || key===scope+':recovery-v2' ||
    typeof key==='string'&&(key.startsWith(scope+':pending:')||prefix!==null&&(key===prefix+SAVE_KEY||key.startsWith(prefix+SAVE_KEY+':pending:')));
  const onStorage = event => {if(!relevant(event.key))return;cancel();setMessage('另一个页面更改了主记录或来源，恢复证明已取消。请明确刷新后再选回文件。');};
  window.addEventListener('storage',onStorage);controls();
  return Object.freeze({refresh,cancel,snapshot:controller.snapshot,dispose(){disposed=true;generation++;controller.dispose();window.removeEventListener('storage',onStorage);section.remove();}});
}
