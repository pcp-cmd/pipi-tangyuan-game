import {serviceJournalPage} from './service-buildings.mjs';
import { renderCourseLearning, presentRunChecks } from './course-learning-view.mjs';
import { mountLandmarkSign } from './landmark-signs.mjs';
import { renderMarketStockContext } from './market-stock-context.mjs';
import { createFirstEntrySourceReader, canDescribeCurrentFirstStepAsStart } from './first-entry-start.mjs';
import { firstFailureView, renderFirstFailureFeedback } from './first-failure-feedback.mjs';
import { evidenceCompatibility } from './learning-history.mjs';
import { createErrorLineAction } from './error-line-action.mjs';
import { renderKnowledgeText } from './knowledge-reader.mjs';
import { lessonSceneView } from './course-scenes.mjs';
import { accessLabel, accessSummaryCopy, allowLessonIntent, successContinuation } from './lesson-access-view.mjs';
import { LESSONS, LESSON_IDS, ASSESSMENT_VERSION, evidenceVersionFor } from '../integration/contracts.mjs';
import { orderedLearningLessons, learningOrdinal } from './learning-order.mjs';
import { createWorldSession } from '../integration/world-session.mjs';
import { exportWorldProgress } from '../integration/world-recovery.mjs';
import { WORLD_SAVE_KEY, WORLD_PREFIX } from './world-storage.mjs';
import { createJourneys, JOURNEY_INDEX_KEY, JOURNEY_PREFIX } from './journeys.mjs';
import { createPhysicalWorld, parsePhysicalState } from './physical-world.mjs';
import { PHYSICAL_SCENES, PHYSICAL_PORTS, PHYSICAL_ROUTES, physicalScene } from './physical-scenes.mjs';
import { createArrivalIntent } from './arrival-intent.mjs';
import { createHotspotClickIntent } from './hotspot-click-intent.mjs';
import { coursePresentation, courseCardView, coursesForScene } from './course-presentation.mjs';
import { mountLighthousePanel } from './lighthouse-panel.mjs';
import { routesFromPort, planVoyage } from './world-travel.mjs';
import { islandAccess, lessonIslandAccess, voyageAccess } from './learning-milestones.mjs';
import { buildingOffering, buildingLessonIds } from './building-offerings.mjs';
import { mountPhysicalPresentation } from './physical-presentation.mjs';
import { mountRecoveryPanel } from './recovery-panel.mjs';
import { freshState, TILES } from '../dist/engine.js';
import { SAVE_KEY, CAMERA_KEY, CAT_NAMES, SCENE, REGIONS, questContext } from './scene-model.js';
import { GestureClickGuard } from './gesture-click-guard.js';
import { readDiscoveries, visitPlace, loadDiscoveryStorage, saveDiscoveryStorage } from './exploration-model.js';
import { planIndentation, planContinuedIndentation } from './editor-helpers.mjs';
import { createCompanionSprites } from './pets-renderer.mjs';
import { mountCompanionInput } from './companion-input.mjs';
import { externalAssignment } from '../integration/external-work.mjs';
import { createReferencePreview } from './reference-preview.mjs';
import { createAtlasView } from './atlas-view.mjs';
import { moveTerrainAim } from './scene-terrain.mjs';
import { mountSceneKeyboardFocus } from './scene-keyboard-focus.mjs';
import { mountLearningWorkbench } from './learning-workbench.mjs';
import { createPresentationTransitions } from './presentation-transitions.mjs';
import { mountJournalPreferences, mapMovementKey } from './journal-preferences.mjs';
import { mountHarborCanopyWind } from './harbor-canopy-wind.mjs';
import { reportStartupStage } from './generated/startup.mjs';
import { coordinateSceneStartup } from './generated/scene-startup.mjs';
import { loadJournalRuntime, loadPaperRuntime } from './generated/journal-runtime.mjs';
import { mountStartupRecovery } from './generated/startup-recovery.mjs';

const $ = id => document.getElementById(id);
const lessons = LESSONS;
const lessonIds = lessons.map(item => item.id);
const MAX_CODE = 20000;
const EXPLORATION_KEY = `${SAVE_KEY}:exploration`;
const journeys = createJourneys({ storage: localStorage, locks: navigator.locks, selectionStorage: sessionStorage });
reportStartupStage('save');
const openedJourney = await journeys.open();
if (!openedJourney.ok) {
  const help = document.createElement('section'); help.className = 'journey-start-error';
  const title = document.createElement('h2'); title.textContent = '旅程原件已保留';
  const message = document.createElement('p'); message.textContent = openedJourney.message;
  const exportRaw = document.createElement('button'); exportRaw.type = 'button'; exportRaw.textContent = '导出原始旅程数据';
  exportRaw.addEventListener('click', () => {
    const entries = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .filter(key => key === JOURNEY_INDEX_KEY || key?.startsWith(JOURNEY_PREFIX) || key?.startsWith(WORLD_PREFIX))
      .map(key => ({ key, value: localStorage.getItem(key) }));
    downloadText(JSON.stringify({ format: 'pipi-browser-journeys/recovery-v1', entries }, null, 2), 'pipi-original-journeys-recovery.json');
  });
  help.append(title, message, exportRaw); document.body.append(help);
  throw Error(openedJourney.message);
}
const journeyIO = journeys.io();
const journeyStorage = journeyIO.storage;
const placeIds = SCENE.places.map(place => place.id);
let discoveries = readDiscoveries(null, placeIds);
let discoveriesSaved = false;
try {
  const loaded = loadDiscoveryStorage(journeyStorage, EXPLORATION_KEY, placeIds);
  discoveries = loaded.record; discoveriesSaved = loaded.saved;
} catch { /* Sightseeing remains available without storage. */ }
const briefCopy = ['用变量，让伙伴前进 3 格', '算好鱼饼生意的第一笔账', '写一张带着名字的明信片'];
let state = freshState();
let initialized = false;
let navigation = 0;
let journalFilter = 'all';
let camera = { x: SCENE.width / 2, y: SCENE.height / 2, zoom: 1, follow: true };
let panel = { kind: null, help: { concept: false, hint: false }, placeId: null, regionId: 'departure' };
let runtime = null;
let runtimeModule = null;
let runtimeImport = null;
let runtimeImportRetry = 0;
let runtimePhase = 'idle';
let runBusy = false;
let assisted = false;
let lastOpener = null;
let editorEscape = false;
let editorRevision = 0;
let renderedEditorLessonId = null;
let lessonContentReady = false;
const readFirstEntrySource = createFirstEntrySourceReader();
let toastTimer;
let cameraTimer;
let moveTimer;
let companionSprites = null;
let companionInput = null, companionRun = null, externalWorkPanel = null, classroomGraduation = null;
let sceneKeyboardFocus = null;
let physicalWorld = null, physicalPresentation = null, panelSpaceRelease = null, canopyWind = null;
let journeyBusy = false, renderedPhysicalScene = null;
let workbenchMode = 'learn', lastAcceptedResult = null, plannedIsland = null;
let cameraHolds = 0;
let approachRequest = null;
let journalExplorer = null, journalPages = null, journalReady = null;
let mailboxNote = null, paperControls = null, pythonStatus = null, paperReady = null;
let recoveryPanel = null, startupRecovery = null;
const arrivalIntent = createArrivalIntent();
const hotspotClickIntent = createHotspotClickIntent({ holdCamera: () => {
  cameraHolds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    cameraHolds = Math.max(0, cameraHolds - 1);
    if (!cameraHolds && camera.follow && physicalWorld && !panel.kind) focusCats(false, false);
  };
} });
const drawnActorPositions = new Map();
let previousViewport = { width: 0, height: 0 };
const preferences = mountJournalPreferences({ root: $('journalPreferences'),
  systemMotion: matchMedia('(prefers-reduced-motion: reduce)'),
  onChange: () => { stopKeyboardMovement(); updateMovementHint(); },
});
const reducedMotion = preferences.motionPreference;
const presentationTransitions = createPresentationTransitions({ motionPreference: reducedMotion });
const learningWorkbench = mountLearningWorkbench({ root: $('workshopPanel'), document, reducedMotion: () => reducedMotion.matches });
let roaming = true;
let groundAim = { x:.5, y:.5 };
const mobile = () => innerWidth <= 760;
const icon = name => { const image = document.createElement('img'); image.src = `./assets/icons/${name}.svg`; image.alt = ''; image.className = 'icon'; return image; };

const atlasView = createAtlasView({ viewport: $('atlasViewport'), stage: $('atlasStage'), art: $('atlasArt'),
  zoomIn: $('atlasZoomIn'), zoomOut: $('atlasZoomOut'), fit: $('atlasFit'), detail: $('regionDetail'), initialView: 'fit',
  preparePinFocus: () => { const detail = $('regionDetail'); const changed = !detail.hidden; detail.hidden = true; return changed; },
  topInset: () => Math.max(72, ...[$('panel').querySelector('.panel-header'), $('mapPanel').querySelector('.atlas-tools')]
    .filter(Boolean).map(node => node.getBoundingClientRect().bottom - $('atlasViewport').getBoundingClientRect().top + 12)) });
const modalPanel = () => !!panel.kind && (mobile() || ['map','journal','workshop','lighthouse','travel','inspection'].includes(panel.kind));

const persistence = journeyIO.learning;
const session = createWorldSession({ ...persistence, runtime: () => runtime,
  lessonGate: ({lessonId, envelope}) => lessonIslandAccess({lessonId, envelope, physical: physicalWorld?.view()}),
  readCode: () => $('codeEditor').value, readScene: () => $('protocolScene').value,
  onChange: view => {
    if (view.game) state = view.game;
    const copy = view.notice || ({ saved: '进度与草稿已保存。', saving: '正在保存…', conflict: '另一页面已改动存档，请先导出。', 'backup-only': '浏览器不支持安全协调，当前仅保留恢复备份。', 'locks-required': '浏览器不支持安全协调。当前内容未保存，请先导出。', 'recovery-capacity': '恢复空间已满，旧备份未删除。请先导出当前完整草稿。', 'recovery-owner-conflict': '本页仍有不同的旧恢复分支，不能覆盖。请先保留两份内容。', 'recovery-invalid': '恢复记录无法校验，原件未覆盖。请先导出当前内容。', 'recovery-error': '恢复备份尚未确认写入。请保持页面打开并导出完整内容。', 'pending-local': '本地仍有未保存内容，请先导出或明确重载。', 'missing-authority': '已保存的主记录已不在原位置。本地内容仍保留，请先导出，不会新建空白进度覆盖。', error: '保存未完成，当前进度仍在页面，请导出后重试。' }[view.status] || '原存档受保护，请先导出再处理。');
    $('saveStatus').textContent = copy; $('editorSaveStatus').textContent = copy;
    $('downloadOriginal').hidden = !session?.original();
    if (initialized) {
      if (!view.selecting) updateQuest();
      syncControls();
      if (panel.kind === 'journal') { externalWorkPanel?.render(); classroomGraduation?.render(); }
    }
  }
});

function ensurePaperPanels() {
  if (paperReady) return paperReady;
  paperReady = loadPaperRuntime().then(({ mountMailboxNote, mountPythonStatus, mountPaperControls }) => {
    mailboxNote = mountMailboxNote({ panel: $('panel'), content: $('inspectionCourses'), intro: $('inspectionText'), returnButton: $('inspectionJournal') });
    paperControls = mountPaperControls($('panel'));
    pythonStatus = mountPythonStatus({ row: $('runtimeStatus').parentElement, status: $('runtimeStatus'), editor: $('workshopPanel').querySelector('.code-area') });
    syncControls();
  }).catch(error => { paperReady = null; throw error; });
  return paperReady;
}

function ensureJournalPanels() {
  if (journalReady) return journalReady;
  journalReady = Promise.all([loadJournalRuntime(), ensurePaperPanels()]).then(([modules]) => {
    journalExplorer = modules.createJournalExplorer({
  lessons, assessmentVersion: ASSESSMENT_VERSION, evidenceVersionFor, session,
  groupOf: lessonGroup, selectedGroup: () => journalFilter, chooseLesson,
  isVisible: () => panel.kind === 'journal' && $('journalPanel').dataset.journalPage === 'courses',
  describeStart: (view, pendingSelection) => firstEntryStart(view, pendingSelection),
  onNavigationChange: () => refreshRegionEntryCopy(),
  elements: { list: $('journalEntries'), search: $('journalSearch'), filter: $('journalStatus'),
    count: $('journalResultCount'), summary: $('journalLearningSummary'), current: $('journalCurrent'),
    clear: $('clearJournalFilters'), empty: $('journalEmpty'), notice: $('journalSelectionNotice') }
    });
    externalWorkPanel = modules.mountExternalWorkPanel({ root: $('externalWorkContent'), session, download: downloadText, browseCourse,
      canWrite: () => !journeyBusy && !runBusy && session.snapshot().loadedValid && !session.snapshot().selecting });
    classroomGraduation = modules.mountClassroomGraduation({ root: $('classroomGraduation'), session, browseCourse, download: downloadText });
    journalPages = modules.mountJournalPages({ root: $('journalPanel'), onPageChange: page => {
      if (page === 'courses') { journalExplorer.render(); externalWorkPanel.render(); }
      if (page === 'saves') renderJourneys();
      if (page === 'discoveries') renderWorldDiscoveries();
      paperControls.refresh();
      syncCompanionPresentation();
    } });
  }).catch(error => { journalReady = null; throw error; });
  return journalReady;
}

function companionSlots() {
  if (document.hidden) return [];
  const surface = panel.kind === 'workshop' ? 'workbench'
    : panel.kind === 'journal' && $('journalPanel').dataset.journalPage === 'companions' ? 'portraits' : null;
  return surface ? ['pipi', 'tangyuan'].map(cat => ({ cat, slot: surface === 'workbench'
    ? $(cat === 'pipi' ? 'workbenchPipiSlot' : 'workbenchTangyuanSlot') : $(`${cat}Portrait`).parentElement })) : [];
}

