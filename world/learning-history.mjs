// Read-only presentation of submission history. The domain session owns all
// assessment decisions, draft validation, navigation, saving and rewards.
export const LEARNING_LABELS = Object.freeze({
  'unobserved': { label: '暂无提交记录', tone: 'quiet', description: '写下你的想法，运行后这里会留下实践记录。' },
  'practice': { label: '正在练习', tone: 'practice', description: '已经试过，还没有本版通过记录。可以从失败的检查继续。' },
  'needs-recheck': { label: '再运行确认', tone: 'recheck', description: '旧记录和奖励都在。运行当前代码，看看新的检查结果。' },
  'guided-practice': { label: '跟做通过', tone: 'guided', description: '这次用过站内提示。准备好后，从起始稿独立试一遍。' },
  'independent-practice': { label: '独立提交通过', tone: 'independent', description: '这次通过没有使用站内提示。换个任务再试，检验是否会用。' }
});

// Display-only compatibility metadata. A v5 record contains no revision identity.
// Dispatch by lesson ID, never by date, code, latest result or version number alone.
const COMPATIBILITY_COPY = Object.freeze({
  'first-steps': Object.freeze({
    uncertainty: 'v5 未区分输出检查修复前后，不能据此认定已按修复后的检查复验。',
    versionLabel: 'v5 记录 · 修复前后未区分',
    standardNote: '本题记录版本：v5（未区分输出检查修复前后）。历史奖励不重发。',
    latestNote: '最近一次没有通过，已有的 v5 通过记录仍保留；这不表示旧记录已按修复后的检查复验。请根据最新检查继续修改。',
    notice: '本课输出检查已修正。历史提交不会自动重判，原有记录、奖励和课程访问保留。要确认当前代码，请重新运行。存档证据 v5 未区分输出检查修复前后。'
  }),
  'greeting': Object.freeze({
    recordNoun: '这条通过记录',
    uncertainty: 'v5 未区分本次明信片检查修复前后，不能据此认定已按修复后的检查复验。',
    versionLabel: 'v5 记录（未区分本次明信片检查修复）',
    standardNote: '本题记录版本：v5（未区分本次明信片检查修复前后）。历史首奖不重发。',
    latestNote: '最近一次未通过；已有通过记录、奖励和课程访问仍保留，不表示旧记录已通过修复后的明信片检查。请以当前稿本次运行为准。',
    notice: '本课已修复变化输入的明信片检查：文字按最初给定的名字和岛名核对，不随代码重新赋值而改变。v5 未区分修复前后；历史提交不会自动重判，既有记录、奖励和课程访问保留。请在更新后的页面重新运行当前稿。'
  }),
  'coin-math': Object.freeze({
    recordNoun: '这条通过记录',
    uncertainty: 'v5 未区分本次利润检查修复前后，不能据此认定已按修复后的检查复验。',
    versionLabel: 'v5 记录（未区分本次利润检查修复）',
    standardNote: '本题记录版本：v5（未区分本次利润检查修复前后）。历史首奖不重发。',
    latestNote: '最近一次未通过；已有通过记录、奖励和课程访问仍保留，不表示旧记录已通过修复后的利润检查。请以当前稿本次运行为准。',
    notice: '本课已修复变化输入的利润检查：答案按最初给定的销量、单价和成本核对，不随代码重新赋值而改变。v5 未区分修复前后；历史提交不会自动重判，既有记录、奖励和课程访问保留。请在更新后的页面重新运行当前稿。'
  }),
  'shells': Object.freeze({
    recordNoun: '这条通过记录',
    uncertainty: 'v5 未区分本次变化输入检查修复前后，不能据此认定已按修复后的检查复验。',
    versionLabel: 'v5 记录（未区分本次变化输入检查修复）',
    standardNote: '本题记录版本：v5（未区分本次变化输入检查修复前后）。历史首奖不重发。',
    latestNote: '最近一次未通过；已有通过记录、奖励和课程访问仍保留，不表示旧记录已通过修复后的变化输入检查。请以当前稿本次运行为准。',
    notice: '本课已修复变化输入检查：答案按原始输入计算，不随代码改写列表而改变。v5 未区分修复前后；历史提交不会自动重判，既有记录、奖励和课程访问保留。请在更新后的页面重新运行当前稿。'
  }),
  'archive-counter': Object.freeze({
    uncertainty: '存档证据 v5 未区分本次检查补充，不能据此认定已通过补充后的检查。',
    versionLabel: '存档证据 v5（未区分本次检查补充）',
    standardNote: '本题存档证据版本 v5；未记录本次检查补充的修订号。历史奖励不重发。',
    latestNote: '最近一次未通过；此前通过记录、奖励和已有课程访问仍保留，不表示历史记录已通过补充后的检查。',
    notice: '本课补充了重复缺口、无到货和额外到货的检查。历史提交不会自动重判，原有记录、奖励和课程访问保留。要确认当前代码，请重新运行。存档证据 v5 未区分这次检查补充。'
  }),
  'harbor-labels': Object.freeze({
    recordNoun: '这条通过记录',
    uncertainty: 'v5 未记录这次检查修订，不能据此认定已通过补充后的检查。',
    versionLabel: 'v5 记录（未区分本次检查补充）',
    standardNote: '本题存档证据版本 v5；未区分这次检查补充。历史首奖不重发。',
    latestNote: '最近一次未通过；已有通过记录仍按原规则沿用，奖励和课程访问不因补充检查被撤销。这不表示旧记录通过了补充后的检查。',
    notice: '本课补充了部分大小写和空白检查。v5 未记录这次检查修订，历史提交不会自动重判；既有奖励与准入不因补充撤销。请在更新后的页面运行当前代码，并查看本次检查和保存状态。'
  }),
  'beacon-evaluation': Object.freeze({
    uncertainty: '存档证据 v5 未区分本次检查补充，不能据此认定已通过补充后的检查。',
    versionLabel: '存档证据 v5（未区分本次检查补充）',
    standardNote: '本题存档证据版本 v5；未记录本次检查补充的修订号。历史奖励不重发。',
    latestNote: '最近一次未通过；此前通过记录、奖励和已有课程访问仍保留，不表示历史记录已通过补充后的检查。',
    notice: '本课补充了单组、新组名和多组混合输入的检查。历史提交不会自动重判，原有记录、奖励和课程访问保留。要确认当前代码，请重新运行。存档证据 v5 未区分这次检查补充。'
  })
});
export function evidenceCompatibility(lessonId, assessmentVersion) {
  return assessmentVersion === 5 && Object.hasOwn(COMPATIBILITY_COPY, lessonId) ? COMPATIBILITY_COPY[lessonId] : null;
}

