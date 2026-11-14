import { COURSE_PRESENTATIONS } from './course-presentation.mjs';
import { LESSONS } from '../integration/contracts.mjs';

const aliases = Object.freeze({
  'candidate.workshop.clockworks': 'workshop.clockworks.interior',
  'candidate.observatory.waterworks': 'observatory.waterworks.interior',
  'candidate.beacon.dispatch-tower': 'beacon.dispatch-tower.interior',
  'candidate.protocol.workshop': 'protocol.workshop.interior',
});
const known = new Set(LESSONS.map(lesson => lesson.id));
const ids = values => Object.freeze(values.filter(id => known.has(id)));
const primary = sceneId => COURSE_PRESENTATIONS.filter(course => course.primarySceneId === sceneId).map(course => course.id);
const workshops = [
  { sceneId: 'harbor.code-workshop.interior', label: '启航练习', purpose: '从变量、分支和循环开始，把想法写成能运行的 Python。',
    lessonIds: [...primary('harbor.exterior'), ...primary('harbor.code-workshop.interior')] },
  { sceneId: 'harbor.test-lighthouse.interior', label: '检验与复练', purpose: '查看失败的检查，设计反例，再验证自己的修正。', mode: 'verify', lessonIds: primary('harbor.test-lighthouse.interior') },
  { sceneId: 'harbor.test-lighthouse.observation-room', label: '测试观察台', purpose: '比较本次结果与历史提交，复查边界与错误输入。', mode: 'verify', lessonIds: primary('harbor.test-lighthouse.interior') },
  { sceneId: 'market.warehouse.interior', label: '仓库委托', purpose: '清点库存、处理收据，交付不会少货或重复出库的订单。', lessonIds: primary('market.warehouse.interior') },
  { sceneId: 'market.windmill.interior', label: '集市排序台', purpose: '核对价目、比较货单，让排序和筛选规则清楚可检验。', lessonIds: [...primary('market.exterior'), 'transfer-stable-priority'] },
  { sceneId: 'market.forest.exterior', label: '林径补给台', purpose: '用预算和条件筛选物资，再处理陌生的补给任务。', lessonIds: [...primary('market.forest.exterior'), 'transfer-resupply'] },
  { sceneId: 'workshop.clockworks.interior', label: '钟表工坊', purpose: '用函数、闭包与迭代协议组织可复用的加工步骤。',
    lessonIds: primary('workshop.clockworks.interior').filter(id => !['workshop-wallet','workshop-result','engineering-annotations','engineering-dataclass'].includes(id)) },
  { sceneId: 'workshop.material-shed.interior', label: '材料装配台', purpose: '组装有约束的对象与结果，检查共享数据和失败边界。',
    lessonIds: ['workshop-wallet','workshop-result','engineering-annotations','engineering-dataclass','debugging-aliases'] },
  { sceneId: 'archive.records.interior', label: '档案处理台', purpose: '读取文件、整理 CSV 与 JSON，并留下可以交接的数据结果。', lessonIds: primary('archive.records.interior') },
  { sceneId: 'archive.garden.exterior', label: '花园观测台', purpose: '按需读取、依次排队，用测量结果回答实际问题。', lessonIds: primary('archive.garden.exterior') },
  { sceneId: 'archive.greenhouse.interior', label: '温室样本台', purpose: '比较读数、排查异常，理解统计结果的意义。', lessonIds: primary('archive.greenhouse.interior') },
  { sceneId: 'observatory.waterworks.interior', label: '水轮推演台', purpose: '追踪查找与事件回放，验证每一步的状态变化。', lessonIds: primary('observatory.waterworks.interior') },
  { sceneId: 'observatory.summit.exterior', label: '海况观测台', purpose: '检查缓存与时效，让旧信息按规则失效。', lessonIds: primary('observatory.summit.exterior') },
  { sceneId: 'observatory.summit.interior', label: '观测站项目台', purpose: '用测试、命令行和完整项目证明程序可以独立交付。', lessonIds: primary('observatory.summit.interior') },
  { sceneId: 'beacon.dispatch-tower.interior', label: '调度委托', purpose: '核对权限、预算与重试，组织可以追踪的工具流程。',
    lessonIds: primary('beacon.dispatch-tower.interior').filter(id => !id.startsWith('async-') && !id.startsWith('lifecycle-')) },
  { sceneId: 'beacon.dispatch-tower.lantern-room', label: '信标接力台', purpose: '让异步任务等待、交接和收尾，取消后仍检查资源归还。',
    lessonIds: primary('beacon.dispatch-tower.interior').filter(id => id.startsWith('async-') || id.startsWith('lifecycle-')) },
  { sceneId: 'protocol.workshop.interior', label: '协议工坊', purpose: '用明确协议管理资源、缓存与数据流，检查所有权和清理。', lessonIds: primary('protocol.workshop.interior') },
];

export const BUILDING_OFFERINGS = Object.freeze(workshops.map(row => Object.freeze({ ...row, mode: row.mode || 'learn', lessonIds: ids([...new Set(row.lessonIds)]) })));

export function buildingOffering(sceneId) {
  const canonical = aliases[sceneId] || sceneId;
  return BUILDING_OFFERINGS.find(row => row.sceneId === canonical) || null;
}

export function buildingLessonIds(sceneId, currentLessonId) {
  const local = buildingOffering(sceneId)?.lessonIds || [];
  return Object.freeze([...new Set([...(known.has(currentLessonId) ? [currentLessonId] : []), ...local])]);
}