function syncCompanionPresentation() {
  $('openMap').setAttribute('aria-pressed', String(panel.kind === 'map'));
  $('openJournal').setAttribute('aria-pressed', String(panel.kind === 'journal'));
  if (!companionSprites) return null;
  const owner = companionSprites.setContext({ journeyInstanceId: journeyIO.namespace,
    epoch: session.snapshot().epoch, navigation, physicalSceneId: physicalWorld.view().physicalSceneId,
    cat: state.activeCat, lessonId: lessons[state.mission].id, editorRevision });
  companionSprites.setSurfaceVisible('scene', !document.hidden && !modalPanel());
  companionSprites.setSurfaceVisible('portraits', !document.hidden && panel.kind === 'journal' && $('journalPanel').dataset.journalPage === 'companions');
  companionSprites.setSurfaceVisible('workbench', !document.hidden && panel.kind === 'workshop');
  companionSprites.setReview(!document.hidden && panel.kind === 'workshop' &&
    ($('conceptDetails').open || $('hintDetails').open || !$('referencePreview').hidden || !$('runChecks').hidden && $('runChecks').open), owner);
  return owner;
}


const lighthousePanel = mountLighthousePanel({ root: $('lighthousePanel'), lessons, session,
  latestResult: () => lastAcceptedResult,
  onVerify: (id, scenario, opener) => chooseLesson(lessonIds.indexOf(id), opener, { mode: 'verify', scenario }) });

const inspectionNotes = Object.freeze({
  'workshop.yard': '钟表工坊与材料棚已经开放。走进室内工作台，继续练习 Python。',
  'beacon.signal': '从岸边观察平台看往来船只。调度塔里可以验证工具调用、异步接力与取消清理。背景中的灯光和船只仅是画面。',
  'protocol.camp': '雪峰下的营地已经备好补给。旁边的协议工坊负责资源、缓存、运单与逐行货流。'
});

function isVerificationSite() { return ['harbor.test-lighthouse.interior', 'harbor.test-lighthouse.observation-room'].includes(physicalWorld?.view().physicalSceneId); }
function islandName(id) { return REGIONS.find(region => region.curriculumIslandId === id)?.name || id; }
function renderWorkbenchChoice() {
  const scene = physicalWorld?.view().scene;
  const offering = buildingOffering(scene?.id);
  const local = new Set(offering?.lessonIds || []);
  const offered = new Set(buildingLessonIds(scene?.id, lessons[state.mission].id));
  const localGroup = document.createElement('optgroup'), currentGroup = document.createElement('optgroup');
  localGroup.label = offering?.label || '这里的委托';
  currentGroup.label = '随身草稿';
  orderedLearningLessons(lessons).forEach((lesson, ordinal) => {
    if (!offered.has(lesson.id)) return;
    const index = lessonIds.indexOf(lesson.id);
    const option = document.createElement('option'), card = courseCardView(session, lesson.id);
    option.value = String(index); option.textContent = `${String(ordinal + 1).padStart(2, '0')} · ${lesson.title} · ${card.access.canRun ? card.status.label : card.accessLabel}`;
    option.disabled = index !== state.mission && (!card.access.canSelect || !lessonIslandAccess({lessonId:lesson.id,envelope:session.snapshot().envelope,physical:physicalWorld?.view()}).available);
    (local.has(lesson.id) ? localGroup : currentGroup).append(option);
  });
  $('workshopCourse').replaceChildren(...[currentGroup, localGroup].filter(group => group.children.length));
  $('workshopCourse').value = String(state.mission);
  $('workshopCourse').title = offering?.purpose || '在手账查看完整课程。';
  let purpose = $('buildingPurpose');
  if (!purpose) { purpose = document.createElement('p'); purpose.id = 'buildingPurpose'; purpose.className = 'building-purpose'; $('workshopCourse').closest('.workbench-wayfinding').after(purpose); }
  purpose.textContent = offering?.purpose || '';
  purpose.hidden = !purpose.textContent;
  $('workshopPanel').dataset.mode = workbenchMode;
  $('returnReview').hidden = workbenchMode !== 'verify';
  $('runCode').querySelector('span').textContent = workbenchMode === 'verify' ? '运行验证' : '运行代码';
  if (panel.kind === 'workshop') $('panelEyebrow').textContent = `${scene.title.replace(/ · .*$/, '')} · ${workbenchMode === 'verify' ? '验证台' : '学习工作台'}`;
}

function renderWorldDiscoveries() {
  const target = $('worldDiscoveries');
  if (!target || !physicalWorld) return;
  const visited = new Set(physicalWorld.view().discovered || []);
  const currentScene = physicalWorld.view().scene;
  $('journalJourneyPostcard').hidden = false;
  $('journalJourneyPhoto').src = new URL(currentScene.background, import.meta.url).href;
  $('journalJourneyPhoto').alt = `此刻停留的地方：${currentScene.title.replace(/ · .*$/, '')}`;
  $('journalJourneyCaption').textContent = currentScene.title.replace(/ · .*$/, '');
  $('discoveryPhoto').hidden = !visited.has(currentScene.id);
  if (visited.has(currentScene.id)) {
    $('discoveryPhotoArt').src = new URL(currentScene.background, import.meta.url).href;
    $('discoveryPhotoArt').alt = `旅程已到访：${currentScene.title.replace(/ · .*$/, '')}`;
    $('discoveryPhotoCaption').textContent = currentScene.title.replace(/ · .*$/, '');
  }
  target.replaceChildren();
  for (const region of REGIONS) {
    const scenes = Object.values(PHYSICAL_SCENES).filter(scene => scene.islandId === region.curriculumIslandId && !scene.legacyPreview);
    const details = document.createElement('details'), title = document.createElement('summary'), list = document.createElement('ul');
    title.textContent = `${region.name} · ${scenes.filter(scene => visited.has(scene.id)).length} / ${scenes.length}`;
    for (const scene of scenes) { const li = document.createElement('li'); li.dataset.visited = String(visited.has(scene.id)); li.textContent = `${visited.has(scene.id) ? '✓' : '○'} ${scene.title.replace(/ · .*$/, '')}`; list.append(li); }
    details.append(title, list); target.append(details);
  }
}

function renderTravel() {
  const view = physicalWorld.view(), port = Object.values(PHYSICAL_PORTS).find(item => item.sceneId === view.physicalSceneId);
  $('travelRoutes').replaceChildren();
  $('travelCurrent').textContent = `从${islandName(port?.islandId)}出发`;
  const route = port && plannedIsland ? planVoyage(PHYSICAL_PORTS, PHYSICAL_ROUTES, port.id, `${plannedIsland}.port`) : null;
  $('travelPlan').hidden = !route?.length;
  $('travelPlan').textContent = route?.length ? `前往${islandName(plannedIsland)}：${route.map(step => islandName(step.destination.islandId)).join(' → ')}` : '';
  if (!port) return;
  for (const step of routesFromPort(PHYSICAL_PORTS, PHYSICAL_ROUTES, port.id)) {
    const access = voyageAccess({destination:step.destination,envelope:session.snapshot().envelope,physical:view});
    const button = document.createElement('button'), name = document.createElement('strong'), action = document.createElement('span');
    button.type = 'button'; button.dataset.travelRoute = step.routeId; button.dataset.recommended = String(route?.[0]?.routeId === step.routeId);
    button.dataset.locked = String(!access.available);
    button.setAttribute('aria-disabled', String(!access.available));
    name.textContent = islandName(step.destination.islandId); action.textContent = access.available ? '乘船前往 →' : access.reason; button.append(name, action);
    button.addEventListener('click', async () => {
      const current = voyageAccess({destination:step.destination,envelope:session.snapshot().envelope,physical:physicalWorld.view()});
      if (!current.available) {
        const next = current.nextSteps[0];
        if (next) {
          if (await openPanel('journal', button)) { journalPages.show('courses'); $('journalSearch').value = next.title; journalExplorer.render(); }
        } else toast(current.reason);
        return;
      }
      button.disabled = true;
      if (!await closePanel()) { button.disabled = false; return; }
      const outcome = physicalNotice(await physicalWorld.act({ kind: 'travel', routeId: step.routeId }));
      if (outcome.status === 'done') {
        if (plannedIsland === step.destination.islandId) plannedIsland = null;
        $('viewport').focus({ preventScroll: true });
        toast(`抵达${islandName(step.destination.islandId)}。${plannedIsland ? '在船埠可继续下一段航程。' : ''}`);
      }
    });
    $('travelRoutes').append(button);
  }
}

async function guideToIsland(islandId) {
  if (!PHYSICAL_PORTS[`${islandId}.port`] || journeyBusy || runBusy) return false;
  const access = islandAccess({islandId,envelope:session.snapshot().envelope,physical:physicalWorld.view()});
  if (!access.available) { toast(access.reason); return false; }
  if (!await closePanel()) return false;
  const view = physicalWorld.view();
  if (view.scene.islandId === islandId) { plannedIsland = null; $('viewport').focus({ preventScroll: true }); return true; }
  plannedIsland = islandId;
  const exit = view.hotspots.find(item => item.return);
  if (view.returnAvailable && exit) return activatePhysical(exit.id, { island: islandId });
  const port = Object.values(PHYSICAL_PORTS).find(item => item.sceneId === view.physicalSceneId);
  if (!port) { toast('请先沿入口返回岛上的船埠。'); return false; }
  return activatePhysical(port.hotspotId);
}

const referencePreview = createReferencePreview({
  elements: { root: $('referencePreview'), title: $('referenceTitle'), code: $('referenceText'),
    opener: $('referenceCode'), adopt: $('adoptReference') },
  capture: () => {
    const saved = session.snapshot(), lesson = lessons[state.mission];
    return { lessonId: lesson.id, title: lesson.title, solution: lesson.solution,
      navigation, epoch: saved.epoch, revision: editorRevision, code: $('codeEditor').value,
      allowed: panel.kind === 'workshop' && saved.loadedValid && !saved.selecting && !runBusy };
  },
  flush: () => session.flush(),
  markAssisted: () => { assisted = true; saveDraft(); },
  replaceCode: code => { assisted = true; $('codeEditor').value = code; saveDraft(); $('codeEditor').focus({ preventScroll: true }); },
  restoreFocus: () => { const opener = $('referenceCode'); (!opener.disabled && opener.getClientRects().length ? opener : $('codeEditor')).focus({ preventScroll: true }); },
  notice: toast,
});

$('previewLabel').textContent = `桌面试玩 · ${lessons.length} 课`;
$('journalAll').textContent = `全部 ${lessons.length} 项实践`;
$('worldScope').textContent = '课程记录、先修与版本说明可在手账查看。';

try {
  const saved = JSON.parse(journeyStorage.getItem(CAMERA_KEY) || 'null');
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) && Number.isFinite(saved.zoom)) {
    camera = { x: saved.x, y: saved.y, zoom: Math.max(1, Math.min(2.2, saved.zoom)), follow: saved.follow === true };
  } else if (mobile() || innerHeight <= 540) {
    const point = SCENE.points[state.positions[state.activeCat]];
    camera.x = point[0]; camera.y = point[1] - (mobile() ? 145 : 110);
  }
} catch { /* The optional camera record cannot invalidate a game save. */ }

async function flushForNavigation(token) {
  if (!session.snapshot().loadedValid) return token === navigation;
  if (!await session.flush()) { toast('未保存的代码仍在编辑器。请先导出，再重试保存或明确重载。'); return false; }
  return token === navigation;
}

async function chooseLesson(index, opener = document.activeElement, { mode = isVerificationSite() ? 'verify' : 'learn', scenario = 'normal' } = {}) {
  arrivalIntent.cancel();
  workbenchMode = mode;
  if (journeyBusy) return false;
  const lesson = lessons[index], view = session.snapshot();
  if (!lesson) return false;
  if (view.loadedValid && !view.selecting && index === view.game.mission && !session.accessOf(lesson.id).canSelect) {
    return openPanel('workshop', opener);
  }
  const island = lessonIslandAccess({lessonId:lesson.id,envelope:view.envelope,physical:physicalWorld?.view()});
  if (!island.available) { toast(island.reason); return false; }
  if (!allowLessonIntent(session, lesson.id, toast)) return false;
  const token = ++navigation;
  cancelRun('切换委托，前一次运行已停止。');
  if (!await session.select({ lessonId: lessons[index].id }, { isCurrent: () => token === navigation })) return false;
  if (token !== navigation) return false;
  state = session.snapshot().game; renderLesson(); updateProgress();
  if ([...$('protocolScene').options].some(option => option.value === scenario)) $('protocolScene').value = scenario;
  return openPanel('workshop', opener, token);
}

function clearNotices() {
  clearTimeout(toastTimer);
  for (const id of ['toast', 'panelNotice']) { $(id).hidden = true; $(id).textContent = ''; }
}

function toast(message) {
  clearNotices();
  const target = panel.kind ? $('panelNotice') : $('toast');
  target.textContent = message;
  target.hidden = false;
  toastTimer = setTimeout(() => { target.hidden = true; }, 3600);
}

function dimensions() {
  const width = $('viewport').clientWidth;
  const height = $('viewport').clientHeight;
  const scene = physicalWorld?.view().scene || SCENE;
  return { width, height, scale: Math.max(width / scene.width, height / scene.height) * camera.zoom };
}

function clampCamera() {
  const { width, height, scale } = dimensions();
  const halfW = width / (2 * scale);
  const halfH = height / (2 * scale);
  const scene = physicalWorld?.view().scene || SCENE;
  camera.x = Math.min(scene.width - halfW, Math.max(halfW, camera.x));
  camera.y = Math.min(scene.height - halfH, Math.max(halfH, camera.y));
}

function drawCamera(save = true) {
  sceneKeyboardFocus?.clear();
  clampCamera();
  const { width, height, scale } = dimensions();
  const x = width / 2 - camera.x * scale;
  const y = height / 2 - camera.y * scale;
  $('world').style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  $('world').style.setProperty('--world-min-target', `${45 / scale}px`);
  $('world').style.setProperty('--world-label-font', `${12 / scale}px`);
  $('zoomValue').textContent = `${Math.round(camera.zoom * 100)}%`;
  $('zoomOut').disabled = camera.zoom <= 1.001;
  $('zoomIn').disabled = camera.zoom >= 2.199;
  $('followCats').setAttribute('aria-pressed', String(camera.follow));
  if (save) {
    clearTimeout(cameraTimer);
    cameraTimer = setTimeout(() => { try { journeyStorage.setItem(CAMERA_KEY, JSON.stringify(camera)); } catch { /* Camera persistence is optional. */ } }, 120);
  }
}

function focusCats(announce = false, save = true) {
  camera.follow = true;
  if (cameraHolds) return;
  const point = roaming ? drawnActorPositions.get(state.activeCat) : null;
  camera.x = point?.x ?? SCENE.points[state.positions[state.activeCat]][0];
  camera.y = (point?.y ?? SCENE.points[state.positions[state.activeCat]][1]) - (mobile() ? 145 : 110);
  drawCamera(save);
  if (announce) toast(`跟上${CAT_NAMES[state.activeCat]}。`);
}

