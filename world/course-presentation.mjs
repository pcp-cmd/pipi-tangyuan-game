import { EXTENSION_PRESENTATIONS } from '../integration/extension-data.mjs';
export { courseLearning, COURSE_LEARNING } from '../integration/course-learning.mjs';
import { LESSONS, LESSON_IDS, expectedLabels, evidenceVersionFor } from '../integration/contracts.mjs';
import { PREREQUISITE_RULES, PREREQUISITE_ANCESTORS } from '../integration/lesson-access.mjs';
import { lessonSceneView } from './course-scenes.mjs';
import { courseContextArt } from './course-context-art.mjs';

const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const workshop = 'harbor.code-workshop.interior';
const lighthouse = 'harbor.test-lighthouse.interior';
const observationRoom = 'harbor.test-lighthouse.observation-room';
const islandWorkrooms = Object.freeze({ market: 'market.windmill.interior', workshop: 'workshop.material-shed.interior' });
const aliases = Object.freeze({
  'candidate.workshop.clockworks': 'workshop.clockworks.interior',
  'candidate.observatory.waterworks': 'observatory.waterworks.interior',
  'candidate.beacon.dispatch-tower': 'beacon.dispatch-tower.interior',
  'candidate.protocol.workshop': 'protocol.workshop.interior',
});
const scene = Object.freeze({
  pier: 'harbor.exterior', bench: workshop, test: lighthouse, market: 'market.exterior', warehouse: 'market.warehouse.interior',
  forest: 'market.forest.exterior', clockworks: 'workshop.clockworks.interior', records: 'archive.records.interior',
  garden: 'archive.garden.exterior', greenhouse: 'archive.greenhouse.interior', waterworks: 'observatory.waterworks.interior',
  summit: 'observatory.summit.interior', lookout: 'observatory.summit.exterior', dispatch: 'beacon.dispatch-tower.interior', lantern: 'beacon.dispatch-tower.lantern-room', protocol: 'protocol.workshop.interior',
});
const rows = [
  ['first-steps','pier','码头训练木台','用有名字的步数指令，带皮皮走向路口。',['paw','flags','forward']],
  ['coin-math','pier','鱼饼账板','把鱼饼销量、单价和成本写进同一笔账。',['coins','receipt','collect']],
  ['greeting','pier','码头写字台','给换了名字与岛名的伙伴写明信片。',['postcard','ship','forward']],
  ['safe-buy','test','灯塔验货台','比较钱袋与价格，检查够钱和恰好够钱的边界。',['wallet','tag','compare']],
  ['backpack','pier','营地背包垫','把地图放进背包，并确认第一件物品。',['backpack','map','collect']],
  ['shells','pier','浅滩计数台','逐处收拢贝壳，用循环累计数量。',['shell','coins','loop']],
  ['catalog','market','鱼饼摊价目牌','按物品名称查价格，再给地图写上新价格。',['shop','tag','forward']],
  ['discount','bench','工坊收银样机','把折扣计算装进可以反复使用的函数。',['coins','gear','loop']],
  ['select-items','forest','林径补给筛','按预算挑选物品，留下的东西仍按原顺序排好。',['backpack','sieve','ordered']],
  ['invalid-input','test','坏数据检验盘','把可读的金币文字转成整数，让坏数据有退路。',['tag','warning','protect']],
  ['ledger','records','账本封装桌','将账本装进 JSON 文本，再从收到的文本还原。',['book','bottle','loop']],
  ['stock-class','warehouse','商店模型架','让商店对象管理库存，并拒绝不合理的出售。',['shop','crate','protect']],
  ['generator','garden','按需供给槽','需要下一份补给时，才生成下一项。',['leaf','stream','forward']],
  ['test-case','test','出航断言台','用零除数与小数反例，抓出两种错误实现。',['checklist','warning','compare']],
  ['tool-router','dispatch','航海工具盘','根据意图选查询、购买或询问工具。',['compass','gear','split']],
  ['permission','test','许可闸口','先核对行动和明确许可，再决定能否放行。',['lock','gate','protect']],
  ['dedupe','warehouse','重复订单篮','保留每个订单第一次出现的位置。',['receipt','sieve','ordered']],
  ['retrieval','records','航海笔记柜','在笔记中检索文字，同时保留原文与顺序。',['book','search','forward']],
  ['harbor-rations','pier','补给装箱台','按人数与天数备鱼饼，把余下物资也装进一箱。',['crate','ruler','collect']],
  ['harbor-labels','pier','行李牌晾架','擦去行李牌两端的空白，统一文字大小写。',['tag','lantern','forward']],
  ['harbor-fare','pier','渡船售票口','把不同年龄的旅客送进正确票价档。',['ticket','ship','split']],
  ['harbor-route','pier','海岸灯标图','沿着每次移动记录位置，保留出发点。',['buoy','map','ordered']],
  ['harbor-quantity','pier','订单读数台','读出零到九十九的数量，把非法文字留在闸外。',['receipt','gauge','protect']],
  ['harbor-manifest','pier','启航许可桌','整理物品名称，去掉空项和重复项再签发清单。',['checklist','backpack','ordered']],
  ['market-stock','warehouse','货栈缺货架','对照订单和库存，只列真正缺少的数量。',['crate','notes','compare']],
  ['market-receipts','warehouse','收据合账桌','把售出与退回的收据合为一份完整账本。',['receipt','book','collect']],
  ['market-intersection','market','双船货单栏','找到两艘船都需要的货物，再排序登记。',['ship','crate','compare']],
  ['market-ranking','market','出航排位牌','先比积分，再用名字处理同分。',['flags','chart','ordered']],
  ['market-copy','warehouse','双猫补给桌','为两只猫分别补货，原来的箱单保持不变。',['backpack','crate','split']],
  ['market-checkout','warehouse','整单交付闸','全部货物都够才出库，缺一项就整单保留。',['crate','gate','protect']],
  ['workshop-defaults','clockworks','便签夹具','每次新便签使用自己的容器，不把旧订单带进来。',['notes','gear','split']],
  ['workshop-closure','clockworks','折扣调节器','把折扣比例留在函数里，之后仍能按它报价。',['gear','tag','loop']],
  ['workshop-composition','clockworks','三站加工线','让前一站的结果成为后一站的输入。',['gear','queue','forward']],
  ['workshop-wallet','clockworks','防透支钱包台','让钱包对象保管余额，拒绝超额扣款。',['wallet','shield','protect']],
  ['workshop-iterable','clockworks','单程货流轮','消费只能读一遍的货流，不偷偷回头重读。',['wheel','stream','forward']],
  ['workshop-result','clockworks','故障契约桌','把成功和预期失败交给明确的结果对象。',['shield','warning','split']],
  ['archive-json','records','漂流瓶拆封桌','先打开 JSON 漂流瓶，再检查里面是不是有效订单。',['bottle','checklist','protect']],
  ['archive-regex','records','通行证校验架','检查整张通行证的格式，不能只匹配其中一段。',['ticket','search','compare']],
  ['archive-counter','records','失物清点桌','比较货物数量，找回遗失的每一件。',['crate','search','collect']],
  ['archive-queue','garden','救援等候台','让到达的求助依次入队，按先后次序救援。',['queue','anchor','ordered']],
  ['archive-median','greenhouse','温室传感器台','面对偏离的读数，用中位数寻找中间位置。',['gauge','leaf','ordered']],
  ['archive-distance','garden','花园测距桩','从地图坐标算距离，判断安全半径。',['map','ruler','compare']],
  ['observatory-test-cases','summit','检票反例台','用有区分力的测试找出伪装成正确答案的检票员。',['ticket','checklist','protect']],
  ['observatory-binary','waterworks','同名箱检索轨','缩小查找区间，找到重复货名中的第一箱。',['crate','telescope','ordered']],
  ['observatory-prefix','summit','日账查询仪','先累计每天收入，再回答反复出现的区间查询。',['chart','book','collect']],
  ['observatory-cache','lookout','海况公告钟','辨认缓存键与过期边界，让旧公告及时失效。',['clock','notes','wait']],
  ['observatory-replay','waterworks','水轮航迹盘','按事件重新走过航行记录，核对最终状态。',['wheel','map','loop']],
  ['observatory-diagnose','summit','故障观察镜','把错误归到能采取下一步行动的类别。',['telescope','warning','split']],
  ['beacon-schema','dispatch','工具登记台','在工具入口逐项核对字段、类型与边界。',['checklist','gear','protect']],
  ['beacon-permission','dispatch','限时授权闸','核对使用者、行动、参数和期限，授权只管这一次。',['key','clock','protect']],
  ['beacon-idempotency','dispatch','收货回执柜','辨认新请求、同样的重试和同键冲突。',['receipt','lock','compare']],
  ['beacon-retrieval','dispatch','有权航图柜','先过滤有权读取的资料，再检索证据。',['lock','search','forward']],
  ['beacon-evaluation','dispatch','分组成绩板','每组都保留通过数与总数，失败也留在分母里。',['chart','checklist','collect']],
  ['beacon-budget','dispatch','雾夜预算盘','逐项消耗预算，第一项超支时立即停止。',['gauge','ship','stop']],
  ['protocol-lifecycle','protocol','闸门借用台','按取得、打开、使用和关闭的顺序归还设备。',['key','gate','loop']],
  ['protocol-cache','protocol','报价缓存机','先绑定合法参数，再复用同键的成功报价。',['gear','clock','protect']],
  ['protocol-shipment','protocol','运单封印台','冻结运单自己的重量快照，外部清单变动也不漂移。',['crate','lock','protect']],
  ['protocol-provider','protocol','承运商交换台','更换承运商仍按同一协议逐单取得报价。',['ship','gear','split']],
  ['protocol-stream','protocol','逐行开箱槽','按需读下一行订单，提前离开时也关闭来源。',['stream','receipt','forward']],
  ['protocol-pipeline','protocol','数量限制闸','收够匹配订单就关闭上游，不读取后面的坏行。',['sieve','gate','stop']],
  ['lifecycle-multi-resource','protocol','三钥归还架','部分借用失败时，仍按所有权逆序清理资源。',['key','queue','ordered']],
  ['lifecycle-async-stream','dispatch','异步货流灯','等待下一条货流，取消后等清理结束才离开。',['lantern','stream','wait']],
  ['lifecycle-bounded-map','dispatch','三泊位救援盘','限制同时工作的泊位，按输入顺序交还结果。',['anchor','queue','protect']],
  ['async-await-relay','dispatch','回执接力台','等前一份回执回来，再交给下一步。',['receipt','signal','wait']],
  ['async-event-handshake','dispatch','借用信号灯','信号表示可以继续，货物与结束仍需各自确认。',['signal','crate','compare']],
  ['async-cancel-and-join','dispatch','停船收绳台','发出停船请求后，继续等绳索收好。',['ship','rope','wait']],
  ...EXTENSION_PRESENTATIONS,
];