export function describeLearningHistory({ lessonId = null, status, record = null, assessmentVersion, limit = 5 }) {
  if (!Object.hasOwn(LEARNING_LABELS, status) || !Number.isInteger(assessmentVersion) || assessmentVersion < 0 || !Number.isInteger(limit) || limit < 1 || limit > 10) {
    throw new TypeError('Invalid learning history presentation input.');
  }
  const compatibility = evidenceCompatibility(lessonId, assessmentVersion);
  let details = LEARNING_LABELS[status];
  if (compatibility && ['guided-practice', 'independent-practice'].includes(status)) {
    details = { ...details,
      label: `${details.label}记录（v5）`,
      description: `${compatibility.recordNoun || '这份保存的通过记录'}${status === 'independent-practice' ? '没有站内辅助标记。' : '带有辅助标记。'}${compatibility.uncertainty}既有访问与奖励保留，不代表已经掌握全部情境。` };
  }
  if (compatibility && status === 'practice') details = { ...details, description: '已经试过，还没有通过记录。可以从失败的检查继续。' };
  const attempts = record?.attempts || [];
  const recent = attempts.slice(-limit).reverse().map(attempt => ({
    id: attempt.id,
    at: attempt.at,
    passed: attempt.passed,
    assisted: attempt.assisted,
    currentVersion: attempt.assessmentVersion === assessmentVersion,
    label: attempt.passed ? '检查通过' : '这次未通过',
    assistance: attempt.assisted ? '辅助提交' : '无站内辅助标记',
    versionLabel: compatibility && attempt.assessmentVersion === 5 ? compatibility.versionLabel : attempt.assessmentVersion === assessmentVersion ? '本版检查' : '旧版检查'
  }));
  const latest = recent[0] || null;
  const historicalSuccess = ['guided-practice', 'independent-practice'].includes(status);
  const latestNote = latest && !latest.passed && historicalSuccess
    ? compatibility
      ? compatibility.latestNote
      : '最近一次没有通过，已有的本版通过记录仍保留。请根据最新检查继续修改。'
    : null;
  return {
    status, ...details,
    compatibilityNote: compatibility?.notice || null,
    standardNote: compatibility
      ? compatibility.standardNote
      : `检查版本 v${assessmentVersion} · 重练不重复领奖`,
    scope: '这些记录属于已提交的代码。修改当前草稿后，请重新运行检查。',
    recent,
    totalRetained: attempts.length,
    boundedNote: attempts.length
      ? `最近 ${recent.length} 次提交 · 通过记录会保留`
      : historicalSuccess
        ? '没有可显示的近期提交记录；成功里程碑仍单独保留。'
        : '没有可显示的近期提交记录。',
    latestNote
  };
}