function zoomAt(next, x = innerWidth / 2, y = innerHeight / 2) {
  hotspotClickIntent.cancel();
  const before = dimensions();
  const worldX = camera.x + (x - before.width / 2) / before.scale;
  const worldY = camera.y + (y - before.height / 2) / before.scale;
  camera.zoom = Math.max(1, Math.min(2.2, next));
  const after = dimensions();
  camera.x = worldX - (x - after.width / 2) / after.scale;
  camera.y = worldY - (y - after.height / 2) / after.scale;
  camera.follow = false;
  drawCamera();
}

function buildScene() {
  for (const cat of ['pipi', 'tangyuan']) {
    $(`${cat}Actor`).querySelector('.cat-art img').src = SCENE.cats[cat];
    $(`${cat}Portrait`).src = SCENE.cats[cat];
    $(cat === 'pipi' ? 'workbenchPipiSlot' : 'workbenchTangyuanSlot').querySelector('img').src = SCENE.cats[cat];
  }
  companionSprites = createCompanionSprites({
    actors: Object.fromEntries(['pipi', 'tangyuan'].map(cat => [cat, $(`${cat}Actor`).querySelector('.cat-art')])),
    portraits: Object.fromEntries(['pipi', 'tangyuan'].map(cat => [cat, $(`${cat}Portrait`).parentElement])),
    surfaces: { workbench: { pipi: $('workbenchPipiSlot'), tangyuan: $('workbenchTangyuanSlot') } },
    mediaQuery: reducedMotion, sceneVisible: true,
  });
  companionInput = mountCompanionInput({ root: $('panel'), sprites: companionSprites,
    visibleSlots: companionSlots, context: () => companionSprites.contextToken(), canGreet: () => !runBusy && !journeyBusy });
  $('placeHotspots').replaceChildren();
  for (const place of SCENE.places) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'place-hotspot'; button.dataset.place = place.id;
    mountLandmarkSign(button, place);
    hotspotClickIntent.bind(button, { approach: intent => walkToPlace(place.id, intent), activate: intent => {
      const ids = { workshop:'harbor.code-workshop.front-door', lighthouse:'harbor.test-lighthouse.front-door', harbor:'harbor.pier', camp:'harbor.camp' };
      return activatePhysical(ids[place.id], null, intent);
    } });
    $('placeHotspots').append(button);
  }
  physicalPresentation = mountPhysicalPresentation({ sprites: companionSprites, sceneSpec: physicalScene,
    clickIntent: hotspotClickIntent,
    onApproach: approachPhysical, onInteract: interactPhysical,
    onActivate: (id, intent) => activatePhysical(id, null, intent), onReturn: returnPhysical,
    onSceneChange: view => {
      mailboxNote?.reset(); paperControls?.close(); approachRequest = null;
      camera = { x: view.scene.width / 2, y: view.scene.height / 2, zoom: 1, follow: true };
      const sceneTitle = view.scene.title.replace(/ · .*$/, '');
      $('game').setAttribute('aria-label', `皮皮与汤圆 · ${sceneTitle}`);
      updateMovementHint(sceneTitle);
    }
  });
  renderPhysical(physicalWorld.view());
  canopyWind = mountHarborCanopyWind({ motionPreference: reducedMotion });
  syncCompanionPresentation();
}

function updateMovementHint(sceneTitle = physicalWorld?.view().scene.title.replace(/ · .*$/, '') || '启航岛') {
  const arrows = preferences.value.keyboard === 'arrows';
  $('viewport').setAttribute('aria-label', `${sceneTitle}。点击地面或${arrows ? '方向键' : ' WASD '}行走，双击建筑或物件自动走近并使用，也可按 E 互动。${arrows ? '拖动移动视角' : '方向键移动视角'}，Shift 加方向键选点，Enter 行走，Esc 停下。`);
  $('sceneHint').textContent = `点击地面走路 · 双击建筑进入 · ${arrows ? '方向键' : 'WASD'} / E`;
}

function renderPhysical(view) {
  if (!view?.poses) return;
  for (const [cat, point] of Object.entries(view.poses)) drawnActorPositions.set(cat, { x: point.x, y: point.y });
  physicalPresentation?.render(view);
  if (!physicalPresentation) return;
  if (renderedPhysicalScene !== view.physicalSceneId) {
    const wasVisible = renderedPhysicalScene !== null;
    renderedPhysicalScene = view.physicalSceneId;
    updateQuest();
    syncCompanionPresentation();
    if (wasVisible && !panel.kind) presentationTransitions.enter('scene', [$('world')]);
  }
  if (camera.follow) focusCats(false, false); else drawCamera(false);
  $('groundTarget').hidden = true;
  const intent = arrivalIntent.take(view);
  if (intent) queueMicrotask(async () => {
    if (!arrivalIntent.current(intent.token) || panel.kind || journeyBusy || runBusy) return;
    const done = await interactPhysical(intent.hotspotId);
    if (done && intent.continuation === 'learn') void enterWorkshop();
    else if (done && intent.continuation?.island) void guideToIsland(intent.continuation.island);
  });
}

function drawActors() {
  if (physicalWorld) renderPhysical(physicalWorld.view());
  updateQuest();
}

async function stopWalking(announce = false) {
  hotspotClickIntent.cancel();
  arrivalIntent.cancel();
  const moving = physicalWorld?.view().phase === 'walking';
  if (physicalWorld) await physicalWorld.act({ kind: 'stop' });
  $('groundTarget').hidden = true;
  if (moving && announce) toast('伙伴停下了。');
  return moving;
}

function physicalNotice(outcome) {
  if (outcome?.status === 'blocked') {
    const copy = { 'not-near':'先走近，再按 E 互动。', 'unreachable':'这里还没有安全的路。', 'invalid-target':'请在地板或小径上选择落脚点。',
      'busy':'正在处理当前动作，请稍候。', 'suspended':'先关闭当前面板。', 'unsaved':'当前内容尚未保存，请先到手账导出备份。', 'asset-failed':'房间图片未能载入，仍留在原处。' };
    toast(copy[outcome.reason] || physicalWorld.view().notice || '这次动作没有完成，伙伴仍在原处。');
  } else if (outcome?.status === 'recovery-required') toast('位置尚未确认保存，请先到手账导出恢复备份。');
  return outcome;
}

async function approachPhysical(hotspotId, intent = null) {
  arrivalIntent.cancel();
  clearMovement({ cancelIntent: false });
  if (journeyBusy || runBusy || panel.kind || intent && !intent.isCurrent()) return false;
  const request = { sceneId: physicalWorld.view().physicalSceneId, hotspotId, intentId: intent?.intentId,
    promise: physicalWorld.act({ kind: 'approach', hotspotId }) };
  approachRequest = request;
  const outcome = await request.promise;
  if (intent && !intent.isCurrent()) return false;
  physicalNotice(outcome);
  if (outcome.status === 'started' || outcome.status === 'done') {
    camera.follow = true; $('viewport').focus({ preventScroll: true });
    return true;
  }
  return false;
}

async function browseCourse(lessonId, opener) {
  const lesson = lessons.find(item => item.id === lessonId);
  if (!lesson || !await openPanel('journal', opener)) return false;
  journalFilter = 'all'; $('journalFilter').value = 'all';
  journalPages.show('courses'); journalExplorer.resetFilters();
  $('journalSearch').value = lesson.title; journalExplorer.render();
  journalPages.show('courses');
  const previewButton = $('journalEntries').querySelector(`[data-preview-lesson="${lessonId}"]`);
  previewButton?.click();
  (previewButton || $('journalSearch')).focus({ preventScroll: true });
  return true;
}

function renderAgentObject(item) {
  mailboxNote?.reset();
  if (item.ae26Purpose === 'messages') {
    $('panelTitle').textContent = '消息信箱';
    mailboxNote.render({
      message: '',
      courses: (item.lessonIds || []).map(id => {
        const lesson = lessons.find(value => value.id === id), access = session.accessOf(id);
        return lesson ? { id, title: lesson.title, available: access.canSelect, reason: access.reason } : null;
      }).filter(Boolean),
      projects: ['durable-dispatch'].map(id => ({ id, title: externalAssignment(id).title })),
      onCourse: (id, opener) => session.accessOf(id).canSelect
        ? chooseLesson(lessonIds.indexOf(id), opener) : browseCourse(id, opener),
      onProject: async (id, opener) => {
        if (!externalAssignment(id) || !await openPanel('journal', opener)) return false;
        journalPages.show('courses'); $('externalWorkPanel').open = true;
        externalWorkPanel.selectTask(id, { focus: true });
        paperControls.refresh();
        return true;
      }
    });
    return;
  }
  const explanations = {
    messages: '在这里整理消息与提案：分清用户目标、已知上下文和工具回执，再判断下一步是否有足够依据。',
    tools: '',
    records: '这卷记录只展示当前旅程实际产生的提交。运行通过、保存成功和独立交付分别记录。',
  };
  $('inspectionText').textContent = explanations[item.ae26Purpose] || '';
  const root = $('inspectionCourses'); root.replaceChildren();
  for (const id of item.lessonIds || []) {
    const lesson = lessons.find(value => value.id === id);
    if (!lesson) continue;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary-button';
    const canStart = session.accessOf(id).canSelect;
    button.textContent = lesson.title;
    button.setAttribute('aria-label', `${lesson.title} · ${canStart ? '开始实践' : '查看课程'}`);
    button.addEventListener('click', () => session.accessOf(id).canSelect ? chooseLesson(lessonIds.indexOf(id), button) : browseCourse(id, button));
    root.append(button);
  }
  const projects = {
    messages: ['durable-dispatch'],
    tools: ['repo-repair', 'tool-bridge'],
    records: ['evidence-research'],
  };
  for (const taskId of projects[item.ae26Purpose] || []) {
    const assignment = externalAssignment(taskId);
    if (!assignment) continue;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'text-button';
    button.textContent = `打开工程 · ${assignment.title}`;
    button.addEventListener('click', async () => {
      if (await openPanel('journal', button)) {
        journalPages.show('courses'); $('externalWorkPanel').open = true;
        externalWorkPanel.selectTask(taskId, { focus: true });
      }
    });
    root.append(button);
  }
  if (item.ae26Purpose !== 'records') return;
  const attempts = Object.entries(session.snapshot().envelope?.records || {}).flatMap(([id, record]) =>
    (record.attempts || []).map(attempt => ({ ...attempt, id }))
  ).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 6);
  const list = document.createElement('ul'); list.className = 'agent-recent-records';
  if (!attempts.length) { const row = document.createElement('li'); row.textContent = '还没有提交。完成一次真实运行后，再来查看记录。'; list.append(row); }
  for (const attempt of attempts) {
    const row = document.createElement('li');
    row.textContent = `${lessons.find(lesson => lesson.id === attempt.id)?.title || attempt.id}：${attempt.passed ? attempt.assisted ? '辅助通过' : '无辅助标记通过' : '未通过'} · ${attempt.at}`;
    list.append(row);
  }
  root.append(list);
  const submissions = document.createElement('button'); submissions.type = 'button'; submissions.className = 'text-button'; submissions.textContent = '查看独立工程与作品记录';
  submissions.addEventListener('click', async () => {
    if (await openPanel('journal', submissions)) {
      journalPages.show('courses'); $('externalWorkPanel').open = true;
      externalWorkPanel.selectTask(externalWorkPanel.selectedTaskId, { focus: true });
    }
  });
  root.append(submissions);
}

async function interactPhysical(hotspotId = physicalWorld.view().nearby[0]?.id, opener) {
  arrivalIntent.cancel();
  if (!hotspotId || journeyBusy || runBusy || panel.kind) return false;
  const outcome = await physicalWorld.act({ kind: 'interact', hotspotId });
  physicalNotice(outcome);
  if (outcome.status === 'done') {
    if (hotspotId === 'harbor.code-workshop.front-door') rememberPlace('workshop');
    if (hotspotId === 'harbor.test-lighthouse.front-door') rememberPlace('lighthouse');
  }
  if (outcome.status === 'workbench') {
    workbenchMode = isVerificationSite() ? 'verify' : 'learn';
    return openPanel(workbenchMode === 'verify' ? 'lighthouse' : 'workshop', opener);
  }
  if (outcome.status === 'port') {
    if (hotspotId === 'harbor.pier') rememberPlace('harbor');
    return openPanel('travel');
  }
  if (outcome.status === 'inspect') {
    if (hotspotId === 'harbor.pier') return showPlace('harbor');
    if (hotspotId === 'harbor.camp') return showPlace('camp');
    const item = physicalWorld.view().hotspots.find(h => h.id === hotspotId);
    if (item?.uiAction === 'external-task' && externalAssignment(item.externalTaskId)) {
      const opened = await openPanel('journal', opener);
      if (opened) {
        journalPages.show('courses'); $('externalWorkPanel').open = true;
        externalWorkPanel.selectTask(item.externalTaskId, { focus: true });
      }
      return opened;
    }
    const servicePage = item?.uiAction === 'journal' ? serviceJournalPage(item) : null;
    if (servicePage) {
      const opened = await openPanel('journal');
      if (opened) { journalPages.show(servicePage); renderWorldDiscoveries(); renderJourneys(); }
      return opened;
    }
    if (item?.uiAction === 'map') {
      const opened = await openPanel('map');
      if (opened) {
        selectRegion(REGIONS.find(region => region.curriculumIslandId === physicalWorld.view().scene.islandId)?.id);
        $('regionDetail').hidden = false;
        $('regionDetail').focus({ preventScroll: true });
      }
      return opened;
    }
    if (item && await openPanel('inspection')) {
      $('panelTitle').textContent = item.label;
      if (item.uiAction === 'ae26') { renderAgentObject(item); return true; }
      $('inspectionText').textContent = inspectionNotes[hotspotId] || '两位伙伴在这里停下，观察周围的装置。';
      $('inspectionCourses').textContent = `本地课程：${coursesForScene(physicalWorld.view().physicalSceneId).map(course => course.title).join(' · ')}`;
    }
  }
  if (outcome.status === 'done') $('viewport').focus({ preventScroll: true });
  return outcome.status === 'done';
}