if (rows.length !== LESSON_IDS.length || rows.some(([id], index) => id !== LESSON_IDS[index])) throw new Error('Course presentation must preserve the complete ordered registry.');
const prerequisites = new Map(PREREQUISITE_RULES.map(row => [row.id, row.requires]));
const records = new Map(rows.map(([id, place, locationLabel, scenario, symbols], index) => {
  const lesson = LESSONS[index], originalRegion = lesson.islandId || 'legacy';
  const physicalRegion = ['async-foundations','lifecycle-depths'].includes(originalRegion) ? 'beacon' : originalRegion === 'legacy' ? 'harbor' : originalRegion;
  const primarySceneId = scene[place];
  const canonicalEntries = [...new Set([primarySceneId, ...(place === 'dispatch' ? [scene.lantern] : []), ...(islandWorkrooms[physicalRegion] ? [islandWorkrooms[physicalRegion]] : []), `${physicalRegion}.exterior`, workshop, lighthouse, observationRoom])];
  const entrySceneIds = [...canonicalEntries, ...Object.entries(aliases).filter(([, canonical]) => canonicalEntries.includes(canonical)).map(([alias]) => alias)];
  return [id, freeze({ id, order: index + 1, title: lesson.title, topic: lesson.topic, objective: lesson.description,
    originalRegion, originalEntry: { kind: 'journal', group: originalRegion, lessonId: id }, primarySceneId, entrySceneIds, locationLabel, scenario,
    learningPrompt: `${scenario} 先阅读任务，再在工作台完成实现。`, verificationPrompt: `在测试灯塔核对「${lesson.title}」的真实检查，失败后可保留草稿继续修正。`,
    prerequisiteIds: [...prerequisites.get(id)], ancestorIds: [...PREREQUISITE_ANCESTORS[id]], evidenceVersion: evidenceVersionFor(id),
    checkLabels: expectedLabels({ kind: 'lesson', lessonId: id }), contextArt: courseContextArt({ id, title: lesson.title, scenario, symbols }) })];
}));