export function journalSummary(lessons, statusOf) {
  const counts = { total: lessons.length, unobserved: 0, practice: 0, recheck: 0, guided: 0, independent: 0, passed: 0 };
  const keys = { 'unobserved': 'unobserved', 'practice': 'practice', 'needs-recheck': 'recheck', 'guided-practice': 'guided', 'independent-practice': 'independent' };
  for (const lesson of lessons) {
    const status = statusOf(lesson.id);
    if (!Object.hasOwn(keys, status)) throw new TypeError('Unknown assessment status.');
    counts[keys[status]]++;
    if (status === 'guided-practice' || status === 'independent-practice') counts.passed++;
  }
  return counts;
}

export function filterJournalLessons(lessons, { query = '', status = 'all', groupIds = null, statusOf, recordOf = () => null, accessOf = () => null }) {
  const term = String(query).normalize('NFKC').trim().toLocaleLowerCase('zh-CN').slice(0, 100);
  const group = groupIds === null ? null : new Set(groupIds);
  if (!['all', 'to-practice', 'recheck', 'passed', 'independent', 'guided', 'recent-failure', 'ready'].includes(status)) throw new TypeError('Invalid journal filter.');
  return lessons.filter(lesson => {
    if (group && !group.has(lesson.id)) return false;
    const learning = statusOf(lesson.id);
    if (!Object.hasOwn(LEARNING_LABELS, learning)) throw new TypeError('Unknown assessment status.');
    // Read-only discovery: never grant access or reset an existing draft.
    if (status === 'ready' && (learning === 'independent-practice' || accessOf(lesson.id)?.canRun !== true)) return false;
    if (status === 'to-practice' && ['guided-practice', 'independent-practice'].includes(learning)) return false;
    if (status === 'recheck' && learning !== 'needs-recheck') return false;
    if (status === 'passed' && !['guided-practice', 'independent-practice'].includes(learning)) return false;
    if (status === 'independent' && learning !== 'independent-practice') return false;
    if (status === 'guided' && learning !== 'guided-practice') return false;
    // Last retained submission is independent of the durable success milestone.
    if (status === 'recent-failure' && recordOf(lesson.id)?.attempts?.at(-1)?.passed !== false) return false;
    return !term || `${lesson.title} ${lesson.topic} ${lesson.id}`.normalize('NFKC').toLocaleLowerCase('zh-CN').includes(term);
  });
}