async function activatePhysical(hotspotId, continuation = null, intent = null) {
  const token = arrivalIntent.cancel();
  clearMovement({ cancelIntent: false });
  if (!hotspotId || journeyBusy || runBusy || panel.kind || intent && !intent.isCurrent()) return false;
  const view = physicalWorld.view();
  const shared = intent && approachRequest?.intentId === intent.intentId && approachRequest.hotspotId === hotspotId
    && approachRequest.sceneId === view.physicalSceneId ? approachRequest.promise : null;
  if (shared) {
    const outcome = await shared;
    if (!arrivalIntent.current(token) || !intent.isCurrent() || physicalWorld.view().physicalSceneId !== view.physicalSceneId) return false;
    if (outcome.status === 'started') {
      arrivalIntent.arm({ token, sceneId: view.physicalSceneId, hotspotId, movementId: outcome.movementId, continuation });
      renderPhysical(physicalWorld.view());
      camera.follow = true; $('viewport').focus({ preventScroll: true });
      return true;
    }
    if (outcome.status !== 'done') { physicalNotice(outcome); return false; }
  }
  if (physicalWorld.view().nearby.some(item => item.id === hotspotId)) {
    const done = await interactPhysical(hotspotId);
    if (done && continuation === 'learn') return enterWorkshop();
    if (done && continuation?.island) return guideToIsland(continuation.island);
    return done;
  }
  const outcome = physicalNotice(await physicalWorld.act({ kind: 'approach', hotspotId }));
  if (!arrivalIntent.current(token) || intent && !intent.isCurrent() || outcome.status !== 'started') return false;
  arrivalIntent.arm({ token, sceneId: view.physicalSceneId, hotspotId, movementId: outcome.movementId, continuation });
  renderPhysical(physicalWorld.view());
  camera.follow = true; $('viewport').focus({ preventScroll: true });
  return true;
}

async function returnPhysical() {
  if (journeyBusy || runBusy || panel.kind) return false;
  const view = physicalWorld.view();
  if (view.returnAvailable) {
    const door = view.hotspots.find(item => item.kind === 'door' && item.return);
    if (door) return activatePhysical(door.id);
    return false;
  }
  return false;
}

async function walkToPlace(id, intent = null) {
  if (journeyBusy || runBusy) return false;
  if (panel.kind && !await closePanel()) return false;
  if (physicalWorld.view().physicalSceneId !== 'harbor.exterior') { toast('先从房间的门口回到启航岛。'); return false; }
  const ids = { workshop:'harbor.code-workshop.front-door', lighthouse:'harbor.test-lighthouse.front-door', harbor:'harbor.pier', camp:'harbor.camp' };
  return approachPhysical(ids[id], intent);
}

async function walkToGround(point) {
  if (panel.kind || journeyBusy || runBusy) return false;
  physicalPresentation?.clearSelection();
  arrivalIntent.cancel(); clearMovement();
  const outcome = await physicalWorld.act({ kind: 'groundWalk', point });
  physicalNotice(outcome);
  if (outcome.status !== 'started' && outcome.status !== 'done') return false;
  if (outcome.snapped) toast('已选附近可到达的落脚点。');
  camera.follow = true; $('viewport').focus({ preventScroll: true }); return true;
}

function worldPoint(client) {
  const bounds = $('world').getBoundingClientRect(), scene = physicalWorld.view().scene;
  return { x: (client.x - bounds.left) / bounds.width * scene.width, y: (client.y - bounds.top) / bounds.height * scene.height };
}

function updateQuest() {
  const lesson = lessons[state.mission];
  const quest = questContext(state, lesson);
  $('hudQuestTitle').textContent = lesson.title;
  $('questSummaryTitle').textContent = lesson.title;
  $('questSmall').textContent = `挑战 ${String(learningOrdinal(lessons, lesson.id)).padStart(2, '0')} / ${lessons.length} · ${lesson.topic}`;
  $('questBrief').textContent = briefCopy[state.mission] || lesson.title;
  $('openWorkshop').querySelector('span').textContent = state.drafts[lesson.id] ? '回工坊继续' : '进入代码工坊';
  $('lessonDescription').textContent = quest.description;
  $('routeOrigin').textContent = quest.originName;
  $('routeTarget').textContent = quest.targetName;
  $('routeSteps').textContent = `前进 ${quest.steps} 格`;
  $('questRoute').hidden = quest.steps === 0;
  $('destinationMarker').hidden = quest.steps === 0 || physicalWorld?.view().physicalSceneId !== 'harbor.exterior';
  $('questReward').textContent = quest.rewardClaimed ? '旧奖励保留 · 复练不重复领奖' : `首次完成 +${lesson.reward} 金币 · ${lesson.xp} XP`;
  const learning = session.learningStatus(lesson.id);
  $('learningSummary').textContent = session.snapshot().loadedValid
    ? `记录 · ${({unobserved:'尚未提交',practice:'已尝试未通过','needs-recheck':'待本版复验','guided-practice':'跟做通过','independent-practice':'独立通过'})[learning]}`
    : '历史：尚未读取，请先恢复存档';
  $('learningStatus').textContent = session.snapshot().loadedValid
    ? `历史提交：${lesson.id === 'harbor-labels' ? learningCopy(learning, lesson.id).replace(/。$/, '') : learningCopy(learning, lesson.id)}。当前稿请以本次运行为准。`
    : '历史提交未读取，请先恢复原存档。';
  const access = session.accessOf(lesson.id);
  $('lessonAccessStatus').hidden = access.canRun;
  $('lessonAccessStatus').textContent = access.canRun ? accessLabel(access) : `${accessLabel(access)}。${access.reason} 当前稿可查看、编辑和导出。`;
  $('unmeasuredKnowledge').textContent = access.additionalKnowledgeUnmeasured.length
    ? `另需先理解：${access.additionalKnowledgeUnmeasured.join('、')}。现有先修记录未单独验证这些知识；解锁不代表已经掌握。` : '';
  $('unmeasuredKnowledge').hidden = !access.additionalKnowledgeUnmeasured.length;
  const point = SCENE.points[quest.target];
  $('destinationMarker').style.left = `${point[0]}px`;
  $('destinationMarker').style.top = `${point[1]}px`;
  $('destinationName').textContent = `下一站 · ${quest.targetName}`;
  $('destinationMarker').setAttribute('aria-label', `本关目的地：${quest.targetName}，${quest.leader}前进${quest.steps}格`);
  if (panel.kind === 'workshop') $('panelTitle').textContent = lesson.title;
}

function renderLesson({ resetResult = true } = {}) {
  referencePreview.close();
  const lesson = lessons[state.mission];
  $('lessonTopic').textContent = lesson.topic;
  $('lessonNumber').textContent = `${String(learningOrdinal(lessons, lesson.id)).padStart(2, '0')} / ${lessons.length}`;
  const presentation = coursePresentation(lesson.id);
  $('lessonContextArt').src = presentation.contextArt.src; $('lessonContextArt').alt = presentation.contextArt.alt;
  $('lessonLocation').textContent = presentation.locationLabel; $('lessonScenario').textContent = presentation.scenario;
  $('lessonArtStatus').textContent = presentation.contextArt.label;
  $('codeEditor').value = state.drafts[lesson.id] ?? lesson.starter;
  $('codeEditor').maxLength = MAX_CODE;
  $('conceptTitle').textContent = lesson.topic;
  renderKnowledgeText($('conceptText'), lesson.concept);
  renderMarketStockContext({ task: $('marketStockTask'), supplement: $('marketStockSupplement'), lessonId: lesson.id });
  $('conceptCode').hidden = true;
  renderCourseLearning({ document, lessonId: lesson.id, onTransfer: (id, opener) => chooseLesson(lessonIds.indexOf(id), opener) });
  const scenes = lessonSceneView(lesson.id);
  $('protocolSceneRow').hidden = scenes.options.length === 0;
  const options = scenes.options.length ? scenes.options : [{ value: 'normal', label: '正常流程' }];
  $('protocolScene').replaceChildren(...options.map(({ value, label }) => {
    const option = document.createElement('option'); option.value = value; option.textContent = label; return option;
  }));
  $('protocolScene').value = 'normal';
  $('sceneNote').textContent = scenes.note; $('sceneNote').hidden = !scenes.note;
  assisted = session.snapshot().envelope?.draftAssistance[lesson.id] === true;
  $('hintText').textContent = lesson.hint;
  updateLineNumbers();
  updateQuest();
  if (resetResult) {
    $('firstFailureFeedback').replaceChildren(); $('firstFailureFeedback').hidden = true;
    $('console').removeAttribute('data-result');
    $('resultTitle').textContent = '运行结果';
    $('runChecks').hidden = true; $('runChecks').open = false; $('failureNext').hidden = true;
    $('output').textContent = '运行后，Python 的输出会出现在这里。';
    $('checks').replaceChildren();
    if ($('resultNotes')) { $('resultNotes').textContent = ''; $('resultNotes').hidden = true; }
    $('runDuration').textContent = '';
    $('successActions').hidden = true;
    $('hintDetails').open = false;
  }
  renderedEditorLessonId = lesson.id;
  lessonContentReady = true;
  renderWorkbenchChoice();
  const learningView = session.snapshot(), record = learningView.envelope?.records[lesson.id];
  learningWorkbench.showLesson({ journeyKey: journeyIO.namespace, lessonId: lesson.id,
    hasHistory: !learningView.loadedValid || state.completed.includes(lesson.id) || Boolean(record?.attempts?.length || record?.milestones?.guided || record?.milestones?.independent),
    canAutoExplain: !(lesson.judgeKind === 'lifecycle' && lesson.concept.includes('## 三级提示')) });
  if (resetResult) learningWorkbench.setRunState('idle');
  paperControls?.refresh();
  syncCompanionPresentation();
}

function updateProgress(animate = false, preserveWalking = false) {
  $('coinCount').textContent = session.snapshot().loadedValid ? state.coins : '—';
  $('completedCount').textContent = session.snapshot().loadedValid ? `${state.completed.length} / ${lessons.length}` : '原件待恢复';
  $('xpCount').textContent = session.snapshot().loadedValid ? `${state.xp} XP` : '未读取';
  document.querySelectorAll('[data-cat]').forEach(button => {
    const active = button.dataset.cat === state.activeCat;
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('b').textContent = active ? '当前领队' : '让它带队';
  });
  drawActors();
  if (panel.kind === 'journal') renderJournal();
  refreshFirstEntryCopy();
  syncCompanionPresentation();
}

function cancelRun(message = '已停止，可以继续修改。') {
  if (!runBusy && runtimePhase !== 'running') return;
  session.cancel();
  companionSprites?.cancelRun(companionRun); companionRun = null;
  $('firstFailureFeedback').replaceChildren(); $('firstFailureFeedback').hidden = true;
  $('console').dataset.result = 'cancelled';
  $('resultTitle').textContent = message;
  $('output').textContent = '本次运行已取消。伙伴位置与金币没有改变，当前代码仍在编辑器。';
  if ($('resultNotes')) { $('resultNotes').textContent = ''; $('resultNotes').hidden = true; }
  $('checks').replaceChildren(); $('successActions').hidden = true;
  learningWorkbench.setRunState('result');
}

async function openPanel(kind, opener = document.activeElement, suppliedToken = null) {
  if (journeyBusy) return false;
  if (kind === 'workshop' && !physicalWorld?.view().nearby.some(item => item.kind === 'workbench')) return enterWorkshop(opener);
  clearMovement();
  const token = suppliedToken ?? ++navigation;
  if (!['workshop', 'map', 'journal', 'place', 'explore', 'lighthouse', 'travel', 'inspection'].includes(kind)) return;
  await stopWalking();
  if (kind !== 'workshop') referencePreview.close();
  clearNotices();
  if (panel.kind === 'workshop' && kind !== 'workshop') cancelRun('已离开工坊，本次运行已取消。');
  const recoveryOnly = kind === 'journal' && panel.kind !== 'workshop' && !session.snapshot().pendingDraft;
  if (recoveryOnly ? token !== navigation : !await flushForNavigation(token)) return false;
  if (physicalWorld && kind !== 'journal') {
    const savedSpace = await physicalWorld.flush();
    if (savedSpace.status !== 'done') { physicalNotice(savedSpace); return false; }
  }
  if (token !== navigation || journeyBusy) return false;
  try {
    if (kind === 'journal') await ensureJournalPanels();
    else await ensurePaperPanels();
  } catch {
    toast('这一页暂时没有打开，请重试。当前旅程仍保留。');
    return false;
  }
  if (token !== navigation || journeyBusy) return false;
  mailboxNote?.reset(); paperControls?.close();
  if (!panelSpaceRelease) panelSpaceRelease = physicalWorld?.suspend('panel');
  if (panel.kind === null && opener instanceof HTMLElement) lastOpener = opener;
  const changed = panel.kind !== kind;
  panel.kind = kind;
  $('panel').hidden = false;
  document.body.classList.add('panel-open');
  document.body.classList.toggle('map-open', kind === 'map');
  for (const name of ['workshop', 'map', 'journal', 'place', 'explore', 'lighthouse', 'travel', 'inspection']) $(`${name}Panel`).hidden = name !== kind;
  const headers = {
    workshop: [`${physicalWorld.view().scene.title.replace(/ · .*$/, '')} · ${workbenchMode === 'verify' ? '验证台' : '学习工作台'}`, lessons[state.mission].title],
    lighthouse: ['测试灯塔 · 真实提交记录', '验证与回顾'],
    travel: ['沿航线继续远行', '船埠'],
    inspection: ['沿途见闻', '地点观察'],
    map: ['七座岛 · 六段往返航线', '群岛航海图'],
    journal: ['两位伙伴 · 一起成长', '冒险手账'],
    place: ['启航岛 · 小岛漫游', '小岛上的一个地方'],
    explore: ['慢慢走 · 发现小岛', '风景也值得收藏']
  };
  $('panelEyebrow').textContent = headers[kind][0];
  $('panelTitle').textContent = headers[kind][1];
  $('closePanel').setAttribute('aria-label', ['island', 'exterior'].includes(physicalWorld.view().scene.kind) ? '关闭面板，回到小岛' : '关闭面板，回到房间');
  if (modalPanel()) $('panel').setAttribute('aria-modal', 'true'); else $('panel').removeAttribute('aria-modal');
  $('panel').setAttribute('role', modalPanel() ? 'dialog' : 'complementary');
  $('viewport').inert = modalPanel();
  document.body.dataset.panel = kind;
  if (kind === 'workshop') {
    if (!lessonContentReady || renderedEditorLessonId !== lessons[state.mission].id) renderLesson();
    else renderWorkbenchChoice();
    void prepareRuntime();
  }
  if (kind === 'lighthouse') lighthousePanel.render({ resetSelection: changed });
  if (kind === 'travel') renderTravel();
  if (kind === 'journal') { renderJournal(); renderJourneys(); }
  if (kind === 'explore') renderExploration();
  if (kind === 'map') {
    renderRegions();
    if (!$('atlasBackground').hasAttribute('src')) loadMapImage();
    selectRegion(panel.regionId);
    if (changed) { $('regionDetail').hidden = true; $('regionMenu').open = false; }
    atlasView.open();
  }
  if (changed) {
    const scroll = $(`${kind}Panel`).querySelector('.panel-scroll');
    if (scroll) scroll.scrollTop = 0;
    $('closePanel').focus({ preventScroll: true });
    presentationTransitions.enter('panel', kind === 'workshop'
      ? [$('workbenchTask'), $('workbenchCode'), $('workbenchResult')] : [$(`${kind}Panel`)]);
  }
  syncCompanionPresentation();
  paperControls?.refresh();
  return true;
}

