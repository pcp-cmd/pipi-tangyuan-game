import { getLesson, LESSON_IDS } from './contracts.mjs';
import { freshEnvelope, parseEnvelope, updateDraft, selectContext, assessmentStatus, MAX_ENVELOPE_BYTES } from './state.mjs';
import { createIntegrationStore } from './retained-store.mjs';
import { createDraftBuffer } from './draft-buffer.mjs';
import { createRequestIds } from './request-ids.mjs';
import {accessOf as courseAccessOf, learningAccessSummary} from './lesson-access.mjs';
import {classroomEvidence, classroomGraduationView} from './classroom-graduation.mjs';
import {selectAccessibleContext, createAccessibleSubmission, acceptAccessibleResult} from './guarded-course.mjs';
import {acceptExternalAssignment, recordExternalSubmission as recordWork, importExternalReceipt as importWorkReceipt,
  inspectExternalWork, externalWorkView as viewWork} from './external-work.mjs';
import {TRUSTED_EXTERNAL_ASSESSORS} from './external-review-policy.mjs';

const hardBlocked = status => ['conflict', 'invalid', 'invalid-legacy', 'invalid-state', 'stale-state', 'pending-local', 'missing-authority', 'recovery-present', 'recovery-invalid', 'locks-required'].includes(status);