export const COURSE_PRESENTATIONS = Object.freeze([...records.values()]);
export function coursePresentation(id) {
  const course = records.get(id);
  if (!course) throw new Error(`Unknown course presentation ${id}.`);
  return course;
}
export function coursesForScene(sceneId) {
  const canonical = aliases[sceneId] || sceneId;
  return Object.freeze(COURSE_PRESENTATIONS.filter(course => course.entrySceneIds.includes(canonical)));
}

const states = freeze({
  unavailable: { key: 'unavailable', label: '存档待恢复', tone: 'warning' },
  locked: { key: 'locked', label: '先学前面的课程', tone: 'muted' },
  'independent-practice': { key: 'independent-practice', label: '已有独立实践', tone: 'success' },
  'guided-practice': { key: 'guided-practice', label: '跟做通过 · 待独立', tone: 'attention' },
  'needs-recheck': { key: 'needs-recheck', label: '待本版复验', tone: 'attention' },
  practice: { key: 'practice', label: '已尝试 · 待通过', tone: 'attention' },
  draft: { key: 'draft', label: '已有草稿 · 待验证', tone: 'attention' },
  unobserved: { key: 'unobserved', label: '尚未开始', tone: 'neutral' },
});
function draftView(snapshot, id) {
  const pending = snapshot.pendingDraft?.lessonId === id ? snapshot.pendingDraft : null;
  const stored = snapshot.envelope?.game.drafts?.[id];
  const code = pending?.code ?? stored;
  return { exists: typeof code === 'string', length: typeof code === 'string' ? code.length : 0,
    assisted: pending?.assisted ?? snapshot.envelope?.draftAssistance?.[id] === true, pending: !!pending };
}
function attemptView(attempt, id) {
  return attempt ? { id: attempt.id, at: attempt.at, passed: attempt.passed, assisted: attempt.assisted,
    evidenceVersion: attempt.assessmentVersion, currentVersion: attempt.assessmentVersion === evidenceVersionFor(id), codeSha256: attempt.codeSha256 } : null;
}
export function courseCardView(session, id, { mode = 'learn' } = {}) {
  if (!['learn','verify'].includes(mode)) throw new Error('Unknown course presentation mode.');
  const course = coursePresentation(id), access = session.accessOf(id), snapshot = session.snapshot();
  const learningStatus = session.learningStatus(id), draft = draftView(snapshot, id);
  const lastAttempt = attemptView(snapshot.envelope?.records?.[id]?.attempts.at(-1), id);
  const reviewReasons = [];
  if (learningStatus === 'needs-recheck') reviewReasons.push('待本版复验');
  if (learningStatus === 'guided-practice') reviewReasons.push('跟做后待独立实践');
  if (lastAttempt && !lastAttempt.passed) reviewReasons.push('最近一次未通过');
  if (draft.exists && !lastAttempt) reviewReasons.push('草稿尚未验证');
  if (access.state === 'revisit') reviewReasons.push('可以继续本课，再按先学列表补齐基础。');
  const stateKey = access.state === 'unavailable' ? 'unavailable' : learningStatus === 'unobserved' && draft.exists ? 'draft' : learningStatus;
  return freeze({ ...course, mode, status: states[stateKey] || states.unobserved,
    access, accessLabel: access.state === 'locked' ? states.locked.label : access.state === 'revisit' ? '可以继续本课' : access.state === 'unavailable' ? states.unavailable.label : '可进入',
    canStart: access.canSelect, actionLabel: !access.canSelect ? '查看下一步' : mode === 'verify' ? '打开验证台' : draft.exists ? '继续写代码' : '开始学习',
    learningStatus, reviewReasons, draft, lastAttempt });
}