async function closePanel(options = {}) {
  if (journeyBusy) return false;
  referencePreview.close();
  const token = ++navigation;
  clearNotices();
  if (panel.kind === 'workshop') cancelRun('已回到小岛，本次运行已取消。');
  if (!await flushForNavigation(token)) return false;
  if (typeof options.allowClose === 'function' && !options.allowClose()) return false;
  mailboxNote?.reset(); paperControls?.close();
  presentationTransitions.cancel('panel');
  panel.kind = null;
  $('panel').hidden = true;
  document.body.classList.remove('panel-open', 'map-open');
  $('viewport').inert = false;
  document.body.removeAttribute('data-panel');
  panelSpaceRelease?.(); panelSpaceRelease = null;
  if (physicalWorld.view().physicalSceneId !== 'harbor.exterior') $('viewport').focus({ preventScroll: true });
  else if (lastOpener === $('openWorkshop') && !$('questDetails').open) $('questSummary').focus({ preventScroll: true });
  else if (lastOpener?.isConnected && !lastOpener.closest('#panel')) lastOpener.focus({ preventScroll: true });
  else $('questSummary').focus({ preventScroll: true });
  syncCompanionPresentation();
  return true;
}

async function prepareRuntime(force = false) {
  const waiting = panel.kind === 'workshop' && !runBusy ? companionSprites?.beginWait?.(syncCompanionPresentation()) : null;
  try {
    if (!runtimeImport) runtimeImport = import(`../integration/runtime-controller.mjs${runtimeImportRetry ? `?retry=${runtimeImportRetry}` : ''}`);
    runtimeModule = await runtimeImport;
    if (panel.kind !== 'workshop') return;
    if (force && runtime) { runtime.dispose(); runtime = null; }
    if (!runtime) {
      runtime = runtimeModule.createRuntime({ onStatus: status => {
        runtimePhase = status.phase;
        if (companionRun && runBusy) companionSprites?.setRunPhase(companionRun, status.phase === 'running' ? 'running' : 'waiting');
        const copy = { idle: '准备下一次运行…', preparing: '正在准备 Python…', ready: `Python ${status.version || ''} 已就绪`, running: '正在运行你的代码…', stopped: '已停止 · 可重新准备', failed: status.message || 'Python 准备失败', disposed: '运行环境已关闭' };
        $('runtimeStatus').textContent = copy[status.phase] || '准备中…';
        $('runtimeStatus').dataset.phase = status.phase;
        syncControls();
      } });
    }
    await runtime.prepare();
  } catch {
    runtimeImport = null;
    runtimeImportRetry++;
    runtimePhase = 'failed';
    $('runtimeStatus').textContent = 'Python 未能加载，请重新准备。';
    $('runtimeStatus').dataset.phase = 'failed';
    syncControls();
  } finally { if (waiting) companionSprites?.endWait?.(waiting); }
}

function syncControls() {
  document.querySelectorAll('[data-wave-cat]').forEach(button => { button.disabled = runBusy || journeyBusy; });
  const saved = session.snapshot();
  $('runCode').disabled = journeyBusy || !saved.access.canRun || runtimePhase !== 'ready' || runBusy || saved.selecting || !saved.loadedValid || ['conflict','invalid','invalid-state','stale-state','invalid-legacy','backup-only','pending-local','missing-authority','recovery-invalid','locks-required'].includes(saved.status);
  $('runCode').hidden = runBusy;
  pythonStatus?.render({ phase: runtimePhase, canRun: !$('runCode').disabled, running: runBusy,
    blockedReason: !saved.loadedValid ? '存档尚未核对，暂不能运行'
      : !saved.access.canRun ? saved.access.reason || '这节课暂不能运行 · 先查看课程要求'
      : journeyBusy || saved.selecting ? '正在切换旅程或课程，请稍候' : '当前保存状态需要处理，暂不能运行' });
  $('stopCode').hidden = !runBusy;
  $('retryRuntime').hidden = !['failed', 'stopped'].includes(runtimePhase);
  $('codeEditor').readOnly = journeyBusy || saved.selecting || !saved.loadedValid;
  $('resetDraft').disabled = runBusy || saved.selecting || !saved.loadedValid;
  $('nextLesson').disabled = runBusy;
  referencePreview.sync();
  for (const id of ['reloadSaved', 'reloadEditorSaved']) $(id).disabled = saved.selecting || saved.pendingWrites > 0 || runBusy;
  refreshFirstEntryCopy(saved);
  syncCompanionPresentation();
}

function updateLineNumbers() {
  $('lineNumbers').textContent = $('codeEditor').value.split('\n').map((_, i) => i + 1).join('\n');
  $('lineNumbers').scrollTop = $('codeEditor').scrollTop;
}

function saveDraft() {
  editorRevision++;
  session.edit($('codeEditor').value, { assisted });
  updateLineNumbers();
  syncCompanionPresentation();
  if (!runBusy && $('console').hasAttribute('data-result')) {
    $('console').dataset.result = 'previous';
    $('resultTitle').textContent = '以下是上次提交的结果。请重新运行当前稿。';
    $('successActions').hidden = true;
    learningWorkbench.setRunState('previous');
  }
}

async function runCode() {
  if (runBusy || journeyBusy || runtimePhase !== 'ready' || panel.kind !== 'workshop') return;
  const access = session.accessOf(lessons[state.mission].id);
  if (!access.canRun) { toast(access.reason); return; }
  saveDraft();
  const lesson = lessons[state.mission], origin = questContext(state, lesson);
  const submittedCode = $('codeEditor').value, submittedRevision = editorRevision;
  const submittedEpoch = session.snapshot().epoch, submittedNavigation = navigation;
  const releaseSpace = physicalWorld.suspend('python');
  const visualRun = companionSprites?.beginRun(syncCompanionPresentation());
  companionRun = visualRun;
  let visualCompleted = false;
  runBusy = true; syncControls();
  try {
    const storedSpace = await physicalWorld.flush();
    if (storedSpace.status !== 'done') { physicalNotice(storedSpace); return; }
    if (panel.kind !== 'workshop' || navigation !== submittedNavigation || session.snapshot().epoch !== submittedEpoch ||
        editorRevision !== submittedRevision || $('codeEditor').value !== submittedCode) {
      if (panel.kind === 'workshop' && navigation === submittedNavigation && editorRevision !== submittedRevision) {
        $('console').dataset.result = 'cancelled';
        $('resultTitle').textContent = '当前稿已改变，请重新运行。';
        $('output').textContent = '本次尚未启动 Python，当前草稿已保留。';
        $('successActions').hidden = true;
      }
      return;
    }
    $('firstFailureFeedback').replaceChildren(); $('firstFailureFeedback').hidden = true;
    $('checks').replaceChildren(); $('successActions').hidden = true;
    $('runChecks').hidden = true; $('failureNext').hidden = true;
    if ($('resultNotes')) { $('resultNotes').textContent = ''; $('resultNotes').hidden = true; }
    $('resultTitle').textContent = '正在检验你的想法…'; $('output').textContent = ''; $('runDuration').textContent = ''; $('console').dataset.result = 'running';
    learningWorkbench.setRunState('running');
    const outcome = await session.run();
    state = session.snapshot().game;
    if (!session.isCurrent(outcome)) {
      updateProgress(false, true);
      if (outcome.epoch === session.snapshot().epoch && panel.kind === 'workshop') {
        $('console').dataset.result = 'cancelled';
        $('resultTitle').textContent = '当前稿已改变，请重新运行。';
        $('output').textContent = '手账保留已经验收的历史提交。上一次结果不作为当前编辑稿的通过证明。';
      }
      return;
    }
    visualCompleted = companionSprites?.completeRun(visualRun, { status: outcome.kind, saved: outcome.saved }) === true;
    if (['success','incorrect','python-error'].includes(outcome.kind)) lastAcceptedResult = outcome;
    let output = outcome.stdout || '', resultKind = 'error';
    if (outcome.outputTruncated === true) output += '\n\n输出超过 8000 字符，后续输出已截断。依赖输出的检查可能受影响，请减少调试输出后重新运行。';
    const firstFailure = firstFailureView(lesson.id, outcome);
    if (outcome.kind === 'success') {
      const didMove = outcome.effects?.some(effect => effect.type === 'move');
      updateProgress(didMove);
      output += `${output ? '\n\n' : ''}${(outcome.worldEvents || []).join('\n')}`;
      $('resultTitle').textContent = '本次检查通过。';
      $('successActions').hidden = false;
      const continuation = successContinuation(session, lessons, state.mission);
      $('nextLesson').textContent = continuation.label;
      if (continuation.detail) output += `\n\n${continuation.detail}`;
      resultKind = 'success';
      if (lesson.id === 'harbor-labels') {
        if (outcome.saved === false) output += '\n返回结果时，本次进度尚未确认保存。请查看当前保存状态；如仍未保存，请先导出，再重试保存。';
        else if (outcome.saved !== true) output += '\n这条结果未提供保存确认。请查看当前保存状态。';
        toast(`${outcome.reward ? `本次结算奖励 +${outcome.reward} 金币。` : '复练通过，不重复发奖。'}${outcome.saved === true ? '' : '主进度尚未确认保存，请查看当前保存状态。'}`);
      } else {
        if (!outcome.saved) output += '\n当前进度未确认保存，请导出备份后重试。';
        toast(`${outcome.reward ? `首次奖励 +${outcome.reward} 金币。` : '复练通过，不重复发奖。'}${outcome.saved ? '' : '当前仅留在页面，请先导出。'}`);
      }
    } else if (outcome.kind === 'incorrect') {
      if (firstFailure) $('resultTitle').textContent = firstFailure.title;
      else { $('resultTitle').textContent = '还差一点，看看下面的检查。'; output += '\n本次位置与金币没有改变。'; }
    } else if (outcome.kind === 'python-error') {
      if (firstFailure) $('resultTitle').textContent = firstFailure.title;
      else {
        $('resultTitle').textContent = '这行代码需要再看一眼。'; const error = outcome.error || {};
        output += `\n${error.line ? `第 ${error.line} 行 · ` : ''}${error.name || 'PythonError'}: ${error.message || ''}\n本次位置与金币没有改变。`;
      }
    } else if (outcome.kind === 'discarded') {
      $('resultTitle').textContent = '代码已经修改，旧结果没有结算。'; output = '当前草稿保留。请重新运行这份代码，伙伴位置、奖励与评测记录均未改变。'; resultKind = 'cancelled';
    } else {
      $('resultTitle').textContent = outcome.kind === 'cancelled' ? '已停止，可以继续修改。' : '这次运行没有提交。'; output = outcome.message || '请先检查保存状态，再重新运行。'; resultKind = outcome.kind === 'cancelled' ? 'cancelled' : 'error';
    }
    if (firstFailure) {
      output = outcome.stdout;
      renderFirstFailureFeedback({ document, root: $('firstFailureFeedback'), view: firstFailure, outcome });
    }
    $('console').dataset.result = resultKind;
    $('output').textContent = outcome.stdout || '（本次没有输出）';
    let notes = $('resultNotes');
    if (!notes) { notes = document.createElement('p'); notes.id = 'resultNotes'; notes.className = 'result-notes'; $('output').after(notes); }
    notes.textContent = output.startsWith(outcome.stdout || '') ? output.slice((outcome.stdout || '').length).trim() : output;
    if (outcome.kind === 'python-error' && !firstFailure) notes.textContent = `${outcome.error?.line ? `第 ${outcome.error.line} 行 · ` : ''}${outcome.error?.name || 'PythonError'}: ${outcome.error?.message || ''}`;
    notes.hidden = !notes.textContent;
    $('checks').replaceChildren(...(outcome.checks || []).map((check, index) => {
      const li = document.createElement('li'); li.className = check.passed ? 'passed' : 'failed';
      li.append(icon(check.passed ? 'check' : 'warning-circle'), document.createTextNode(`${check.passed ? '通过' : '未通过'}：${check.label}`));
      const note = firstFailure ? firstFailure.checkNotes[index] : check.detail;
      if (!check.passed && note) { const detail = document.createElement('small'); detail.textContent = note; li.append(detail); }
      return li;
    }));
    if (outcome.kind === 'python-error') {
      const action = createErrorLineAction({ document, editor: $('codeEditor'), code: submittedCode, line: outcome.error?.line,
        isCurrent: () => !runBusy && panel.kind === 'workshop' && editorRevision === submittedRevision && session.isCurrent(outcome), notify: toast });
      if (action) { const row = document.createElement('li'); row.append(action); $('checks').append(row); }
    }
    presentRunChecks({ document, outcome });
    $('runDuration').textContent = Number.isFinite(outcome.elapsedMs) ? `Python · ${(outcome.elapsedMs / 1000).toFixed(2)} 秒` : '';
    $('console').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' }); updateQuest();
  } catch (error) {
    $('resultTitle').textContent = '这次运行没有提交，请检查后重试。'; $('output').textContent = error.message; $('console').dataset.result = 'error';
  } finally {
    if (!visualCompleted) companionSprites?.cancelRun(visualRun);
    if (companionRun === visualRun) companionRun = null;
    releaseSpace(); runBusy = false; syncControls(); renderWorkbenchChoice();
    learningWorkbench.setRunState($('console').dataset.result === 'previous' ? 'previous' : $('console').hasAttribute('data-result') ? 'result' : 'idle');
  }
}