export function createWorldSession({ storage, locks, runtime, readCode, readScene = () => 'normal', now = () => performance.now(), at = () => Date.now(), onChange = () => {}, setTimer, clearTimer, tabID, retention, lessonGate = null, reviewTrust = TRUSTED_EXTERNAL_ASSESSORS, workUuid = () => crypto.randomUUID() }) {
  const store = createIntegrationStore({ storage, locks, tabID, retention });
  const nextRequestId = createRequestIds();
  let envelope = null, loadedValid = false, localEnvelopeValid = false, loadResult = null, lastReadRaw = null, status = 'idle', notice = '';
  let epoch = 0, active = null, disposed = false, loadPromise = null, writeSerial = 0, pendingWrites = 0;
  let pendingWrite = Promise.resolve({ status: 'idle' });
  let navigationTail = Promise.resolve(), selecting = 0, editorLessonId = null, editSerial = 0;
  const buffer = createDraftBuffer({ commit: commitDraft, setTimer, clearTimer });
  const frozenObjects = new WeakSet();
  let accessSource = null, accessSummary = null;
  let graduationSource = null, graduationCurrent = null, confirmedGraduationRaw, confirmedGraduationEvidence = null;
  const accessViews = new Map();
  const recoveryControllers = new Set();
  let externalBusy = false, externalInspection = null;

  function protectEnvelope(value) {
    if (!value || typeof value !== 'object' || frozenObjects.has(value)) return value;
    for (const child of Object.values(value)) protectEnvelope(child);
    Object.freeze(value); frozenObjects.add(value); return value;
  }
  function accessInput() {
    const source = loadedValid ? envelope : null;
    if (source !== accessSource) { accessSource = source; accessViews.clear(); accessSummary = null; }
    return source;
  }
  function accessView(id) {
    const source = accessInput();
    if (!accessViews.has(id)) accessViews.set(id, courseAccessOf(source, id));
    const course = accessViews.get(id);
    if (!source || lessonGate === null) return course;
    let world;
    try { world = lessonGate({lessonId: id, envelope: source}); } catch {}
    if (world?.available === true) return course;
    const reason = typeof world?.reason === 'string' && world.reason ? world.reason : '暂时无法确认航线。草稿已保留，请回到地图重试。';
    return Object.freeze({...course, state: 'locked', canSelect: false, canRun: false,
      reason: course.canRun ? reason : course.reason, worldAccess: Object.freeze({available: false, reason})});
  }
  function summaryView() {
    const source = accessInput();
    if (!accessSummary) accessSummary = learningAccessSummary(source);
    if (lessonGate === null || !source) return accessSummary;
    const rows = LESSON_IDS.map(accessView);
    return Object.freeze({...accessSummary, accessible: rows.filter(row => row.canRun).length, locked: rows.filter(row => row.state === 'locked').length});
  }

  function graduationView() {
    const source = loadedValid ? envelope : null, confirmedSave = store.snapshot();
    if (source !== graduationSource) { graduationSource = source; graduationCurrent = classroomEvidence(source); }
    if (confirmedSave.raw !== confirmedGraduationRaw) {
      confirmedGraduationRaw = confirmedSave.raw; confirmedGraduationEvidence = null;
      if (typeof confirmedSave.raw === 'string') {
        try { confirmedGraduationEvidence = classroomEvidence(parseEnvelope(confirmedSave.raw)); } catch {}
      }
    }
    return classroomGraduationView({current: graduationCurrent, saved: confirmedGraduationEvidence, loadedValid, disposed,
      authorityBlocked: hardBlocked(status) || hardBlocked(confirmedSave.status), status, storeStatus: confirmedSave.status,
      pendingWrites, dirty: confirmedSave.dirty});
  }

  function snapshot() {
    return Object.freeze({ envelope, game: envelope?.game, loadedValid, localEnvelopeValid, status, notice, pendingDraft: buffer.snapshot(), pendingWrites, busy: !!active || externalBusy, selecting: selecting > 0, epoch, loadResult, access:accessView(LESSON_IDS[envelope?.game.mission ?? 0]) });
  }
  function notify() { try { onChange(snapshot()); } catch {} }
  function updateStatus(result) { status = result.status; notify(); return result; }
  function persist() {
    if (!loadedValid || disposed) return Promise.resolve({ status: 'invalid-state' });
    const savedState = envelope, serial = ++writeSerial;
    pendingWrites++; status = 'saving'; notify();
    pendingWrite = (async () => {
      let result;
      try { result = await store.save(savedState); }
      catch { result = { status: 'error' }; }
      pendingWrites--;
      if (serial === writeSerial) status = result.status;
      notify(); return result;
    })();
    return pendingWrite;
  }
  function commitDraft(draft) {
    if (!loadedValid || disposed || hardBlocked(status)) {
      notice = '草稿未保存：请先导出代码，再处理存档冲突。'; notify(); return false;
    }
    try {
      envelope = protectEnvelope(updateDraft(envelope, draft)); notice = ''; void persist(); return true;
    } catch (error) {
      notice = error.name === 'DraftCapacityError'
        ? '草稿未保存：存档总量已满。完整代码仍在编辑器，请先导出。'
        : '草稿未保存：请先导出完整代码，再检查长度或存档。';
      notify(); return false;
    }
  }
  function edit(code, { assisted = envelope?.draftAssistance[editorLessonId] === true } = {}) {
    if (!loadedValid || disposed) return false;
    editSerial++;
    buffer.mark({ kind: 'lesson', lessonId: editorLessonId, code, assisted });
    notice = '新草稿等待合并保存…'; notify(); return true;
  }
  async function flush() {
    if (!loadedValid || disposed || !buffer.flush()) return false;
    const writing = pendingWrite;
    await writing;
    if (buffer.snapshot() || writing !== pendingWrite) { notice = '代码又有更新，请等保存完成后再切换。'; notify(); return false; }
    if (status !== 'saved') { notice = '当前进度尚未确认保存。请导出备份，或重试保存。'; notify(); return false; }
    return true;
  }
  function cancel() {
    epoch++;
    const old = active; active = null;
    if (old) runtime()?.stop();
    notify();
  }
  async function load() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      loadResult = await store.loadOrMigrate();
      loadedValid = !!loadResult.state;
      localEnvelopeValid = loadedValid;
      if (typeof loadResult.raw === 'string') lastReadRaw = loadResult.raw;
      envelope = protectEnvelope(loadResult.state || freshEnvelope());
      editorLessonId = LESSON_IDS[envelope.game.mission];
      status = loadResult.status;
      if (!loadedValid) notice = loadResult.status === 'recovery-present'
        ? '发现旧恢复来源，尚未新建进度。请打开备份管理查看并导出，旧记录不会被空白游戏覆盖。'
        : '原存档未通过校验，已暂停课程与写入。原件保留，可从手账导出。';
      else if (loadResult.legacySourceStatus === 'changed') notice = '旧版存档已发生分叉，未覆盖或合并金币。请先导出两份记录。';
      await refreshExternalWork();
      notify(); return snapshot();
    })();
    return loadPromise;
  }
  async function select({ lessonId = LESSON_IDS[envelope?.game.mission], activeCat = envelope?.game.activeCat } = {}, { isCurrent = () => true } = {}) {
    if (externalBusy) { notice = '正在保存作品记录，请稍候。'; notify(); return false; }
    const initialAccess = accessView(lessonId);
    if (!loadedValid || (lessonId !== editorLessonId && !initialAccess.canSelect)) { notice = initialAccess.reason; notify(); return false; }
    cancel();
    const generation = epoch, prior = navigationTail;
    let release;
    navigationTail = new Promise(resolve => { release = resolve; });
    selecting++; notify();
    try {
      await prior;
      if (generation !== epoch || !isCurrent() || !await flush()) return false;
      if (generation !== epoch || !isCurrent()) return false;
      const previous = { lessonId: editorLessonId, activeCat: envelope.game.activeCat }, serial = editSerial;
      const targetAccess = accessView(lessonId);
      if (lessonId !== editorLessonId && !targetAccess.canSelect) { notice = targetAccess.reason; notify(); return false; }
      // Same visible lesson may change cats even when a restored lesson is locked;
      // this does not grant permission to execute it. New lessons use the guard.
      envelope = protectEnvelope(lessonId === editorLessonId ? selectContext(envelope, { lessonId, activeCat }) : selectAccessibleContext(envelope, { lessonId, activeCat }));
      const saved = await persist();
      const savedAccess = accessView(lessonId);
      const accessRevoked = lessonId !== previous.lessonId && !savedAccess.canSelect;
      if (saved.status !== 'saved' || generation !== epoch || !isCurrent() || serial !== editSerial || accessRevoked) {
        if (accessRevoked) notice = savedAccess.reason;
        // A new revision restores the visible context, never an old state snapshot.
        // Any input that arrived during the wait is still bound to the old editor.
        envelope = protectEnvelope(selectContext(envelope, previous));
        if (saved.status === 'saved') await persist();
        notify(); return false;
      }
      editorLessonId = lessonId;
      return true;
    } finally { selecting--; release(); notify(); }
  }
  async function run() {
    if (active || externalBusy || selecting || disposed || !loadedValid || hardBlocked(status)) return { kind: 'save-blocked', message: '请先处理未保存的草稿或存档冲突。', epoch };
    const entryAccess = accessView(LESSON_IDS[envelope.game.mission]);
    if (!entryAccess.canRun) { notice = entryAccess.reason; notify(); return {kind:'access-denied', access:entryAccess, message:notice, epoch}; }
    const slot = { requestId: nextRequestId(), generation: epoch };
    active = slot; notify();
    try {
      edit(readCode(), { assisted: buffer.snapshot()?.assisted ?? envelope.draftAssistance[LESSON_IDS[envelope.game.mission]] === true });
      if (!await flush()) return { kind: 'save-blocked', message: notice, epoch: slot.generation };
      if (active !== slot || epoch !== slot.generation) return { kind: 'cancelled', epoch: slot.generation };
      const lessonId = LESSON_IDS[envelope.game.mission], code = readCode(), scene = readScene();
      const afterSave = accessView(lessonId);
      if (!afterSave.canRun) return {kind:'access-denied', access:afterSave, message:afterSave.reason, epoch:slot.generation, lessonId};
      const token = await createAccessibleSubmission(envelope, { kind: 'lesson', lessonId, code, scene, requestId: slot.requestId, generation: slot.generation, now: now() });
      if (active !== slot || epoch !== slot.generation) return { kind: 'cancelled', epoch: slot.generation };
      const beforeWorker = accessView(lessonId);
      if (!beforeWorker.canRun) return {kind:'access-denied', access:beforeWorker, message:beforeWorker.reason, epoch:slot.generation, lessonId};
      const result = await runtime().run(token);
      if (active !== slot || epoch !== slot.generation) return { kind: 'cancelled', epoch: slot.generation };
      if (!result.rawResult) return { ...result, epoch: slot.generation, lessonId };
      const beforeSettlement = accessView(lessonId);
      if (!beforeSettlement.canRun) return {kind:'access-denied', access:beforeSettlement, message:beforeSettlement.reason, epoch:slot.generation, lessonId};
      const accepted = acceptAccessibleResult(envelope, token, { kind: 'lesson', lessonId: LESSON_IDS[envelope.game.mission], code: readCode(), scene: readScene(), requestId: slot.requestId, generation: epoch }, result.rawResult, { now: now(), at: at() });
      if (accepted.kind === 'access-denied') return {...accepted, epoch:slot.generation, lessonId};
      const feedbackCode = readCode(), feedbackScene = readScene();
      envelope = protectEnvelope(accepted.state);
      const saved = await persist();
      return { ...accepted, epoch: slot.generation, lessonId, feedbackCode, feedbackScene, elapsedMs: result.elapsedMs, saved: saved.status === 'saved' };
    } catch (error) {
      if (active !== slot || epoch !== slot.generation) return { kind: 'cancelled', epoch: slot.generation };
      throw error;
    } finally {
      if (active === slot) { active = null; notify(); }
    }
  }
  function observe() {
    cancel();
    const result = store.observe();
    if (result.status === 'conflict') notice = '另一个页面修改了存档。此页不会覆盖，请先导出代码和进度，再重载。';
    else if (result.status === 'error') notice = '暂时无法核对已保存记录。当前内容仍保留，请先导出备份。';
    return updateStatus(result);
  }
  function reloadSaved({ discardPending = false } = {}) {
    if (selecting || pendingWrites || active || externalBusy) {
      notice = '正在完成运行或保存，尚未重载。请等当前操作结束后再试。';
      notify(); return snapshot();
    }
    if (!discardPending && (buffer.snapshot() || store.snapshot().dirty)) {
      notice = '本地仍有未保存内容。请先导出，或明确选择放弃本地编辑后重载；持久恢复分支仍会保留。';
      notify(); return Object.freeze({ ...snapshot(), reloadStatus: 'pending-local' });
    }
    cancel(); notice = '';
    const result = store.readLatest({ discardPending });
    loadResult = result;
    if (typeof result.raw === 'string') lastReadRaw = result.raw;
    if (result.state) {
      buffer.discard(); loadedValid = true; localEnvelopeValid = true; envelope = protectEnvelope(result.state);
      editorLessonId = LESSON_IDS[envelope.game.mission];
      externalInspection = null; void refreshExternalWork();
    } else if (result.status !== 'pending-local') {
      // A failed read must not replace a still-exportable local result with a
      // fresh120-coin state or discard the full editor draft.
      loadedValid = false;
      notice = result.status === 'missing-authority'
        ? '主记录已不在原位置，本地内容未丢弃。请先导出恢复备份，不会新建空白进度覆盖。'
        : '已保存的原件仍不可读取，本地内容未丢弃。请导出原件和待保存内容。';
    }
    updateStatus(result); return Object.freeze({ ...snapshot(), reloadStatus: result.status });
  }
  async function retrySave() {
    if (!loadedValid || hardBlocked(status)) return false;
    if (!buffer.flush()) return false;
    const result = await persist();
    if (result.status === 'saved') notice = '';
    notify(); return result.status === 'saved';
  }
  async function refreshExternalWork() {
    const source = envelope?.externalWork ?? null;
    if(source===null) { externalInspection={submissions:{},reviews:{}}; return; }
    let checked = null;
    try { checked = await inspectExternalWork(source, {trust:reviewTrust,now:Math.round(at())}); } catch {}
    if (!disposed && source === (envelope?.externalWork ?? null)) { externalInspection=checked; notify(); }
  }
  function externalWorkView() {
    return viewWork(envelope?.externalWork ?? null, {inspection:externalInspection,busy:externalBusy,
      persisted:loadedValid && status==='saved' && pendingWrites===0 && !store.snapshot().dirty});
  }
  async function changeExternalWork(operation) {
    if(disposed || !loadedValid || active || externalBusy || selecting || hardBlocked(status))
      return {ok:false,reason:'save-blocked',message:'请先完成运行或处理当前保存，再登记作品。'};
    externalBusy=true; notify();
    try {
      if(!await flush()) return {ok:false,reason:'save-blocked',message:notice};
      const source=envelope,generation=epoch;
      const change=await operation(source.externalWork);
      if(!change.ok) return change;
      if(disposed || envelope!==source || epoch!==generation || buffer.snapshot())
        return {ok:false,reason:'changed-during-review',message:'当前草稿或旅程已有变化，请保留材料并重试登记。'};
      if(!change.changed) return {ok:true,changed:false,saved:status==='saved',view:externalWorkView()};
      const candidate = JSON.stringify({...source,revision:source.revision+1,externalWork:change.value});
      // New engineering records leave space for later drafts and learning history.
      // Existing larger saves remain readable; the unchanged/idempotent path above
      // deliberately bypasses this admission budget. No historical rows are pruned.
      const candidateBytes = new TextEncoder().encode(candidate).length;
      const recoveryEncodedBytes = new TextEncoder().encode(JSON.stringify(candidate)).length;
      const workAdmissionBytes = MAX_ENVELOPE_BYTES - 2 * 1024 * 1024;
      if(candidateBytes > workAdmissionBytes || recoveryEncodedBytes > workAdmissionBytes)
        return {ok:false,reason:'work-capacity',capacityDomain:candidateBytes > workAdmissionBytes?'envelope':'recovery-encoding',
          message:'这段旅程暂时容不下这些工程材料。可以减少本次附加日志后再试；这次提交包仍可下载，已有记录保留，仍可继续课程。请同时导出旅程备份。'};
      envelope=protectEnvelope(parseEnvelope(candidate));
      externalInspection=null;
      const saved=await persist();
      await refreshExternalWork();
      if(saved.status!=='saved') notice='作品或回执已留在当前页面，但尚未确认写入手账。请保留原文件并重试保存。';
      return {ok:true,changed:true,saved:saved.status==='saved',status:saved.status,
        submissionDigest:change.submissionDigest??null,reviewId:change.reviewId??null,view:externalWorkView()};
    } catch { return {ok:false,reason:'invalid-work-record',message:'作品记录未通过核对，原课程成绩和奖励未改变。'}; }
    finally { externalBusy=false; notify(); }
  }
  const acceptExternalTask = taskId => changeExternalWork(value=>({ok:true,...acceptExternalAssignment(value,taskId,Math.round(at()),workUuid)}));
  const recordExternalSubmission = prepared => changeExternalWork(value=>recordWork(value,prepared,Math.round(at())));
  const importExternalReceipt = text => changeExternalWork(value=>importWorkReceipt(value,text,{trust:reviewTrust,now:Math.round(at())}));
  function externalSubmissionBundle(taskId,submissionDigest) {
    const row=envelope?.externalWork?.assignments.find(task=>task.taskId===taskId)?.submissions.find(row=>row.submissionDigest===submissionDigest);
    if(!row || externalInspection?.submissions[submissionDigest]!==true) return {ok:false,reason:'unverified-material',message:'这份保存材料尚未完成摘要核对。'};
    return {ok:true,text:row.bundleText,filename:`${taskId}-submission-${submissionDigest.slice(0,12)}.json`};
  }
  function dispose() {
    if (disposed) return;
    for (const controller of recoveryControllers) controller.dispose();
    recoveryControllers.clear();
    cancel(); buffer.flush(); disposed = true; runtime()?.dispose();
  }
  function createMissingAuthorityRecovery({scope, onChange, readFile, digest} = {}) {
    const controller = store.missingAuthorityRecovery({scope, onChange, readFile, digest,
      canRestore: () => !disposed && !loadedValid && !localEnvelopeValid && status === 'recovery-present' &&
        !active && !selecting && !pendingWrites && !buffer.snapshot(),
      onReload: () => {
        if (disposed) return {status: 'session-closed'};
        const result = reloadSaved();
        // A busy/selection refusal returns the existing snapshot. Its saved
        // status describes an earlier write, not a new successful read.
        return {status: result.reloadStatus ?? 'read-required'};
      }});
    recoveryControllers.add(controller);
    return controller;
  }
  return Object.freeze({ load, edit, flush, select, run, cancel, observe, reloadSaved, retrySave, dispose, snapshot,
    acceptExternalTask, recordExternalSubmission, importExternalReceipt, externalWorkView, externalSubmissionBundle, refreshExternalWork,
    currentLesson: () => getLesson(LESSON_IDS[envelope?.game.mission ?? 0]),
    learningStatus: id => envelope ? assessmentStatus(envelope, id) : 'unobserved',
    accessOf: accessView,
    learningSummary: summaryView,
    graduationView,
    isCurrent: outcome => outcome?.epoch === epoch && (outcome.feedbackCode === undefined || outcome.feedbackCode === readCode() && outcome.feedbackScene === readScene() && outcome.lessonId === LESSON_IDS[envelope?.game.mission]),
    exportState: () => envelope ? JSON.stringify(envelope, null, 2) : null,
    original: () => lastReadRaw ?? envelope?.migration?.original ?? null,
    recoveries: () => store.recoveries(),
    inspectRecoveryInbox: () => store.inspectInbox(),
    pendingExport: () => store.pendingExport(),
    releaseArchived: archive => store.releaseArchived(archive), createMissingAuthorityRecovery,
    hasUnsaved: () => !!buffer.snapshot() || pendingWrites > 0 || store.snapshot().dirty ||
      localEnvelopeValid && !loadedValid || loadedValid && status !== 'saved'
  });
}