export function courseReviewView(session, id, lastAcceptedResult = null) {
  const card = courseCardView(session, id, { mode: 'verify' }), record = session.snapshot().envelope?.records?.[id];
  const accepted = lastAcceptedResult?.lessonId === id && ['success','incorrect','python-error'].includes(lastAcceptedResult.kind) && session.isCurrent(lastAcceptedResult);
  const currentResult = accepted ? {
    kind: lastAcceptedResult.kind, saved: lastAcceptedResult.saved === true, stdout: lastAcceptedResult.stdout || '',
    checks: structuredClone(lastAcceptedResult.checks || []), worldEvents: [...(lastAcceptedResult.worldEvents || [])],
    error: lastAcceptedResult.error ? structuredClone(lastAcceptedResult.error) : null, outputTruncated: lastAcceptedResult.outputTruncated === true,
  } : null;
  return freeze({ course: coursePresentation(id), status: card.status, access: card.access, checkLabels: card.checkLabels,
    sceneOptions: lessonSceneView(id).options, history: (record?.attempts || []).map(attempt => attemptView(attempt, id)).reverse(),
    milestones: { independent: attemptView(record?.milestones?.independent, id), guided: attemptView(record?.milestones?.guided, id) },
    draft: card.draft, reviewReasons: card.reviewReasons, currentResult,
    historyNotice: '历史只保存提交时间、通过情况、辅助标记、证据版本与代码摘要。历史输出和逐项检查未保存；重新验证可查看本次结果。' });
}

export const COURSE_MIGRATION_ROWS = freeze(COURSE_PRESENTATIONS.map(course => ({
  id: course.id, originalTitle: course.title, originalObjective: course.objective, directPrerequisites: course.prerequisiteIds,
  ancestors: course.ancestorIds, contract: { evidenceVersion: course.evidenceVersion, checkLabels: course.checkLabels },
  primarySceneId: course.primarySceneId, originalEntry: course.originalEntry, additionalEntries: course.entrySceneIds,
  draftMigration: '保留 game.drafts[id] 与 draftAssistance[id]，附加入口读取同一草稿。',
  evidenceMigration: '保留 records[id] 与 game.completed 首奖账本，入口不创建记录或升级历史证据。',
  regression: '由 tools/verify-full-course-presentation.mjs 逐课填入独立输出目录。', artStatus: course.contextArt.status,
})));