function learningCopy(status, lessonId) {
  if (lessonId === 'first-steps' && status === 'unobserved') return '尚未提交实践';
  const compatibility = evidenceCompatibility(lessonId, evidenceVersionFor(lessonId));
  if (compatibility && ['guided-practice', 'independent-practice'].includes(status)) {
    if (lessonId === 'harbor-labels') return `${status === 'guided-practice' ? '已有跟做通过记录' : '已有无辅助标记通过记录'}（v5）；${compatibility.uncertainty}`;
    return `${status === 'guided-practice' ? '保存有跟做通过记录' : '保存有无辅助标记通过记录'}（v5）；${compatibility.uncertainty}历史记录未自动复验。${compatibility.notice}`;
  }
  const label = ({ unobserved: '尚未提交实践', practice: '已有尝试，继续练习', 'needs-recheck': '历史奖励保留 · 新标准待复验', 'guided-practice': '当前标准跟做通过 · 可重开起始稿练习', 'independent-practice': '当前标准有独立实践证据' })[status] || '实践记录待复核';
  return compatibility ? `${label}；${compatibility.notice}` : label;
}
function lessonGroup(lesson, index) { return index < 18 ? 'legacy' : lesson.judgeKind === 'protocol' ? 'protocol' : lesson.islandId; }


function renderJournal() {
  if (!journalExplorer) return;
  renderExploration();
  classroomGraduation?.render();
  $('courseAccessSummary').textContent = session.snapshot().loadedValid
    ? accessSummaryCopy(session.learningSummary()) : '原存档尚未读取，暂不计算课程开放与学习进度。';
  journalExplorer.render();
  const events = state.history.length ? state.history.slice(-12) : ['在启程码头遇见皮皮与汤圆，今天的冒险从这里开始。'];
  $('historyEntries').replaceChildren(...events.map(event => { const li = document.createElement('li'); li.textContent = event; return li; }));
  paperControls?.refresh();
}

// Visibility gates precede all new entry facts. Existing save controls keep their own reads.
function firstEntryStart(view, pendingSelection) {
  return canDescribeCurrentFirstStepAsStart({ view, hasUnsaved: session.hasUnsaved(), access: view.access,
    lesson: lessons[view.game?.mission], sourceIsCurrentEmpty: readFirstEntrySource(view.loadResult),
    owner: { runBusy, assisted, pendingSelection, editorLessonId: renderedEditorLessonId, liveEditorCode: $('codeEditor').value } });
}
function refreshFirstEntryCopy(view) {
  if (panel.kind === 'journal') journalExplorer.refreshStartCopy(view);
  else if (panel.kind === 'map') refreshRegionEntryCopy(view);
}
function refreshRegionEntryCopy(view) {
  if (panel.kind !== 'map') return;
  const region = REGIONS.find(item => item.id === panel.regionId) || REGIONS[0];
  const showStart = region.id === 'departure' && firstEntryStart(view ?? session.snapshot(), journalExplorer?.navigationPending() || false);
  const access = islandAccess({islandId:region.curriculumIslandId,envelope:(view ?? session.snapshot()).envelope,physical:physicalWorld?.view()});
  const copy = region.description + (access.available ? ' 可以沿航线前往探索。' : ` ${access.reason}`) +
    (showStart ? ' 从代码工坊开始第一课。' : '');
  if ($('regionDescription').textContent !== copy) $('regionDescription').textContent = copy;
}

function loadMapImage() {
  const map = $('atlasBackground');
  $('mapLoadNotice').hidden = false;
  $('mapLoadMessage').textContent = '正在展开航海图，地区列表已可使用。';
  $('retryMapImage').hidden = true;
  map.closest('.atlas-art').setAttribute('aria-busy', 'true');
  map.src = map.dataset.src;
}

$('atlasBackground').addEventListener('load', () => {
  $('mapLoadNotice').hidden = true;
  $('atlasBackground').closest('.atlas-art').setAttribute('aria-busy', 'false');
});
$('atlasBackground').addEventListener('error', () => {
  $('mapLoadNotice').hidden = false;
  $('mapLoadMessage').textContent = '地图图片暂未载入，可展开左上角的地区列表。';
  $('retryMapImage').hidden = false;
  $('atlasBackground').closest('.atlas-art').setAttribute('aria-busy', 'false');
});
$('retryMapImage').addEventListener('click', loadMapImage);

function regionCourseIds(region) {
  return lessons.filter((lesson, index) => lessonGroup(lesson, index) === region.curriculumIslandId).map(lesson => lesson.id);
}

function renderRegions() {
  $('regionList').replaceChildren();
  $('atlasPins').replaceChildren();
  for (const region of REGIONS) {
    const access = islandAccess({islandId:region.curriculumIslandId,envelope:session.snapshot().envelope,physical:physicalWorld?.view()});
    const button = document.createElement('button'); button.type = 'button'; button.className = 'region-button'; button.dataset.region = region.id;
    const copy = document.createElement('span'); const name = document.createElement('strong'); name.textContent = region.name;
    const topic = document.createElement('small'); topic.textContent = region.topic; copy.append(name, topic);
    const courseIds = regionCourseIds(region), runnable = courseIds.filter(id => session.accessOf(id).canRun).length;
    const status = document.createElement('b'); status.textContent = access.available ? `${runnable} / ${courseIds.length} 可练习` : '航线待开放';
    button.dataset.locked = String(!access.available);
    button.append(icon(access.available ? 'map-pin' : 'lock-simple'), copy, status);
    button.addEventListener('click', () => revealRegionDetails(region.id));
    $('regionList').append(button);
    const pin = document.createElement('button'); pin.type = 'button'; pin.className = 'atlas-pin'; pin.dataset.mapRegion = region.id;
    pin.dataset.locked = String(!access.available);
    const current = region.curriculumIslandId === physicalWorld.view().scene.islandId;
    pin.dataset.current = String(current);
    if (current) pin.setAttribute('aria-current', 'location');
    pin.style.left = `${region.x / 1600 * 100}%`; pin.style.top = `${region.y / 1000 * 100}%`;
    const pinName = document.createElement('strong'); pinName.textContent = region.name;
    const pinState = document.createElement('span'); pinState.id = `atlasPinState-${region.id}`; pinState.textContent = current ? '你在这里' : access.available ? '航线已开放' : '完成里程碑后启航';
    pin.append(pinName, pinState); pin.setAttribute('aria-label', `${region.name}，课程可查看，查看地区详情`);
    pin.setAttribute('aria-describedby', pinState.id);
    pin.addEventListener('click', () => revealRegionDetails(region.id));
    $('atlasPins').append(pin);
  }
}

function revealRegionDetails(id) {
  selectRegion(id);
  const detail = $('regionDetail');
  $('regionMenu').open = false;
  detail.hidden = false;
  atlasView.refreshDetails(document.querySelector(`[data-map-region="${panel.regionId}"]`));
  detail.focus({ preventScroll: true });
}

function closeRegionDetails() {
  $('regionDetail').hidden = true;
  const pin = document.querySelector(`[data-map-region="${panel.regionId}"]`);
  atlasView.refreshDetails(pin);
  pin?.focus({ preventScroll: true });
}

