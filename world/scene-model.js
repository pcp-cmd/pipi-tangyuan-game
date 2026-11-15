import {SERVICE_BUILDINGS} from './service-buildings.mjs';
import { TILES } from '../dist/engine.js';
import { LESSONS } from '../integration/contracts.mjs';
import { WORLD_SAVE_KEY } from './world-storage.mjs';
import { ISLANDS } from './engine/curriculum.mjs';

export const SAVE_KEY = WORLD_SAVE_KEY;
export const CAMERA_KEY = `${SAVE_KEY}:camera`;
export const LESSON_STEPS = [3, 2, 1];
export const CAT_NAMES = { pipi: '皮皮', tangyuan: '汤圆' };
export const SCENE = {
  width: 1487, height: 1058,
  background: './assets/scene-background.webp',
  assetsReady: true,
  cats: { pipi: './assets/pets/pipi-idle-v2.png', tangyuan: './assets/pets/tangyuan-idle-v2.png' },
  points: [
    [825, 800], [855, 740], [875, 675], [915, 610],
    [1015, 565], [1110, 530], [1205, 545], [1080, 515],
    [970, 575], [755, 465], [1240, 645], [610, 825]
  ],
  places: [
    { id: 'harbor', name: '启程码头', icon: 'anchor', x: 360, y: 670, description: '潮水轻拍木桩，帆船已经备好。用第一行 Python，把今天的旅途写进小岛。', action: 'workshop', actionLabel: '写下第一行代码' },
    { id: 'workshop', name: '代码工坊', icon: 'hammer', x: 1090, y: 430, description: '灯亮着，工具也摆好了。这里可以写代码、看输出，让每个小小的想法变成真实的一步。', action: 'workshop', actionLabel: '进入代码工坊' },
    { id: 'lighthouse', name: '测试灯塔', icon: 'lighthouse', x: 820, y: 255, description: '灯塔守望着航道。小岛漫游可以随时出发；挑战里的棋盘步数，仍要由通过检查的代码推动。', action: 'concept', actionLabel: '翻开本关知识卡' },
    { id: 'camp', name: '休息营地', icon: 'tent', x: 1310, y: 575, description: '炉火正暖，给两位伙伴留个休息的位置。皮皮好奇爱探路，汤圆安静又细心；下一段由谁带队，由你决定。', action: 'journal', actionLabel: '看看伙伴与手账' }
  ]
};

// Art IDs and original terrain coordinates remain stable. Curriculum routing
// uses stable island IDs, never either collection's local chapter number.
export const REGION_BINDINGS = Object.freeze([
  { artRegionId: 'departure', curriculumIslandId: 'harbor', x: 150, y: 806 },
  { artRegionId: 'loops', curriculumIslandId: 'market', x: 470, y: 576 },
  { artRegionId: 'functions', curriculumIslandId: 'workshop', x: 820, y: 746 },
  { artRegionId: 'data', curriculumIslandId: 'archive', x: 850, y: 376 },
  { artRegionId: 'objects', curriculumIslandId: 'observatory', x: 1200, y: 536 },
  { artRegionId: 'async', curriculumIslandId: 'beacon', x: 1270, y: 230 },
  { artRegionId: 'projects', curriculumIslandId: null, x: 450, y: 276 }
].map(binding => Object.freeze(binding)));

export const REGIONS = REGION_BINDINGS.map(binding => {
  const island = binding.curriculumIslandId ? ISLANDS.find(item => item.id === binding.curriculumIslandId) : { id: 'protocol', name: '雾港协议工坊', subtitle: '让资源、缓存与货流遵守约定', place: '远航营地里的协议工坊', project: '把异常与清理写成可检查的规则', questIds: LESSONS.filter(item => item.judgeKind === 'protocol').map(item => item.id) };
  if (binding.curriculumIslandId && !island) throw new Error(`地图绑定找不到课程岛：${binding.curriculumIslandId}`);
  return {
    ...binding, curriculumIslandId: island.id, id: binding.artRegionId,
    name: island?.name || '远航营地',
    topic: island?.subtitle || 'CPython 实验规划',
    description: island ? `${island.place}。${island.project}。${SERVICE_BUILDINGS.find(service => service.exteriorId === `${island.id}.exterior`)?.description || ''}` : '这里是后续 CPython 实验入口，与六个课程岛分开。文件、SQLite、异步与性能实验尚未接入本场景。',
    available: true,
    visualStatus: binding.artRegionId === 'departure' ? 'explorable-with-curriculum' : 'curriculum-only',
    curriculumQuestIds: island?.questIds || []
  };
});

export function questContext(state, lesson) {
  const steps = LESSON_STEPS[state.mission] ?? 0;
  const origin = state.positions[state.activeCat];
  const target = (origin + steps) % TILES.length;
  const leader = CAT_NAMES[state.activeCat];
  return {
    steps, origin, target, leader,
    originName: TILES[origin][0], targetName: TILES[target][0],
    description: lesson.id === 'first-steps'
      ? `${leader}想前进 3 格。创建 steps 变量，打印它，再用 game.move(steps) 带它去${TILES[target][0]}。`
      : lesson.description,
    rewardClaimed: state.completed.includes(lesson.id)
  };
}
