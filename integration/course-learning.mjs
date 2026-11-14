import { LESSONS, evidenceVersionFor, expectedLabels } from './contracts.mjs';
import { PREREQUISITE_RULES } from './lesson-access.mjs';
import { DEEPER_LEARNING, INPUT_DOMAINS } from './course-learning-depth.mjs';
import { LEARNING_NOTES } from './course-learning-notes.mjs';
import { capabilityFor } from './course-learning-map.mjs';
import { MANUAL_APPLICATIONS } from './course-learning-application-data.mjs';

const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const prerequisites = new Map(PREREQUISITE_RULES.map(row => [row.id, row.requires]));
const records = new Map(LESSONS.map((lesson, index) => {
  const note = LEARNING_NOTES[lesson.id] || (lesson.workedExample && [lesson.concept, lesson.workedExample.code, lesson.workedExample.expected, lesson.typicalError.symptom, lesson.typicalError.repair, lesson.recommendedBefore?.[0] || null]);
  if (!note || note.length !== 6) throw new Error(`Missing teaching review for ${lesson.id}.`);
  const [explanation, baseCode, baseExpected, symptom, repair, transferId] = note;
  const deeper = DEEPER_LEARNING[lesson.id];
  const code = deeper?.workedExample.code || baseCode, expected = deeper?.workedExample.expected || baseExpected;
  const independentTargets = LESSONS.filter(candidate => candidate.transferFrom?.includes(lesson.id));
  const target = independentTargets[0] || LESSONS.find(candidate => candidate.id === transferId);
  const independentTarget = independentTargets.includes(target);
  const capability = capabilityFor(lesson.id);
  const ownIndependentTask = ['transfer','debugging','project'].includes(lesson.practiceKind);
  const applicationLesson = independentTarget ? target : ownIndependentTask ? lesson : null;
  const manualApplication = MANUAL_APPLICATIONS[lesson.id];
  if (!applicationLesson && !manualApplication) throw new Error(`Missing independent application for ${lesson.id}`);
  const independentApplication = applicationLesson ? {
    prompt: applicationLesson.description,
    checks: expectedLabels({kind:'lesson',lessonId:applicationLesson.id}),
    graded: true, lessonId: applicationLesson.id,
    environment: '在游戏中另行完成这份任务，以其自己的判题和记录为准。',
  } : {
    prompt: manualApplication[0], checks: manualApplication[1], graded: false, lessonId: null,
    environment: '在自己的 Python 文件中实践并自行核对；这项应用不自动写入游戏通过记录。',
  };
  const knowledge = lesson.concept || '';
  return [lesson.id, freeze({
    id: lesson.id,
    contentVersion: '2026-11-14.2',
    assessmentVersion: evidenceVersionFor(lesson.id),
    difficulty: lesson.id.startsWith('basics-') ? { level: ['basics-arguments','basics-recursion'].includes(lesson.id) ? 2 : 1, label: ['basics-arguments','basics-recursion'].includes(lesson.id) ? '组合应用' : '基础练习' } :
      { level: lesson.judgeKind || ['numeric-ratios','archive-median','archive-distance'].includes(lesson.id) ? 4 : index < 14 ? 1 : index < 30 ? 2 : 3,
        label: lesson.judgeKind || ['numeric-ratios','archive-median','archive-distance'].includes(lesson.id) ? '进阶合同' : index < 14 ? '基础练习' : index < 30 ? '组合应用' : '工程推理' },
    hintLevels: lesson.hintLevels,
    practiceKind: lesson.practiceKind || 'practice',
    independentApplication,
    capability: { id: capability.id, title: capability.title },
    learningGoals: [lesson.description, capability.demonstration],
    objective: lesson.description + (INPUT_DOMAINS[lesson.id] ? `\n输入范围：${INPUT_DOMAINS[lesson.id]}` : ''),
    inputContract: INPUT_DOMAINS[lesson.id] || lesson.description,
    explanation: [explanation, ...(deeper ? [deeper.explanation] : []), knowledge],
    workedExample: { code, expected, steps: ['先读代码，写出你预测的输出或事件顺序。', `本例应观察到：${expected}`, '改变一个输入，说明规则是否仍成立。示例演示概念，不计入本课通过。'], standalone: true, executionEnvironment: '原生 Python 3.12 独立示例；游戏工作台只运行本课练习入口，部分示例模块或asyncio.run在该入口不可用' },
    tryAgain: { prompt: `重新从起始代码完成「${lesson.title}」。重点排查：${symptom}。先预测一组正常输入和一个边界，再运行本课完整检查。`, code: lesson.starter },
    typicalErrors: [{ symptom, reason: explanation, repair }],
    transferChallenge: target ? { prompt: `${independentTarget ? '换一份新委托' : '继续应用'}：「${target.title}」。${target.description}`, lessonId: target.id, graded: true, relationship: independentTarget ? 'independent-transfer' : 'related-practice', assessmentScope: independentTarget ? '新需求、新起始代码与独立行为判题；需无辅助完成后才有这份任务的独立实践记录' : '关联课程的既有合同，不自动证明陌生迁移' }
      : { prompt: lesson.transfer || '为同一规则换一组名称、规模和故障位置，写出自己的测试并解释结果。当前未自动评估陌生迁移或延时保持。', lessonId: null, graded: false },
    independentPractice: { taskId: ['transfer','debugging','project'].includes(lesson.practiceKind) ? lesson.id : null,
      transferTaskIds: independentTargets.map(target => target.id),
      recordRule: '当前判题通过且本次无辅助标记；原课程通过不能代替另一项任务的通过。',
      humanEvidence: '再试着解释方案、设计自己的测试，并隔一段时间换题复做。' },
    practiceLadder: [
      { kind: 'predict', prompt: '先预测小例子的输出，再逐行解释值从哪里来。', graded: false },
      { kind: 'trace', prompt: `改变一个输入，观察「${symptom}」如何出现；先写预期，再定位原因。`, graded: false },
      { kind: 'implement', prompt: lesson.description, graded: true, taskId: lesson.id },
      { kind: 'transfer', prompt: independentApplication.prompt, graded: independentApplication.graded, taskId: independentApplication.lessonId },
    ],
    prerequisiteIds: [...prerequisites.get(lesson.id)],
    recommendedBefore: [...(lesson.recommendedBefore || [])],
    bridgeLessons: LESSONS.filter(candidate => candidate.recommendedBefore?.includes(lesson.id)).map(candidate => candidate.id),
    checks: expectedLabels({ kind: 'lesson', lessonId: lesson.id }),
    boundaries: lesson.boundary || '本课通过仅证明这些输入和合同下的程序行为；不等于人类已经掌握。',
    nativeProject: lesson.id === 'engineering-report' ? { title: '货运报告多文件原生项目', sourceArchive: '../integration/native-course-source.zip', archiveSha256: '44ea4442d017b6ab07385ce3f3992608f7b1e0e95699ec273a92b80478b55e0f', prerequisites: ['engineering-files','engineering-csv','engineering-cli','engineering-tests','engineering-report'], startCommands: ['python -m unittest discover -s tests -v','python -m catcargo orders.csv report.json','python build.py catcargo.pyz'], environment: '已验证 Linux Python 3.12.14；全部使用标准库，无额外依赖', windows: '需要已安装 Python 3.12 或更高版本；可使用 .venv\\Scripts\\python.exe。Windows 真机未验收。', readme: '../integration/native-course/README.md', assessmentScope: '真实本地文件、进程、包导入、unittest与zipapp；本地结果不自动进入游戏记录', assistance: '下载包含参考实现，属于跟做材料。' }
      : lesson.id === 'project-stock-ledger' ? { title: '仓库结算 · 独立多文件工程', studentOnly: true, archiveSha256: '7a8d1be2e29d461b53c600376d7613a54c10e09c2ab8e7c30ebebbb17cd3158f', sourceArchive: '../integration/native-course-practice.zip', prerequisites: ['engineering-files','engineering-csv','engineering-cli','engineering-tests','engineering-report','transfer-log-report','testing-regression'], startCommands: ['python -m stockledger --help','python -m unittest discover -s tests -v','python -m stockledger examples/stock.csv examples/orders.csv report.json','python build.py stockledger.pyz'], environment: 'Python 3.12 或以上；只用标准库。起始项目故意未完成，实现后再运行完整验收。', windows: '在解压目录使用 py -3.12 -m venv .venv，再用 .venv\\Scripts\\python.exe 运行命令。Windows 真机待验证。', readme: '../integration/native-course-practice/README.md', assessmentScope: '两份真实CSV、纯函数与I/O分层、unittest、进程退出状态及从新目录启动pyz；本地结果不自动进入游戏记录', assistance: '独立学生包：未解入口、输入样例和测试，不含参考实现。' } : null,
    evidenceNotice: '阅读和自行核对不计通关；打开提示后，可再换题独立试一次。',
  })];
}));
export const COURSE_LEARNING = Object.freeze([...records.values()]);
export function courseLearning(id) {
  if (!records.has(id)) throw new Error(`Unknown learning guide ${id}.`);
  return records.get(id);
}
export const LEARNING_GOAL_MAP = freeze(COURSE_LEARNING.map(guide => ({
  id: guide.id, goal: guide.objective, knowledge: LESSONS.find(lesson => lesson.id === guide.id).topic,
  lessonId: guide.id, practice: guide.tryAgain.prompt, checks: guide.checks,
  prerequisiteIds: guide.prerequisiteIds, contentVersion: guide.contentVersion,
  assessmentVersion: guide.assessmentVersion, transferLessonId: guide.transferChallenge.lessonId,
})));