function selectRegion(id) {
  const region = REGIONS.find(item => item.id === id) || REGIONS[0];
  panel.regionId = region.id;
  $('regionName').textContent = region.name;
  const courseIds = regionCourseIds(region), runnable = courseIds.filter(id => session.accessOf(id).canRun).length;
  const access = islandAccess({islandId:region.curriculumIslandId,envelope:session.snapshot().envelope,physical:physicalWorld.view()});
  $('regionStatus').textContent = `${courseIds.length} 项课程 · ${access.available ? `${runnable} 项可练习 · 航线已开放` : '航线待开放'}`;
  const currentIsland = physicalWorld.view().scene.islandId;
  $('regionTravel').textContent = currentIsland === region.curriculumIslandId ? '继续探索这座岛' : access.available ? `前往${region.name}` : '查看启航条件';
  refreshRegionEntryCopy();
  $('enterRegion').textContent = '查看这座岛的课程';
  document.querySelectorAll('[data-region],[data-map-region]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.region || button.dataset.mapRegion) === region.id)));
}

function rememberPlace(id) {
  try {
    const stored = loadDiscoveryStorage(journeyStorage, EXPLORATION_KEY, placeIds);
    for (const placeId of stored.record.visited) discoveries = visitPlace(discoveries, placeId, placeIds);
  } catch { /* Local exploration can continue when storage is unavailable. */ }
  discoveries = visitPlace(discoveries, id, placeIds);
  try { discoveriesSaved = saveDiscoveryStorage(journeyStorage, EXPLORATION_KEY, discoveries); }
  catch { discoveriesSaved = false; }
  renderExploration();
}

function renderExploration() {
  renderWorldDiscoveries();
  const count = discoveries.visited.length;
  $('explorationCount').textContent = `${count} / ${SCENE.places.length}`;
  $('explorationProgress').value = count;
  $('explorationStatus').textContent = !discoveriesSaved
    ? `本次已认识 ${count} 处风景。浏览器暂不能保存，请到手账导出见闻。`
    : count === SCENE.places.length
    ? '四处风景已收集。下次回来，还是这座熟悉的小岛。'
    : `已认识 ${count} 处风景。点一处地方，听听它的故事。`;
  $('explorationList').replaceChildren();
  for (const place of SCENE.places) {
    const seen = discoveries.visited.includes(place.id);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'exploration-place'; button.dataset.discover = place.id;
    const copy = document.createElement('span');
    const name = document.createElement('strong'); name.textContent = place.name;
    const note = document.createElement('small'); note.textContent = seen ? '已收进见闻 · 再去看看' : '还没认识 · 翻开故事';
    copy.append(name, note);
    button.append(icon(place.icon), copy, icon(seen ? 'check' : 'caret-right'));
    button.setAttribute('aria-label', `${place.name}，${seen ? '已发现' : '未发现'}，查看故事`);
    button.addEventListener('click', () => showPlace(place.id, button));
    $('explorationList').append(button);
  }
  $('journalDiscoveries').textContent = count
    ? discoveries.visited.map(id => SCENE.places.find(place => place.id === id).name).join(' · ')
    : '海港的故事还在等你，先去散个步吧。';
  $('journalExplorationCount').textContent = `${count} / ${SCENE.places.length} 处风景`;
  $('discoverySaveStatus').textContent = discoveriesSaved ? '见闻已保存，也会包含在完整旅程备份中。' : '见闻尚未确认保存，可单独导出原文。';
  document.querySelectorAll('[data-place]').forEach(button => {
    const seen = discoveries.visited.includes(button.dataset.place);
    button.dataset.discovered = String(seen);
    button.setAttribute('aria-label', `${button.dataset.placeName || button.textContent}，沿小径走过去${seen ? '，已发现' : ''}`);
  });
}

async function focusPlace(place) {
  return walkToPlace(place.id);
}

async function enterWorkshop(opener = document.activeElement) {
  if (journeyBusy || runBusy || !await closePanel()) return false;
  const view = physicalWorld.view();
  const bench = view.hotspots.find(item => item.kind === 'workbench');
  if (bench) {
    if (view.nearby.some(item => item.id === bench.id)) return interactPhysical(bench.id, opener);
    return activatePhysical(bench.id);
  }
  const door = view.hotspots.find(item => item.kind === 'door' && !item.return && physicalScene(item.to)?.hotspots.some(target => target.kind === 'workbench'));
  if (door) return activatePhysical(door.id, 'learn');
  const exit = view.hotspots.find(item => item.return);
  if (exit) return activatePhysical(exit.id, 'learn');
  toast('请从地图前往有工作台的建筑。'); return false;
}

async function showPlace(id, opener = document.activeElement) {
  const place = SCENE.places.find(item => item.id === id);
  if (!place) return;
  panel.placeId = id;
  rememberPlace(id);
  if (!await openPanel('place', opener)) return;
  $('placeDiscovery').hidden = false;
  $('placeDiscovery').textContent = `见闻 ${discoveries.visited.length} / ${SCENE.places.length} · ${discoveriesSaved ? '已保存在此浏览器' : '仅本次保留，请到手账导出'}`;
  $('placeFocus').hidden = false;
  $('placeFocus').onclick = () => focusPlace(place);
  $('backToExplore').hidden = false;
  $('panelTitle').textContent = place.name;
  $('placeIcon').src = `./assets/icons/${place.icon}.svg`;
  $('placeDescription').textContent = place.description;
  $('placeLocation').textContent = `${roaming ? '漫游只改变眼前的位置。' : ''}棋盘进度：皮皮在${TILES[state.positions.pipi][0]}，汤圆在${TILES[state.positions.tangyuan][0]}。`;
  $('placeAction').textContent = place.actionLabel;
  $('placeAction').onclick = async () => {
    if (place.id === 'workshop') {
      await enterWorkshop(opener);
      return;
    }
    if (!await openPanel(place.action === 'concept' ? 'workshop' : place.action)) return;
    if (place.action === 'concept') showConcept();
  };
}

async function showDestination() {
  const quest = questContext(state, lessons[state.mission]);
  if (!await openPanel('place', $('destinationMarker'))) return;
  $('placeDiscovery').hidden = true;
  $('placeFocus').hidden = true;
  $('backToExplore').hidden = true;
  $('panelTitle').textContent = quest.targetName;
  $('placeIcon').src = './assets/icons/flag.svg';
  $('placeDescription').textContent = `${quest.leader}将从${quest.originName}出发，前进 ${quest.steps} 格，到达${quest.targetName}。先在代码工坊完成本关挑战，再让小径见证你的想法。`;
  $('placeLocation').textContent = '换一位领队，或再走一遍小径，下一站也会跟着改变。';
  $('placeAction').textContent = '进入代码工坊';
  $('placeAction').onclick = () => enterWorkshop($('destinationMarker'));
}

async function showConcept() {
  if (!await openPanel('workshop')) return;
  $('conceptDetails').open = true;
  $('hintDetails').open = false;
  requestAnimationFrame(() => $('conceptDetails').scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
}

const pointers = new Map();
let gesture = null;
const clickGuard = new GestureClickGuard();
$('viewport').addEventListener('touchmove', event => {
  if (event.cancelable && (gesture?.kind === 'pinch' || gesture?.moved)) event.preventDefault();
}, { passive: false });
const pointDistance = () => { const points = [...pointers.values()]; return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y); };
$('viewport').addEventListener('pointerdown', event => {
  if (event.button !== 0 || panel.kind && mobile()) return;
  if (!event.target.closest('[data-physical-hotspot],[data-place]')) hotspotClickIntent.cancel();
  if (!pointers.size) clickGuard.begin();
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  gesture = pointers.size >= 2
    ? { kind: 'pinch', distance: pointDistance(), zoom: camera.zoom }
    : { kind: 'pan', pointer: event.pointerId, x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y, moved: false };
});
window.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId) || !gesture) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size >= 2) {
    if (gesture.kind !== 'pinch') gesture = { kind: 'pinch', distance: pointDistance(), zoom: camera.zoom };
    const points = [...pointers.values()];
    zoomAt(gesture.zoom * pointDistance() / Math.max(1, gesture.distance), (points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);
    clickGuard.drag();
  } else if (gesture.kind === 'pan' && event.pointerId === gesture.pointer) {
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
    hotspotClickIntent.cancel();
    gesture.moved = true;
    const { scale } = dimensions();
    camera.x = gesture.cameraX - dx / scale; camera.y = gesture.cameraY - dy / scale; camera.follow = false;
    $('viewport').classList.add('dragging');
    drawCamera();
    clickGuard.drag();
  }
  $('sceneHint').classList.add('dismissed');
});
const endPointer = event => {
  if (!pointers.has(event.pointerId)) return;
  pointers.delete(event.pointerId);
  if (!pointers.size) {
    gesture = null; $('viewport').classList.remove('dragging');
    if (event.type === 'pointercancel') clickGuard.cancel(); else clickGuard.finish();
  }
  else { const [id, point] = pointers.entries().next().value; gesture = { kind: 'pan', pointer: id, x: point.x, y: point.y, cameraX: camera.x, cameraY: camera.y, moved: true }; }
};
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);
$('viewport').addEventListener('click', event => { if (clickGuard.consume(event.detail)) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
$('viewport').addEventListener('click', event => {
  if (!event.detail || event.target.closest('button,a,input,textarea,select,summary') || panel.kind) return;
  const point = worldPoint({ x:event.clientX, y:event.clientY });
  void walkToGround(point);
});
$('viewport').addEventListener('wheel', event => { event.preventDefault(); zoomAt(camera.zoom * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY); $('sceneHint').classList.add('dismissed'); }, { passive: false });
$('viewport').addEventListener('keydown', event => {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.target !== $('viewport')) return;
  const pan = { ArrowLeft: [-60, 0], ArrowRight: [60, 0], ArrowUp: [0, -60], ArrowDown: [0, 60] }[event.key];
  if (pan) {
    if (preferences.value.keyboard === 'arrows' && !event.shiftKey) return;
    hotspotClickIntent.cancel();
    event.preventDefault();
    if (event.shiftKey) {
      groundAim = moveTerrainAim(groundAim, event.key, dimensions()) || groundAim;
      $('groundAim').style.left = `${groundAim.x*100}%`; $('groundAim').style.top = `${groundAim.y*100}%`;
    } else { camera.x += pan[0] / dimensions().scale; camera.y += pan[1] / dimensions().scale; camera.follow = false; drawCamera(); }
  }
  if (event.key === 'Home') { event.preventDefault(); hotspotClickIntent.cancel(); groundAim = {x:.5,y:.5}; $('groundAim').style.left = '50%'; $('groundAim').style.top = '50%'; }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomAt(camera.zoom + .15); }
  if (event.key === '-') { event.preventDefault(); zoomAt(camera.zoom - .15); }
  if (event.key === 'Enter' && !event.repeat) {
    event.preventDefault();
    const rect = $('viewport').getBoundingClientRect();
    void walkToGround(worldPoint({ x:rect.left+rect.width*groundAim.x, y:rect.top+rect.height*groundAim.y }));
  }
});
const heldMovement = new Set();
let steeringFrame = null, steeringTime = null, keyboardInteractionEpoch = 0;
function clearMovement({ cancelIntent = true } = {}) {
  ++keyboardInteractionEpoch;
  if (cancelIntent) { hotspotClickIntent.cancel(); approachRequest = null; }
  heldMovement.clear(); steeringTime = null;
  if (steeringFrame !== null) cancelAnimationFrame(steeringFrame);
  steeringFrame = null;
}
function stopKeyboardMovement() {
  const wasMoving = heldMovement.size > 0;
  clearMovement();
  if (wasMoving && physicalWorld) void physicalWorld.act({ kind: 'stop' });
}
async function interactFromKeyboard() {
  const view = physicalWorld.view(), hotspotId = view.nearby[0]?.id;
  clearMovement();
  const token = keyboardInteractionEpoch;
  await stopWalking();
  const current = physicalWorld.view();
  if (!hotspotId || token !== keyboardInteractionEpoch || heldMovement.size ||
      current.physicalSceneId !== view.physicalSceneId || !current.nearby.some(item => item.id === hotspotId)) return false;
  return interactPhysical(hotspotId);
}
async function steerFrame(time) {
  steeringFrame = null;
  if (!heldMovement.size || panel.kind || journeyBusy || runBusy || document.hidden || document.activeElement !== $('viewport')) { stopKeyboardMovement(); return; }
  const dt = steeringTime === null ? .016 : Math.min(.04, Math.max(.001, (time - steeringTime) / 1000)); steeringTime = time;
  const dx = Number(heldMovement.has('d')) - Number(heldMovement.has('a'));
  const dy = Number(heldMovement.has('s')) - Number(heldMovement.has('w'));
  await physicalWorld.act({ kind: 'steer', dx, dy, dt });
  if (heldMovement.size) steeringFrame = requestAnimationFrame(steerFrame);
}
$('viewport').addEventListener('keydown', event => {
  if (event.target !== $('viewport') || event.isComposing || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey || panel.kind) return;
  const key = mapMovementKey(event.key, preferences.value.keyboard);
  if (key && !(preferences.value.keyboard === 'arrows' && event.shiftKey)) {
    ++keyboardInteractionEpoch;
    event.preventDefault(); hotspotClickIntent.cancel(); arrivalIntent.cancel(); physicalPresentation?.clearSelection(); heldMovement.add(key); camera.follow = true;
    if (steeringFrame === null) steeringFrame = requestAnimationFrame(steerFrame);
  } else if (event.key.toLowerCase() === 'e' && !event.repeat) {
    event.preventDefault(); void interactFromKeyboard();
  }
});
window.addEventListener('keyup', event => {
  if (!heldMovement.delete(mapMovementKey(event.key, preferences.value.keyboard))) return;
  if (!heldMovement.size) { clearMovement(); void stopWalking(); }
});
window.addEventListener('blur', stopKeyboardMovement);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopKeyboardMovement(); });
$('viewport').addEventListener('focusout', event => {
  if (!$('viewport').contains(event.relatedTarget)) stopKeyboardMovement();
});
$('zoomIn').addEventListener('click', () => zoomAt(camera.zoom + .15));
$('zoomOut').addEventListener('click', () => zoomAt(camera.zoom - .15));
$('followCats').addEventListener('click', () => focusCats(true));
$('showTerrain').addEventListener('click', () => {
  const visible = $('terrainOverlay').hasAttribute('hidden');
  $('terrainOverlay').toggleAttribute('hidden', !visible);
  $('showTerrain').setAttribute('aria-pressed', String(visible));
  toast(visible ? '亮点是可选落脚位置。点击地面出发；拖动只移动视角。' : '已收起范围。仍可点击小径出发。');
});
$('stopRoam').addEventListener('click', () => stopWalking(true));
$('openWorkshop').addEventListener('click', event => enterWorkshop(event.currentTarget));
$('questShortcut').addEventListener('click', event => enterWorkshop(event.currentTarget));
$('openMap').addEventListener('click', event => openPanel('map', event.currentTarget));
$('openJournal').addEventListener('click', event => openPanel('journal', event.currentTarget));
$('openKnowledge').addEventListener('click', showConcept);
$('closePanel').addEventListener('click', closePanel);
$('returnReview').addEventListener('click', () => openPanel('lighthouse'));
$('workshopCourse').addEventListener('change', event => { void chooseLesson(Number(event.target.value), event.target, { mode: workbenchMode }); });
$('inspectionJournal').addEventListener('click', () => { void openPanel('journal').then(opened => { if (opened) journalPages.show('courses'); }); });
$('openExplore').addEventListener('click', () => openPanel('explore', $('openExplore')));
$('journalExplore').addEventListener('click', () => openPanel('explore'));
$('backToExplore').addEventListener('click', () => openPanel('explore'));
window.addEventListener('blur', () => { stopWalking(); pointers.clear(); gesture = null; clickGuard.cancel(); $('viewport').classList.remove('dragging'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopWalking(); });
reducedMotion.addEventListener('change', () => stopWalking());
$('regionTravel').addEventListener('click', () => { const region = REGIONS.find(item => item.id === panel.regionId); void guideToIsland(region.curriculumIslandId); });
$('closeRegionDetail').addEventListener('click', closeRegionDetails);
$('atlasPins').addEventListener('focusin', () => { $('regionMenu').open = false; });
$('regionMenu').addEventListener('toggle', () => {
  if ($('regionMenu').open) { $('regionDetail').hidden = true; atlasView.resize(); }
});
$('enterRegion').addEventListener('click', async () => {
  const region = REGIONS.find(item => item.id === panel.regionId);
  journalFilter = region.curriculumIslandId || 'protocol';
  $('journalFilter').value = journalFilter;
  journalExplorer?.resetFilters();
  if (await openPanel('journal')) {
    journalPages.show('courses');
    $('journalCourses').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    $('journalCourses').focus({ preventScroll: true });
  }
});
$('destinationMarker').addEventListener('click', showDestination);
document.querySelectorAll('[data-actor]').forEach(button => button.addEventListener('click', () => openPanel('journal', button)));
document.querySelectorAll('[data-cat]').forEach(button => button.addEventListener('click', async () => {
  if (journeyBusy || runBusy || button.dataset.cat === state.activeCat) return;
  const token = ++navigation; cancelRun();
  const spaceSaved = await physicalWorld.flush();
  if (spaceSaved.status !== 'done') { physicalNotice(spaceSaved); return; }
  if (token !== navigation) return;
  if (!await session.select({ activeCat: button.dataset.cat }, { isCurrent: () => token === navigation })) return;
  if (token !== navigation) return;
  state = session.snapshot().game;
  const leaderResult = await physicalWorld.act({ kind: 'leader', cat: state.activeCat });
  if (token !== navigation) return;
  if (leaderResult.status !== 'done') {
    updateProgress();
    physicalNotice(leaderResult);
    toast('领队设置尚未完全保存。请先到存档页导出恢复数据，再重新载入。');
    return;
  }
  updateProgress();
  if (camera.follow) focusCats();
  companionSprites?.wave(state.activeCat, syncCompanionPresentation());
  toast(`${CAT_NAMES[state.activeCat]}来带队，另一位伙伴会跟着同行。`);
}));

$('codeEditor').addEventListener('input', saveDraft);
$('conceptDetails').addEventListener('toggle', () => { panel.help.concept = $('conceptDetails').open; if (panel.help.concept && lessons[state.mission].judgeKind === 'lifecycle' && lessons[state.mission].concept.includes('## 三级提示')) { assisted = true; saveDraft(); } syncCompanionPresentation(); });
$('hintDetails').addEventListener('toggle', () => { panel.help.hint = $('hintDetails').open; if (panel.help.hint) { assisted = true; saveDraft(); } syncCompanionPresentation(); });
$('runChecks').addEventListener('toggle', syncCompanionPresentation);
$('codeEditor').addEventListener('scroll', () => { $('lineNumbers').scrollTop = $('codeEditor').scrollTop; });
$('codeEditor').addEventListener('keydown', event => {
  // Candidate-selection keys belong to the input method, never game shortcuts.
  if (event.isComposing || event.keyCode === 229) { editorEscape = false; return; }
  if (event.key === 'Escape') { event.stopPropagation(); editorEscape = true; return; }
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void runCode(); return; }
  if (event.key === 'Enter' && !event.altKey && !event.shiftKey && !event.currentTarget.readOnly) {
    editorEscape = false;
    const editor = event.currentTarget;
    const edit = planContinuedIndentation(editor.value, editor.selectionStart, editor.selectionEnd);
    if (!edit) return;
    event.preventDefault();
    if (edit.limited) { toast('代码已到 20,000 字符上限，先删掉一些再续行。'); return; }
    editor.setRangeText(edit.text, edit.start, edit.end, 'end');
    editor.setSelectionRange(edit.selectionStart, edit.selectionEnd, 'none');
    saveDraft();
    return;
  }
  if (event.key !== 'Tab') { editorEscape = false; return; }
  if (event.currentTarget.readOnly) { editorEscape = false; return; }
  if (editorEscape) { editorEscape = false; return; }
  event.preventDefault();
  const editor = event.currentTarget;
  const edit = planIndentation(editor.value, editor.selectionStart, editor.selectionEnd, { outdent: event.shiftKey });
  if (!edit) { toast('代码已到 20,000 字符上限，先删掉一些再缩进。'); return; }
  // An outdent with no leading whitespace is not a new draft or result.
  if (edit.text === editor.value.slice(edit.start, edit.end)) return;
  const direction = editor.selectionDirection;
  editor.setRangeText(edit.text, edit.start, edit.end, 'preserve');
  editor.setSelectionRange(edit.selectionStart, edit.selectionEnd, direction);
  saveDraft();
});
$('fontSize').addEventListener('click', () => { const large = document.querySelector('.editor-body').classList.toggle('large-text'); $('fontSize').setAttribute('aria-pressed', String(large)); $('fontSize').setAttribute('aria-label', large ? '恢复代码文字大小' : '增大代码文字'); });
$('resetDraft').addEventListener('click', () => referencePreview.restart(() => { $('conceptDetails').open = false; learningWorkbench.resetGuide(); $('hintDetails').open = false; panel.help.concept = false; panel.help.hint = false; assisted = false; $('codeEditor').value = lessons[state.mission].starter; saveDraft(); toast('知识卡与提示已收起，已重开起始稿，可记录新的独立实践。'); }));
$('referenceCode').addEventListener('click', async () => { await referencePreview.open(); syncCompanionPresentation(); });
$('adoptReference').addEventListener('click', () => referencePreview.adopt());
$('closeReference').addEventListener('click', () => { referencePreview.close({ focus: true }); syncCompanionPresentation(); });
$('protocolScene').addEventListener('change', () => cancelRun('场景已改变，前一次运行已取消。'));
$('journalFilter').addEventListener('change', () => { journalFilter = $('journalFilter').value; renderJournal(); });
document.querySelectorAll('[data-journal-jump]:not([role="tab"])').forEach(button => button.addEventListener('click', () => {
  const target = $(button.dataset.journalJump);
  if (!target) return;
  target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}));
