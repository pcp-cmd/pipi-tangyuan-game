import { freshState, SAVE_KEY } from '../dist/engine.js';
import { evidenceVersionFor, LESSONS, LESSON_IDS, getLesson } from './contracts.mjs';
import { createIntegrationStore } from './store.mjs';
import { INTEGRATED_SAVE_KEY, freshEnvelope, updateDraft as setDraft, selectContext, updateDraft, createSubmission, acceptResult, assessmentStatus } from './state.mjs';
import { createRuntime } from './runtime-controller.mjs';
import { createDraftBuffer } from './draft-buffer.mjs';
import { createRequestIds } from './request-ids.mjs';
const $ = id => document.getElementById(id);
const requestedCase = new URL(location.href).searchParams.get('case') || 'default';
const caseID = /^[a-z0-9-]{1,80}$/.test(requestedCase) ? requestedCase : 'default';
const prefix = `pipi-integration-qa-20261105:${caseID}:`;
const keys = () => Object.keys(localStorage).filter(key => key.startsWith(prefix));
const storage = { get length() { return keys().length; }, key(index) { return keys()[index]?.slice(prefix.length) ?? null; },
  getItem(key) { return localStorage.getItem(prefix + key); }, setItem(key, value) { localStorage.setItem(prefix + key, value); }, removeItem(key) { localStorage.removeItem(prefix + key); } };
