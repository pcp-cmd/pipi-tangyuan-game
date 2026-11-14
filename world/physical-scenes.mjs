import {addServiceBuildings} from './service-buildings.mjs';
import {addAgentWorldObjects} from './physical-agent-objects.mjs';
import {applyRuntimeSceneAssets} from './physical-runtime-assets.mjs';
import {applyObjectOutlines} from './physical-object-outlines.mjs';
import {applySceneCandidates} from './scene-candidate-geometry.mjs';
import { expandPhysicalScenes } from './physical-island-layouts.mjs';
import { TERRAIN_ZONES, TERRAIN_BLOCKS } from './scene-terrain.mjs';
import { WALK_NODES } from './scene-walk.mjs';
import { ROOM_ASSETS } from './physical-asset-metadata.mjs';
import { addOpenGround } from './open-ground.mjs';
export const LEGACY_PHYSICAL_REGISTRY_VERSION = 'rooms-20261113-v1';
export const PRE_ART_PHYSICAL_REGISTRY_VERSION = 'islands-20261113-v2';
export const PRE_SERVICE_PHYSICAL_REGISTRY_VERSION = 'islands-art-20261113-v3';
export const PHYSICAL_REGISTRY_VERSION = 'islands-service-20261114-v4';
export const DEFAULT_PHYSICAL_SCENE_ID = 'harbor.exterior';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const rect = (l,t,r,b) => [[l,t],[r,t],[r,b],[l,b]];
const pose = (x,y,facing='right') => ({x,y,facing});
const hotspot = (id,label,kind,x,y,ax,ay,extra={}) => ({id,label,kind,x,y,approach:{x:ax,y:ay},radius:32,...extra});
const interior = (id,title,asset,zones,blocks,spawn,hotspots,extra={}) => ({
  id,title,...ROOM_ASSETS[asset],background:`assets/rooms/${asset}.png`,candidate:true,pairedExterior:null,
  missing:['foreground-masks','final-art-approval'],catScale:0.64,
  navigation:{radius:22,speed:200,followGap:90,gridStep:20,zones,blocks,waypoints:[...Object.values(spawn),...hotspots.map(h=>h.approach)]},
  spawn,hotspots,doors:hotspots.filter(h=>h.kind==='door'),...extra
});
const exit = (id,x,y,ax,ay) => hotspot(id,'返回来处','door',x,y,ax,ay,{return:true});
const scenes = [
 {id:DEFAULT_PHYSICAL_SCENE_ID,title:'启航岛',width:1487,height:1058,background:'assets/scene-background.png',assetSha256:'56b4a9e6334ec30abced736a1f63e16fb69d2be17e3112d0306e5e9173094a84',candidate:false,pairedExterior:null,missing:['six-other-island-exteriors'],catScale:0.58,
  navigation:{radius:18,speed:190,followGap:90,gridStep:20,zones:[...TERRAIN_ZONES,rect(943,490,1070,585),rect(890,530,1080,640),rect(1040,640,1350,830)],blocks:[...TERRAIN_BLOCKS.map(r=>[r.left,r.top,r.right,r.bottom]),[1280,790,1487,1058]],waypoints:[...Object.values(WALK_NODES),{x:970,y:515},{x:1030,y:530}]},
  spawn:{pipi:pose(825,800),tangyuan:pose(735,825)},
  hotspots:[hotspot('harbor.code-workshop.front-door','进入代码工坊','door',963,447,970,515,{to:'harbor.code-workshop.interior',pairedDoorId:'harbor.code-workshop.exit'}),hotspot('harbor.test-lighthouse.front-door','进入测试灯塔','door',796,373,785,420,{to:'harbor.test-lighthouse.interior',pairedDoorId:'harbor.test-lighthouse.exit'}),hotspot('harbor.pier','启程码头','inspect',550,780,550,825),hotspot('harbor.camp','休息营地','inspect',1310,575,1290,670)]},
 interior('harbor.code-workshop.interior','启航代码工坊 · 室内候选','harbor.code-workshop.interior-v4',
  [rect(335,495,1400,805),rect(230,690,430,810),rect(230,760,295,940)],
  [[1110,640,1325,790],[650,775,1425,925],[580,805,655,945],[295,825,580,965]],
  {pipi:pose(440,730),tangyuan:pose(335,750)},
  [exit('harbor.code-workshop.exit',240,820,260,870),hotspot('harbor.code-workshop.bench','代码工作台','workbench',1170,390,1040,550,{workbenchId:'harbor.code-workshop.bench',curriculumIslandId:'harbor'})],{pairedExterior:DEFAULT_PHYSICAL_SCENE_ID}),
 interior('harbor.test-lighthouse.interior','测试灯塔 · 室内候选','harbor.test-lighthouse.interior-v2',
  [[[350,690],[570,550],[1000,550],[1160,700],[1020,810],[570,840],[350,790]],rect(350,650,600,795)],
  [[610,350,920,550],[935,450,1080,585],[1080,410,1290,680]],
  {pipi:pose(600,700),tangyuan:pose(485,730)},
  [exit('harbor.test-lighthouse.exit',410,570,410,730),hotspot('harbor.test-lighthouse.bench','测试控制台','workbench',770,430,780,600,{workbenchId:'harbor.test-lighthouse.bench',curriculumIslandId:'harbor'}),hotspot('harbor.test-lighthouse.stairs','楼上尚未接入','inspect',1180,350,1040,700)],{pairedExterior:DEFAULT_PHYSICAL_SCENE_ID}),
 interior('candidate.observatory.waterworks','观星水工房 · 候选试走','observatory.waterworks.interior-v1',
  [[[330,650],[590,530],[960,530],[1190,670],[1070,795],[500,835],[330,800]],rect(340,730,500,935)],
  [[420,350,575,560],[580,380,965,520],[975,430,1240,665],[835,740,1050,840]],
  {pipi:pose(580,710),tangyuan:pose(470,750)},
  [exit('candidate.observatory.exit',350,810,405,865),hotspot('candidate.observatory.bench','水工对象工作台','workbench',780,420,790,575,{workbenchId:'candidate.observatory.bench',curriculumIslandId:'observatory'})]),
 interior('candidate.beacon.dispatch-tower','信标调度塔 · 候选试走','beacon.dispatch-tower.interior-v3',
  [[[310,700],[520,465],[970,450],[1200,620],[1240,780],[1020,905],[500,915],[310,840]],rect(240,720,430,900)],
  [[190,395,530,595],[590,300,925,440],[1025,280,1200,560],[1170,500,1360,660]],
  {pipi:pose(600,700),tangyuan:pose(485,735)},
  [exit('candidate.beacon.exit',240,745,300,825),hotspot('candidate.beacon.bench','异步调度台','workbench',760,290,760,490,{workbenchId:'candidate.beacon.bench',curriculumIslandId:'beacon'}),hotspot('candidate.beacon.map','航图尚待绘制','inspect',330,260,550,635)]),
 interior('candidate.protocol.workshop','协议工坊 · 候选试走','protocol.workshop.interior-v3',
  [[[380,680],[1000,720],[1190,825],[950,950],[410,900],[300,805]],rect(225,785,450,930)],
  [[520,500,1020,710],[1020,570,1280,815],[340,450,510,670]],
  {pipi:pose(600,805),tangyuan:pose(480,820)},
  [exit('candidate.protocol.exit',250,820,290,870),hotspot('candidate.protocol.bench','协议规则工作台','workbench',790,560,790,765,{workbenchId:'candidate.protocol.bench',curriculumIslandId:'protocol'})],{missing:['foreground-masks','final-art-approval','door-readability']}),
 interior('candidate.workshop.clockworks','齿轮工坊 · 候选试走','workshop.clockworks.interior-v1',
  [rect(380,560,1150,900),rect(170,720,1390,915)],
  [[30,200,380,700],[610,350,1025,540],[1150,420,1495,785]],
  {pipi:pose(580,760),tangyuan:pose(465,790)},
  [exit('candidate.workshop.exit',200,800,220,835),hotspot('candidate.workshop.bench','函数齿轮工作台','workbench',805,395,805,590,{workbenchId:'candidate.workshop.bench',curriculumIslandId:'workshop'})])
];
// Polygon clips re-use the exact background pixels. These are hand-inspected
// silhouettes, separate from solid floor footprints, for browser refinement.
const occluders = {
 'harbor.code-workshop.interior': [
  {id:'door-leaf',frontY:920,polygon:[[132,650],[225,641],[228,875],[135,915]]},
  {id:'door-right-post',frontY:920,polygon:[[303,646],[334,646],[336,875],[300,875]]},
  {id:'center-post',frontY:947,polygon:[[590,532],[644,534],[650,944],[580,944]]},
  {id:'front-counter',frontY:930,polygon:[[649,774],[1432,773],[1432,928],[649,928]]},
  {id:'overhead-beam',frontY:950,polygon:[[643,550],[1441,549],[1441,598],[683,605],[642,650]]},
  {id:'anvil',frontY:789,polygon:[[1121,665],[1164,668],[1170,650],[1235,645],[1274,662],[1283,698],[1250,729],[1274,744],[1274,778],[1144,778],[1142,743],[1184,720],[1182,697],[1126,688]]}
 ],
 'harbor.test-lighthouse.interior': [
  {id:'open-door',frontY:806,polygon:[[220,454],[261,417],[307,415],[345,443],[349,733],[220,801]]},
  {id:'door-right-pier',frontY:680,polygon:[[475,409],[520,421],[551,475],[548,676],[494,674],[478,631]]},
  {id:'front-wall',frontY:970,polygon:[[442,792],[576,821],[790,850],[1002,820],[1188,746],[1233,881],[1040,945],[790,984],[560,948],[440,880]]},
  {id:'stairs-front-post',frontY:682,polygon:[[1082,519],[1112,513],[1141,533],[1145,670],[1084,671]]}
 ],
 'candidate.observatory.waterworks': [
  {id:'front-wall',frontY:945,polygon:[[471,804],[794,820],[1051,789],[1055,899],[799,934],[471,904]]},
  {id:'waterwheel-cage',frontY:665,polygon:[[983,443],[1203,429],[1246,471],[1236,651],[978,661]]}
 ],
 'candidate.beacon.dispatch-tower': [
  {id:'front-wall',frontY:1000,polygon:[[314,855],[517,921],[793,949],[1038,904],[1263,789],[1240,910],[1033,1002],[540,1013],[314,934]]},
  {id:'entry-right-pier',frontY:924,polygon:[[279,693],[322,702],[347,748],[347,921],[285,901]]}
 ],
 'candidate.protocol.workshop': [
  {id:'entry-frame',frontY:953,polygon:[[354,689],[403,690],[400,929],[354,950]]},
  {id:'front-wall',frontY:1030,polygon:[[581,919],[952,961],[1004,941],[1015,1008],[938,1035],[580,983]]}
 ],
 'candidate.workshop.clockworks': [
  {id:'front-left-pier',frontY:957,polygon:[[285,821],[333,820],[340,937],[289,957]]},
  {id:'front-wall',frontY:1005,polygon:[[339,905],[1370,899],[1370,976],[1090,1001],[346,986]]}
 ]
};
for(const scene of scenes){scene.occluders=(occluders[scene.id]||[]).map(o=>({...o,polygon:o.polygon.map(([x,y])=>({x,y}))}));scene.missing=scene.missing.filter(item=>item!=='foreground-masks');if(scene.candidate)scene.missing.push('occlusion-browser-review');}
for(const scene of scenes) if(!scene.doors) scene.doors=scene.hotspots.filter(h=>h.kind==='door');
export const LEGACY_PHYSICAL_SCENES = freeze(structuredClone(Object.fromEntries(scenes.map(s=>[s.id,s]))));
export const LEGACY_PHYSICAL_SCENE_ALIASES = freeze({
 'candidate.workshop.clockworks':'workshop.clockworks.interior',
 'candidate.observatory.waterworks':'observatory.waterworks.interior',
 'candidate.beacon.dispatch-tower':'beacon.dispatch-tower.interior',
 'candidate.protocol.workshop':'protocol.workshop.interior'
});
const preArtScenes = expandPhysicalScenes(scenes);
export const PRE_ART_PHYSICAL_SCENES = freeze(structuredClone(Object.fromEntries(preArtScenes.map(s=>[s.id,s]))));
const artScenes = applyObjectOutlines(applySceneCandidates(preArtScenes));
export const PRE_SERVICE_PHYSICAL_SCENES = freeze(Object.fromEntries(addOpenGround(addServiceBuildings(artScenes,{dedicated:false})).map(s=>[s.id,s])));
const worldScenes = applyRuntimeSceneAssets(addAgentWorldObjects(addOpenGround(addServiceBuildings(artScenes))));
export const PHYSICAL_PORTS = freeze(Object.fromEntries(['harbor','market','workshop','archive','observatory','beacon','protocol'].map(islandId=>[
 `${islandId}.port`,{id:`${islandId}.port`,islandId,sceneId:`${islandId}.exterior`,hotspotId:islandId==='harbor'?'harbor.pier':`${islandId}.port`,arrival:islandId==='harbor'?{pipi:pose(550,825),tangyuan:pose(650,825)}:structuredClone(worldScenes.find(s=>s.id===`${islandId}.exterior`).spawn)}
])));
export const PHYSICAL_ROUTES = freeze(['harbor:market','market:workshop','workshop:archive','archive:observatory','observatory:beacon','beacon:protocol'].map(pair=>{
 const [from,to]=pair.split(':');return{id:`${from}-${to}`,fromPortId:`${from}.port`,toPortId:`${to}.port`};
}));
export const PHYSICAL_SCENES = freeze(Object.fromEntries(worldScenes.map(s=>[s.id,s])));
export const PHYSICAL_SCENE_IDS = freeze(worldScenes.map(s=>s.id));
export const physicalScene = id => PHYSICAL_SCENES[id] || null;