$('runCode').addEventListener('click', () => { void runCode(); });
$('stopCode').addEventListener('click', () => cancelRun());
$('retryRuntime').addEventListener('click', () => { void prepareRuntime(true); });
$('viewMovement').textContent = '回到场景';
$('viewMovement').addEventListener('click', async () => { if (await closePanel()) { focusCats(); $('viewport').focus({ preventScroll: true }); } });
$('nextLesson').addEventListener('click', () => {
  if (runBusy) return;
  const continuation = successContinuation(session, lessons, state.mission);
  if (continuation.index === null) { void openPanel('journal').then(opened => { if (opened) journalPages.show('courses'); }); return; }
  void chooseLesson(continuation.index);
});

function downloadText(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: filename.endsWith('.txt') ? 'text/plain;charset=utf-8' : 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
function renderJourneys() {
  const view = journeys.view();
  const selected = document.querySelector('input[name="journeySlot"]:checked')?.value ?? view.current;
  for (const input of document.querySelectorAll('input[name="journeySlot"]')) {
    if (!document.querySelector('input[name="journeySlot"]:checked')) input.checked = input.value === view.current;
    input.disabled = journeyBusy;
  }
  for (const id of ['slot-1','slot-2','slot-3']) {
    const slot = view.slots.find(item => item.id === id), node = document.querySelector(`[data-slot-summary="${id}"]`);
    if (node) node.textContent = slot ? `${slot.active ? '当前旅程' : '已有旅程'}${slot.origin === 'legacy-copy' ? ' · 旧档副本' : slot.origin === 'import' ? ' · 从备份恢复' : ''}` : '空位置';
  }
  const occupied = view.slots.some(slot => slot.id === selected);
  $('journeyCreate').disabled = journeyBusy || occupied;
  $('journeyLoad').disabled = journeyBusy || !occupied || selected === view.current;
  $('journeyImport').disabled = journeyBusy || occupied;
  $('journeyExport').disabled = journeyBusy;
  $('journeySlotStatus').textContent = journeyBusy ? '正在处理旅程…' : view.unpublished.length ? '有未完成写入的副本，原件保留，可一并导出恢复数据。' : view.notice || '选择空位置可新建或恢复旅程。旧档和已有备份保留。';
}

async function journeyOperation(action, { requireSaved = true } = {}) {
  if (journeyBusy || runBusy || session.snapshot().selecting) { toast('正在完成当前操作，请稍候。'); return false; }
  journeyBusy = true;
  const release = physicalWorld.suspend('journey');
  syncControls(); renderJourneys();
  try {
    const courseSaved = await session.flush();
    const spaceSaved = (await physicalWorld.flush()).status === 'done';
    if (requireSaved && (!courseSaved || !spaceSaved)) { toast('当前内容尚未确认保存，请先导出完整备份。'); return false; }
    return await action({ saved: courseSaved && spaceSaved });
  } catch { toast('旅程操作没有完成，当前内容仍保留。'); return false; }
  finally { release(); journeyBusy = false; syncControls(); renderJourneys(); }
}

const optionalPhysical = raw => { if (raw !== null) parsePhysicalState(raw); };
const requiredPhysical = raw => { if (raw === null) throw Error('Missing physical state'); return parsePhysicalState(raw); };
const selectedJourney = () => document.querySelector('input[name="journeySlot"]:checked')?.value;

async function exportProgress() {
  return journeyOperation(async ({ saved }) => {
    const learning = exportWorldProgress(session);
    const file = await journeys.exportCurrent({ saved, validatePhysical: requiredPhysical,
      recovery: saved ? null : { learning: JSON.parse(learning.text), physical: physicalWorld.view(), editor: $('codeEditor').value } });
    if (!file.ok) { toast(file.message); return false; }
    downloadText(file.text, file.filename);
    if (journeys.view().unpublished.length) downloadText(journeys.exportUnpublished(), 'pipi-unpublished-journeys-recovery.json');
    toast(file.recovery ? '已导出恢复证据，包含未保存的代码。请保留此文件。' : '已导出完整旅程：课程、草稿、位置与恢复记录。');
    return true;
  }, { requireSaved: false });
}
$('journeySlots').addEventListener('change', renderJourneys);
$('journeyCreate').addEventListener('click', () => journeyOperation(async () => {
  const result = await journeys.create(selectedJourney());
  if (!result.ok) { toast(result.message); return false; }
  const chosen = journeys.select(result.slot.id, { validatePhysical: optionalPhysical });
  if (!chosen.ok) { toast(chosen.message); return false; }
  location.reload(); return true;
}));
$('journeyLoad').addEventListener('click', () => journeyOperation(async () => {
  const result = journeys.select(selectedJourney(), { validatePhysical: optionalPhysical });
  if (!result.ok) { toast(result.message); return false; }
  location.reload(); return true;
}));
$('journeyExport').addEventListener('click', exportProgress);
const journeyFile = document.createElement('input'); journeyFile.type = 'file'; journeyFile.accept = '.json,application/json'; journeyFile.id = 'journeyImportFile'; journeyFile.hidden = true; document.body.append(journeyFile);
$('journeyImport').addEventListener('click', () => { if (!journeyBusy) journeyFile.click(); });
journeyFile.addEventListener('change', async () => {
  const file = journeyFile.files?.[0]; if (!file) return;
  if (file.size > 32 * 1024 * 1024) { toast('备份超过 32 MiB 上限，未导入。'); journeyFile.value = ''; return; }
  await journeyOperation(async () => {
    const result = await journeys.importToEmpty(await file.text(), { targetId: selectedJourney(), validatePhysical: requiredPhysical });
    if (!result.ok) { toast(result.message); return false; }
    const chosen = journeys.select(result.slot.id, { validatePhysical: optionalPhysical });
    if (!chosen.ok) { toast(chosen.message); return false; }
    location.reload(); return true;
  });
  journeyFile.value = '';
});
$('exportSave').addEventListener('click', exportProgress);
$('exportDiscoveries').addEventListener('click', () => {
  downloadText(JSON.stringify(discoveries, null, 2), 'pipi-island-discoveries.json');
  toast('已导出小岛见闻，不包含课程进度。');
});
$('downloadOriginal').addEventListener('click', () => { const original = session.original(); if (original) downloadText(original, 'pipi-world-original-save.json'); });
$('exportDraft').addEventListener('click', () => downloadText($('codeEditor').value, `pipi-${lessons[state.mission].id}.py`));
$('exportEditorSave').addEventListener('click', exportProgress);
for (const id of ['retrySave','retryEditorSave']) $(id).addEventListener('click', () => { void session.retrySave(); });
for (const id of ['reloadSaved','reloadEditorSaved']) $(id).addEventListener('click', () => {
  if (!confirm('请先导出未保存的代码与进度。现在丢弃本页未提交内容，重载已保存版本吗？')) return;
  ++navigation; cancelRun();
  const loaded = session.reloadSaved({ discardPending: true });
  state = loaded.game;
  if (loaded.reloadStatus === 'saved') renderLesson();
  else toast(loaded.notice || '原记录尚未重新读取，当前代码与恢复分支已保留。');
  updateProgress();
});


document.addEventListener('keydown', event => {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === 'Escape') ++keyboardInteractionEpoch;
  if (event.key === 'Escape' && (physicalWorld?.view().phase === 'walking' || heldMovement.size || hotspotClickIntent.pending())) { event.preventDefault(); clearMovement(); void stopWalking(true); return; }
  if (!panel.kind && event.key === 'Escape' && $('cameraDetails').open) { event.preventDefault(); $('cameraDetails').open = false; $('cameraSummary').focus(); return; }
  if (!panel.kind) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (panel.kind === 'map' && !$('regionDetail').hidden) { closeRegionDetails(); return; }
    if (panel.kind === 'map' && $('regionMenu').open) { $('regionMenu').open = false; $('regionMenuToggle').focus(); return; }
    closePanel(); return;
  }
  if (event.key === 'Tab' && modalPanel()) {
    const focusable = [...$('panel').querySelectorAll('button:not(:disabled),textarea,input:not(:disabled),select,summary,[tabindex="0"]')].filter(item => item.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (!$('panel').contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.addEventListener('resize', () => {
  const wasModal = $('panel').getAttribute('aria-modal') === 'true';
  const current = { width: innerWidth, height: innerHeight };
  if ((previousViewport.width <= 760) !== mobile() && camera.follow) focusCats();
  previousViewport = current;
  drawCamera();
  $('viewport').inert = modalPanel();
  if (panel.kind === 'map') atlasView.resize();
  if (panel.kind) { if (modalPanel()) $('panel').setAttribute('aria-modal', 'true'); else $('panel').removeAttribute('aria-modal'); $('panel').setAttribute('role', modalPanel() ? 'dialog' : 'complementary'); }
  if (modalPanel() && !wasModal && !$('panel').contains(document.activeElement) && !$('recoveryDialog')?.open) {
    $('closePanel').focus({ preventScroll: true });
  }
});
window.addEventListener('storage', event => {
  if (event.key === journeyIO.nativeKey(EXPLORATION_KEY) || placeIds.some(id => event.key === journeyIO.nativeKey(`${EXPLORATION_KEY}:${id}`))) {
    let incoming = readDiscoveries(event.key === journeyIO.nativeKey(EXPLORATION_KEY) ? event.newValue : null, placeIds);
    const individual = placeIds.find(id => event.key === journeyIO.nativeKey(`${EXPLORATION_KEY}:${id}`));
    if (individual && event.newValue === '1') incoming = visitPlace(incoming, individual, placeIds);
    for (const id of incoming.visited) discoveries = visitPlace(discoveries, id, placeIds);
    renderExploration();
    return;
  }
  if (event.key !== journeyIO.nativeKey(SAVE_KEY)) return;
  session.observe(); toast('另一个页面更改了存档，本页不会覆盖它。');
});
window.addEventListener('beforeunload', event => { if (session.hasUnsaved() || physicalWorld?.view().save.dirty) { event.preventDefault(); event.returnValue = ''; } });


// A persisted page may return with this same JavaScript heap. Suspend work,
// but destroy reusable controllers only when the document is leaving for good.
window.addEventListener('pagehide', event => {
  presentationTransitions.cancelAll();
  ++navigation; clearMovement(); void stopWalking();
  if (event.persisted) { cancelRun(); void session.flush(); }
  else { canopyWind?.dispose(); preferences.dispose(); learningWorkbench.dispose(); presentationTransitions.dispose(); companionInput?.dispose(); companionSprites?.dispose(); externalWorkPanel?.dispose(); classroomGraduation?.dispose(); journalPages?.dispose(); mailboxNote?.dispose(); paperControls?.dispose(); recoveryPanel?.dispose(); startupRecovery?.dispose(); hotspotClickIntent.dispose(); physicalWorld?.dispose(); physicalPresentation?.dispose(); session.dispose(); }
  try { journeyStorage.setItem(CAMERA_KEY, JSON.stringify(camera)); } catch { /* Optional camera state. */ }
});
window.addEventListener('pageshow', event => {
  if (event.persisted) { session.observe(); void physicalWorld?.flush(); syncControls(); syncCompanionPresentation(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { companionSprites?.cancelRun(); companionRun = null; }
  syncCompanionPresentation();
});

function exposeStartupRecovery(reason) {
  startupRecovery = mountStartupRecovery({ document, reason,
    onExport: () => {
      const entries = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .filter(key => key === JOURNEY_INDEX_KEY || key?.startsWith(JOURNEY_PREFIX) || key?.startsWith(WORLD_PREFIX))
        .map(key => ({ key, value: localStorage.getItem(key) }));
      downloadText(JSON.stringify({ format: 'pipi-browser-journeys/recovery-v1', entries }, null, 2), 'pipi-original-journeys-recovery.json');
    },
    onManage: () => $('openJournalRecovery').click()
  });
}

async function initializeScene() {
  return coordinateSceneStartup({
    loadSession: async () => {
      await session.load(); state = session.snapshot().game;
      return session.snapshot().loadedValid ? { valid: true } : { valid: false, reason: session.snapshot().status };
    },
    mountRecovery: () => {
      recoveryPanel = mountRecoveryPanel({session, scope: journeyIO.nativeKey(WORLD_SAVE_KEY), anchor: $('journalSaves'), editorAnchor: $('exportEditorSave').parentElement, download: downloadText,
        onReloaded: () => {
          if (!initialized) { location.reload(); return; }
          ++navigation; cancelRun(); state = session.snapshot().game; renderLesson(); updateProgress();
        }});
    },
    preparePhysical: () => {
      physicalWorld = createPhysicalWorld({ storage: journeyIO.storage, locks: journeyIO.locks,
        beforeTransition: async () => !journeyBusy && !runBusy && !session.snapshot().selecting && await session.flush(),
        travelGuard: ({to,physical}) => voyageAccess({destination:to,envelope:session.snapshot().envelope,physical}),
        onChange: renderPhysical });
      return physicalWorld.ready;
    },
    synchronizeLeader: () => physicalWorld.view().leader === state.activeCat
      ? Promise.resolve({ status: 'done' }) : physicalWorld.act({ kind: 'leader', cat: state.activeCat }),
    prepareControls: () => {
      const lesson = lessons[state.mission];
      $('codeEditor').value = state.drafts[lesson.id] ?? lesson.starter;
      $('codeEditor').maxLength = MAX_CODE;
      renderedEditorLessonId = lesson.id;
      assisted = session.snapshot().envelope?.draftAssistance[lesson.id] === true;
      buildScene(); updateProgress();
      if (camera.follow) focusCats(false, false); else drawCamera(false);
      initialized = true; syncControls();
      previousViewport = { width: innerWidth, height: innerHeight };
      sceneKeyboardFocus = mountSceneKeyboardFocus({ world: $('world'), viewport: $('viewport'),
        obstacles: () => [...document.querySelectorAll('#game > .hud, #game > .exploration-tools > .hud, #panel, #toast')] });
      setTimeout(() => $('sceneHint').classList.add('dismissed'), 11000);
    },
    exposeRecovery: ({ scope }) => exposeStartupRecovery({
      session: '学习记录尚未通过安全检查。原件保留，可先导出或打开恢复面板。',
      physical: '保存的位置尚未通过安全检查。原件保留，请先导出旅程数据。',
      leader: '伙伴的领队记录尚未确认保存。原记录保留，请先导出旅程数据。'
    }[scope])
  });
}

export const startupResult = await initializeScene();
