import { getLesson } from '../integration/contracts.mjs';

const labels = Object.freeze({ normal: '正常流程', failure: '失败流程', edge: '边界流程', cancel: '合作取消' });
const protocolModes = Object.freeze(['normal', 'failure', 'edge']);

export function lessonSceneView(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error('Unknown lesson presentation.');
  const modes = lesson.judgeKind === 'lifecycle' ? lesson.sceneModes
    : lesson.judgeKind === 'protocol' ? protocolModes : [];
  const options = modes.map(value => {
    if (!Object.hasOwn(labels, value)) throw new Error('Unknown lesson scene.');
    return Object.freeze({ value, label: lesson.id === 'lifecycle-multi-resource' && value === 'cancel' ? '同步控制中断' : labels[value] });
  });
  return Object.freeze({ options: Object.freeze(options),
    note: lesson.judgeKind === 'foundations' ? '运行会检查正常交接、失败和合作取消，最长25秒。“停止”会终止运行环境，不能保证 finally 执行。使用提示会记为辅助练习。' : lesson.judgeKind === 'lifecycle'
      ? (lesson.id === 'lifecycle-multi-resource'
        ? '知识卡中的“运行真实验收”对应本页的“运行代码”。本关时限为 25 秒。“同步控制中断”场景在 with 块内抛出 KeyboardInterrupt，观察资源关闭及异常传播，不是异步任务取消；“停止运行”会终止运行环境，不保证 finally 执行。'
        : '知识卡中的“运行真实验收”对应本页的“运行代码”。本关时限为 25 秒。合作取消场景检查等待清理；“停止”会终止运行环境，不保证 finally 执行。')
      : '' });
}
