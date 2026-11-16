import { courseLearning } from '../integration/course-learning.mjs';
import { LESSONS } from '../integration/contracts.mjs';
import { renderKnowledgeText } from './knowledge-reader.mjs';
import { mountCourseArticle } from './generated/course-article.mjs';

const titles = new Map(LESSONS.map(lesson => [lesson.id, lesson.title]));

export function renderCourseLearning({ document: doc = document, lessonId, onTransfer, articleLoader }) {
  const guide = courseLearning(lessonId);
  const make = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const taskTitle = doc.getElementById('lessonTaskTitle');
  if (taskTitle) taskTitle.textContent = titles.get(lessonId) || '';
  const explanation = doc.getElementById('lessonExplanation');
  mountCourseArticle({ root: explanation, lessonId, disclosure: doc.getElementById('conceptDetails'), loader: articleLoader });
  const example = doc.getElementById('lessonExample');
  example.replaceChildren(); example.hidden = true;
  const mistakes = doc.getElementById('lessonMistakes');
  mistakes.replaceChildren(...guide.typicalErrors.map(error => {
    const detail = make('details');
    detail.append(make('summary', error.symptom), make('p', error.reason), make('p', error.repair));
    return detail;
  }));
  // The parent hint disclosure owns the assistance marker. Nested levels are
  // revealed deliberately; changing lesson discards their previous open state.
  const hintLevels = doc.getElementById('lessonHintLevels');
  if (hintLevels) {
    const levels = (guide.hintLevels || []).filter(level => level.level > 1);
    hintLevels.replaceChildren(...levels.map(level => {
      const detail = make('details', undefined, 'hint-level');
      detail.dataset.hintLevel = String(level.level);
      const content = make('div');
      renderKnowledgeText(content, level.text || '');
      detail.append(make('summary', level.title || `提示 ${level.level}`), content);
      return detail;
    }));
  }
  const transfer = doc.getElementById('lessonTransfer');
  const transferTitle = doc.getElementById('lessonTransferTitle');
  if (transferTitle) transferTitle.textContent = '相关练习与输入约定';
  transfer.replaceChildren();
  if (guide.inputContract) transfer.append(make('p', guide.inputContract));
  if (guide.bridgeLessons?.length) {
    const bridges = make('nav'); bridges.setAttribute('aria-label', '建议先补充的练习');
    for (const id of guide.bridgeLessons) {
      const button = make('button', titles.get(id) || id, 'text-button'); button.type = 'button';
      button.addEventListener('click', () => onTransfer(id, button)); bridges.append(button);
    }
    transfer.append(bridges);
  }
  if (guide.transferChallenge.lessonId) {
    const button = make('button', `打开相关练习：${titles.get(guide.transferChallenge.lessonId) || ''}`, 'text-button');
    button.type = 'button';
    button.addEventListener('click', () => onTransfer(guide.transferChallenge.lessonId, button));
    transfer.append(button);
  }
  const nativeProject = doc.getElementById('lessonNativeProject');
  nativeProject.replaceChildren();
  nativeProject.hidden = !guide.nativeProject;
  if (guide.nativeProject) {
    const project = guide.nativeProject, detail = make('details');
    const download = make('a', project.studentOnly ? '下载独立项目包（ZIP）' : '下载项目源码（ZIP）', 'text-button');
    download.href = project.sourceArchive;
    download.download = project.sourceArchive.split('/').at(-1);
    const instructions = make('a', '下载启动说明', 'text-button');
    instructions.href = project.readme; instructions.download = 'README-native-course.md';
    detail.append(make('summary', project.title), make('p', project.assistance), make('p', project.assessmentScope),
      make('p', '本地项目需要另装 Python 3.12+；游戏内课程无需安装它。'), download, instructions);
    nativeProject.append(detail);
  }
  return guide;
}

export function presentRunChecks({ document: doc = document, outcome }) {
  const detail = doc.getElementById('runChecks');
  const summary = doc.getElementById('runChecksSummary');
  const checks = outcome.checks || [];
  const failed = checks.filter(check => !check.passed);
  detail.hidden = !checks.length && outcome.kind !== 'python-error';
  detail.open = failed.length > 0 || outcome.kind === 'python-error';
  summary.textContent = failed.length ? `${failed.length} 项待修正 · 展开全部检查` : `检查明细 · ${checks.length} 项通过`;
  const next = doc.getElementById('failureNext');
  next.hidden = outcome.lessonId === 'first-steps' || !['incorrect', 'python-error'].includes(outcome.kind);
  if (!next.hidden) {
    const directions = {
      NameError: '核对报错名字的拼写，以及第一次赋值的位置。',
      TypeError: '先打印参与运算的值和类型，再核对函数接收的参数。',
      ValueError: '核对这次输入是否符合任务允许的范围与格式。',
      SyntaxError: '检查报错行及前一行的冒号、括号和引号。',
      IndentationError: '检查相邻语句的缩进，确认它们属于同一层级。',
      ZeroDivisionError: '先处理除数为零的情况，再进行除法。',
    };
    next.textContent = outcome.kind === 'python-error'
      ? directions[outcome.error?.name] || '对照报错行与任务要求；需要时展开左页的讲解与提示。'
      : `先检查「${failed[0]?.label || '任务要求'}」。用同样的输入逐步追踪返回值，再重试。`;
  } else next.textContent = '';
}