const earlyPath = ['first-steps','coin-math','greeting','backpack','safe-buy','basics-values','basics-branches','shells','basics-while','catalog','discount','basics-scope','basics-slices','select-items','invalid-input','engineering-annotations','ledger','stock-class','engineering-dataclass','generator','test-case','engineering-imports','numeric-ratios','engineering-files','basics-recursion','basics-arguments','engineering-csv','engineering-cli','engineering-tests','engineering-report'];
const bridgePath = ['ae26-l00-context','ae26-l01-proposals','ae26-a00-tools','ae26-a01-loop','ae26-a02-evidence'];
const preferred = [...earlyPath.slice(0,11), 'invalid-input', 'test-case', ...bridgePath, ...earlyPath.slice(11).filter(id => !['invalid-input','test-case'].includes(id)), ...LESSONS.map(lesson => lesson.id).filter(id => !earlyPath.includes(id) && !bridgePath.includes(id))];
const outstanding = new Set(preferred);
const path = [];
while (outstanding.size) {
  const id = preferred.find(candidate => outstanding.has(candidate) &&
    prerequisites.get(candidate).every(prerequisite => !outstanding.has(prerequisite)) &&
    LESSONS.filter(lesson => lesson.recommendedBefore?.includes(candidate)).every(lesson => !outstanding.has(lesson.id)));
  if (!id) throw new Error('Teaching recommendations create a prerequisite cycle.');
  path.push(id);
  outstanding.delete(id);
}
export const LEARNING_PATH = Object.freeze(path);