const locks = navigator.locks?.request ? { request: (key, callback) => navigator.locks.request(prefix + key, callback) } : null;
let state = null, phase = 'idle', saveStatus = 'idle', mode = 'lesson', assisted = false, active = null, epoch = 0;
const nextRequestId = createRequestIds();
let draftContext = { kind: 'lesson', lessonId: LESSON_IDS[0] }, draftNotice = '';
const buffer = createDraftBuffer({ commit: commitDraft });
const store = createIntegrationStore({ storage, locks, onChange: status => { saveStatus = status.status; showSaveStatus(); } });
const runtime = createRuntime({ now: () => performance.now(), onStatus: status => {
  phase = status.phase;
  $('runtime').textContent = `${phase}${status.version ? ` · Python ${status.version}` : ''}${status.message ? ` · ${status.message}` : ''}`;
  controls();
} });
for (const lesson of LESSONS) { const option = document.createElement('option'); option.value = lesson.id; option.textContent = `${lesson.title} · ${lesson.id}`; $('lesson').append(option); }
function selected() { return getLesson($('lesson').value); }
function controls() { $('load').disabled = !!state; $('run').disabled = !state || phase !== 'ready' || !!active || ['conflict','invalid','invalid-state','stale-state'].includes(saveStatus); $('stop').disabled = !active; $('reload').disabled = !state; $('export').disabled = !state; }
function showSaveStatus(extra = '') { $('saveStatus').textContent = `隔离验收 ${caseID} · ${draftNotice || `存档 ${saveStatus}`}${extra ? ` · ${extra}` : ''}`; controls(); }
function paint() {
  if (!state) return;
  $('coins').textContent = `金币：${state.game.coins}`; $('xp').textContent = `XP：${state.game.xp}`; $('completed').textContent = `历史首奖：${state.game.completed.length}/${LESSONS.length}`; $('positions').textContent = `位置：${state.game.positions.pipi}/${state.game.positions.tangyuan}`;
  $('possessions').textContent = `物品：${state.game.inventory.join(', ') || '无'}；建筑：${state.game.buildings.join(', ') || '无'}`;
  const id = selected().id; $('learning').textContent = `本题证据 v${evidenceVersionFor(id)} · 容器 v${state.assessmentVersion}：${assessmentStatus(state, id)}`;
  $('snapshot').textContent = JSON.stringify({ game: { ...state.game, drafts: Object.fromEntries(Object.entries(state.game.drafts).map(([id, code]) => [id, `${code.length} 字符`])) }, revision: state.revision, assessmentVersion: state.assessmentVersion, records: state.records, hasOriginalSnapshot: !!state.migration }, null, 2);
  let original; try { original = storage.getItem(SAVE_KEY); } catch {}
  $('storageSnapshot').textContent = JSON.stringify({ originalSourceBytes: original?.length ?? 0, originalStillMatches: state.migration ? original === state.migration.original : original === null, pendingRecoveries: store.recoveries().length, legacySourceStatus: store.checkLegacySource(state) }, null, 2);
}
async function persist() { if (!state) return; const status = await store.save(state); saveStatus = status.status; showSaveStatus(); paint(); }
function commitDraft(draft) {
  if (!state) return false;
  if (['conflict', 'invalid', 'invalid-state', 'stale-state'].includes(saveStatus)) {
    draftNotice = '编辑器草稿未保存：存档存在冲突，请先导出。'; showSaveStatus(); return false;
  }
  try {
    state = updateDraft(state, draft); draftNotice = ''; void persist(); return true;
  } catch (error) {
    draftNotice = error.name === 'DraftCapacityError' ? '编辑器草稿未保存：总容量已满。' : '编辑器草稿未保存。';
    showSaveStatus(error.message); $('result').textContent = '请先导出完整草稿；未保存前不会切换或覆盖编辑器。'; return false;
  }
}
function edit() {
  if (!state) return;
  buffer.mark({ ...draftContext, code: $('code').value, assisted });
  draftNotice = '编辑器有新草稿，等待合并保存…'; showSaveStatus();
}
function flushBeforeNavigation() {
  if (!buffer.flush()) return false;
  if (['conflict','invalid','invalid-state','stale-state'].includes(saveStatus)) { showSaveStatus('请先导出完整草稿并处理冲突。'); return false; }
  return true;
}
function showLesson() {
  const lesson = selected();
  draftContext = { kind: mode, lessonId: mode === 'lesson' ? lesson.id : null };
  $('brief').textContent = mode === 'shop' ? '商店是独立路由，允许零课程检查，但仍校验商品、余额和原子购买。' : lesson.description;
  $('scene').disabled = mode === 'shop' || lesson.judgeKind !== 'protocol';
  if ($('scene').disabled) $('scene').value = 'normal';
  assisted = mode === 'lesson' && state?.draftAssistance[lesson.id] === true;
  if (state) $('code').value = mode === 'shop' ? state.game.shopDraft : state.game.drafts[lesson.id] ?? lesson.starter;
  paint();
}
function cancel(message = '已停止，本次未结算。') {
  epoch++; active = null; runtime.stop(); $('result').textContent = message; controls(); void runtime.prepare();
}
function download(name, value, type = 'application/json') { const link = document.createElement('a'), url = URL.createObjectURL(new Blob([value], { type })); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('seed').addEventListener('click', () => {
  try {
    if (storage.getItem(SAVE_KEY) !== null || storage.getItem(INTEGRATED_SAVE_KEY) !== null) { showSaveStatus('已有隔离数据，未覆盖。'); return; }
    const sample = { ...freshState(), coins: 196, xp: 25, completed: ['first-steps'], inventory: ['scarf'], buildings: ['catnip'], positions: { pipi: 11, tangyuan: 5 }, mission: 3, drafts: { 'first-steps': LESSONS[0].solution }, history: ['隔离验收旧存档样本'] };
    storage.setItem(SAVE_KEY, JSON.stringify(sample, null, 2)); showSaveStatus('已建立隔离样本，实际玩家存档未使用。');
  } catch (error) { showSaveStatus(error.message); }
});
$('seedCapacity').addEventListener('click', () => {
  try {
    if (storage.getItem(SAVE_KEY) !== null || storage.getItem(INTEGRATED_SAVE_KEY) !== null) { showSaveStatus('已有隔离数据，未覆盖。'); return; }
    let sample = freshEnvelope();
    for (const lesson of LESSONS.slice(0,52)) sample = setDraft(sample, { kind: 'lesson', lessonId: lesson.id, code: '汉'.repeat(20000) });
    sample = selectContext(sample, { lessonId: LESSONS[52].id });
    storage.setItem(INTEGRATED_SAVE_KEY, JSON.stringify(sample)); showSaveStatus('已建立52份满长中文草稿的隔离样本。');
  } catch (error) { showSaveStatus(`容量样本未完成：${error.message}`); }
});
$('load').addEventListener('click', async () => {
  const loaded = await store.loadOrMigrate(); saveStatus = loaded.status;
  if (loaded.state) { state = loaded.state; $('lesson').value = LESSON_IDS[state.game.mission]; showLesson(); }
  showSaveStatus(loaded.legacySourceStatus === 'changed' ? '旧源已分叉，不合并、不覆盖。' : loaded.migrated ? '一次迁移完成，原件保留。' : '已读取。'); controls();
});
$('reload').addEventListener('click', () => { if (!confirm('请先导出未保存的代码。现在重载已保存版本吗？')) return; if (active) cancel(); buffer.discard(); draftNotice = ''; const loaded = store.readLatest(); if (loaded.state) { state = loaded.state; saveStatus = loaded.status; $('lesson').value = LESSON_IDS[state.game.mission]; showLesson(); showSaveStatus(); } });
$('export').addEventListener('click', () => { if (state) download(`pipi-integration-${caseID}.json`, JSON.stringify(state, null, 2)); });
$('exportDraft').addEventListener('click', () => download(`pipi-${mode === 'shop' ? 'shop' : selected().id}.py`, $('code').value, 'text/x-python;charset=utf-8'));
$('prepare').addEventListener('click', () => void runtime.prepare());
$('stop').addEventListener('click', () => cancel());
$('mode').addEventListener('change', () => { if (!flushBeforeNavigation()) { $('mode').value = mode; return; } if (active) cancel('切换终端，前一次运行已停止。'); mode = $('mode').value; assisted = false; showLesson(); });
$('lesson').addEventListener('change', () => { if (!flushBeforeNavigation()) { $('lesson').value = draftContext.lessonId || LESSON_IDS[state.game.mission]; return; } if (active) cancel('切换委托，前一次运行已停止。'); if (state) { state = selectContext(state, { lessonId: selected().id }); void persist(); } assisted = false; showLesson(); });
$('scene').addEventListener('change', () => { if (active) cancel('场景已变化，前一次运行已停止。'); });
$('reference').addEventListener('click', () => { if (!flushBeforeNavigation()) return; $('code').value = mode === 'shop' ? 'game.buy("catnip")' : selected().solution; assisted = true; edit(); });
$('starter').addEventListener('click', () => { if (!flushBeforeNavigation()) return; $('code').value = mode === 'shop' ? 'game.buy("scarf")' : selected().starter; assisted = false; edit(); });
$('code').addEventListener('input', edit);
$('run').addEventListener('click', async () => {
  if (!state || phase !== 'ready' || active) return;
  edit();
  if (!buffer.flush()) return;
  const slot = { requestId: nextRequestId(), generation: epoch }; active = slot; controls();
  try {
    const token = await createSubmission(state, { kind: mode, lessonId: mode === 'lesson' ? selected().id : null, code: $('code').value, scene: $('scene').value, requestId: slot.requestId, generation: slot.generation, assisted, now: performance.now() });
    if (active !== slot || epoch !== slot.generation) return;
    $('result').textContent = '正在运行提交时的代码…'; $('stdout').textContent = ''; $('checks').replaceChildren();
    const outcome = await runtime.run(token);
    if (active !== slot) return;
    if (!outcome.rawResult) { $('result').textContent = `${outcome.kind}：${outcome.message || '未结算'}`; return; }
    const accepted = acceptResult(state, token, { kind: mode, lessonId: mode === 'lesson' ? selected().id : null, code: $('code').value, scene: $('scene').value, requestId: active.requestId, generation: epoch }, outcome.rawResult, { now: performance.now(), at: Date.now() });
    state = accepted.state;
    $('result').textContent = accepted.kind === 'discarded' ? '旧稿或旧场景结果已丢弃，当前稿待重新运行，本次未结算。' : `${accepted.kind} · 首奖 ${accepted.reward || 0}${accepted.message ? ` · ${accepted.message}` : ''}`;
    $('stdout').textContent = accepted.stdout || '';
    for (const check of accepted.checks || []) { const li = document.createElement('li'); li.textContent = `${check.passed ? '✓' : '×'} ${check.label}${check.detail ? `：${check.detail}` : ''}`; $('checks').append(li); }
    await persist();
  } catch (error) { $('result').textContent = error.message; }
  finally { if (active === slot) active = null; controls(); }
});
window.addEventListener('storage', event => {
  if (event.key === prefix + INTEGRATED_SAVE_KEY) { const observed = store.observe(); saveStatus = observed.status; showSaveStatus('另一个标签页更改了存档，请导出后重载。'); }
  if (event.key === prefix + SAVE_KEY && state) showSaveStatus(`旧源状态：${store.checkLegacySource(state)}，不自动合并。`);
});
window.addEventListener('pagehide', () => { buffer.flush(); runtime.dispose(); });
showLesson(); controls();
