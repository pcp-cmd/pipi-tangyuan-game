import {placeholderOccluders} from './physical-placeholder-geometry.mjs';
const rect = (l,t,r,b) => [[l,t],[r,t],[r,b],[l,b]];
const pose = (x,y,facing='right') => ({x,y,facing});
const solid = (id,kind,bounds,label='') => ({id,kind,bounds,label});
const hotspot = (id,label,kind,x,y,ax,ay,extra={}) => ({id,label,kind,x,y,approach:{x:ax,y:ay},radius:38,...extra});
const entry = (building,label,to,x,y,ax=x,ay=y+70) => hotspot(`${building}.front-door`,label,'door',x,y,ax,ay,{to,buildingId:building,pairedDoorId:`${building}.exit`});
const bench = (building,label,islandId,x,y,ax=x,ay=y+85) => hotspot(`${building}.bench`,label,'workbench',x,y,ax,ay,{workbenchId:`${building}.bench`,curriculumIslandId:islandId});
const back = (building,parent,x=200,y=820,ax=260,ay=850) => hotspot(`${building}.exit`,'返回来路','door',x,y,ax,ay,{return:true,to:parent,buildingId:building,pairedDoorId:`${building}.front-door`});
const pier = islandId => hotspot(`${islandId}.port`,'船埠 · 选择航线','port',800,920,800,840,{portId:`${islandId}.port`});
const palette = (land,roof,accent,water='#477b87') => ({land,roof,accent,water});
const palettes = {
 harbor:palette('#8d9776','#647b86','#d5b77c'),market:palette('#728a55','#b66f4f','#d8b866'),workshop:palette('#8a8e72','#6a8195','#c59a56'),archive:palette('#7f9d77','#6e8583','#d4bd80'),
 observatory:palette('#7c956c','#75858f','#d5b979'),beacon:palette('#738574','#537b83','#d6b47c','#456b7b'),protocol:palette('#779174','#75858c','#c4a66e','#527783')
};
function layout(id,title,islandId,kind,land,solids,waters,hotspots,extra={}) {
 const isRoom=kind==='interior',width=isRoom?1536:1600,height=isRoom?1024:1000;
 const spawn=isRoom?{pipi:pose(450,780),tangyuan:pose(340,780)}:{pipi:pose(800,840),tangyuan:pose(900,840)};
 const zones=[land,...(kind==='island'?[rect(680,800,960,975)]:[])];
 const waterBlocks=waters.flatMap(w=>w.bridgeY?[[w.bounds[0],w.bounds[1],w.bounds[2],w.bridgeY[0]],[w.bounds[0],w.bridgeY[1],w.bounds[2],w.bounds[3]]]:[w.bounds]);
 return {id,title:`${title} · 工程占位`,islandId,kind,parentSceneId:null,pairedExterior:null,artStatus:'placeholder',candidate:false,placeholder:true,width,height,
  background:`assets/placeholders/${id}.svg`,missing:['final-art','visual-browser-review'],catScale:.58,
  spawn,hotspots,doors:hotspots.filter(h=>h.kind==='door'),occluders:placeholderOccluders(solids),
  navigation:{radius:20,speed:210,followGap:90,gridStep:20,zones,blocks:[...solids.map(s=>s.bounds),...waterBlocks],waypoints:[...Object.values(spawn),...hotspots.map(h=>h.approach)]},
  placeholderLayout:{land,solids,waters,palette:palettes[islandId]},...extra};
}
const layouts = [
 layout('market.exterior','集市岛','market','island',[[160,250],[1220,180],[1440,460],[1350,880],[240,900],[100,660]],
  [solid('warehouse','building',[1080,280,1320,430],'仓库'),solid('windmill','windmill',[220,470,400,650],'风车齿轮室'),solid('stall','stall',[1000,660,1190,740],'风车集市'),solid('fence','fence',[1070,550,1330,575])],
  [{bounds:[520,400,870,690],bridgeY:[510,620]}],
  [pier('market'),entry('market.warehouse','进入集市仓库','market.warehouse.interior',1200,430),entry('market.forest','前往枝径森林','market.forest.exterior',370,300,370,380),{...entry('market.windmill','进入风车齿轮室','market.windmill.interior',310,650,310,730),id:'market.windmill'}]),
 layout('workshop.exterior','工匠岛','workshop','island',[[220,240],[1030,170],[1440,430],[1390,850],[800,920],[200,790]],
  [solid('clockworks','building',[970,300,1250,480],'钟表工坊'),solid('shed','building',[330,340,580,510],'材料装配棚'),solid('crates','crates',[480,650,680,760]),solid('fence','fence',[1120,660,1340,685])],
  [{bounds:[730,350,870,640],bridgeY:[460,570]}],
  [pier('workshop'),entry('workshop.clockworks','进入钟表工坊','workshop.clockworks.interior',1110,480),entry('workshop.material-shed','进入材料装配棚','workshop.material-shed.interior',455,510,455,580),hotspot('workshop.yard','装配院','inspect',1040,650,1020,720)]),
 layout('archive.exterior','档案岛','archive','island',[[260,200],[1170,230],[1460,500],[1280,900],[350,890],[130,510]],
  [solid('records','building',[340,300,600,450],'邮局 / 星图档案馆'),solid('garden-sign','fence',[1140,350,1320,375]),solid('fence','fence',[360,650,560,675])],
  [{bounds:[700,350,1010,700],bridgeY:[490,610]}],
  [pier('archive'),entry('archive.records','进入星图档案馆','archive.records.interior',470,450),entry('archive.garden','前往潮汐花园','archive.garden.exterior',1220,420,1220,510)]),
 layout('observatory.exterior','观测岛','observatory','island',[[180,390],[580,180],[1220,250],[1430,700],[1090,900],[300,890]],
  [solid('waterworks','waterworks',[1040,420,1300,600],'水轮试航场'),solid('waterwheel','wheel',[950,400,1040,530]),solid('rock','rock',[330,570,490,700]),solid('fence','fence',[440,285,600,310])],
  [{bounds:[720,420,900,720],bridgeY:[540,650]}],
  [pier('observatory'),entry('observatory.waterworks','进入水工房','observatory.waterworks.interior',1170,600),entry('observatory.summit','沿山路登高','observatory.summit.exterior',500,330,500,400)]),
 layout('beacon.exterior','独立灯塔岛','beacon','island',[[400,240],[990,170],[1340,420],[1270,820],[650,920],[260,650]],
  [solid('dispatch-tower','tower',[650,290,940,520],'航路调度塔'),solid('rock','rock',[1070,500,1190,660]),solid('fence','fence',[660,700,970,725])],
  [{bounds:[410,570,590,720]}],
  [pier('beacon'),entry('beacon.dispatch-tower','进入航路调度塔','beacon.dispatch-tower.interior',795,520),hotspot('beacon.signal','航路信号台','inspect',1110,690,1100,740)]),
 layout('protocol.exterior','雪峰远航营地','protocol','island',[[250,290],[700,160],[1240,300],[1430,730],[1080,900],[330,880]],
  [solid('protocol-workshop','dome',[940,410,1240,580],'协议工坊'),solid('mountain','mountain',[430,250,700,420]),solid('camp','tent',[350,560,570,690],'远航营地'),solid('fence','fence',[900,730,1220,755])],[],
  [pier('protocol'),entry('protocol.workshop','进入协议工坊','protocol.workshop.interior',1090,580),hotspot('protocol.camp','雪峰露天营地','inspect',460,540,610,660)]),
 layout('market.forest.exterior','枝径森林','market','exterior',[[170,200],[1300,180],[1450,720],[1150,900],[280,880],[100,500]],
  [solid('tree-west','trees',[250,280,450,430]),solid('tree-north','trees',[1000,240,1220,360]),solid('tree-south','trees',[320,650,450,770]),solid('bench','bench',[1060,410,1200,450],'林间工作台'),solid('fence','fence',[1080,660,1280,685])],
  [{bounds:[600,300,800,650],bridgeY:[450,570]}],
  [back('market.forest','market.exterior',800,890,800,820),bench('market.forest','林间路径工作台','market',1130,430,1130,510)],{parentSceneId:'market.exterior',pairedExterior:'market.exterior'}),
 layout('archive.garden.exterior','潮汐花园','archive','exterior',rect(150,180,1450,900),
  [solid('greenhouse','greenhouse',[1000,230,1300,420],'采集温室'),solid('bench','bench',[250,360,350,430],'花园采集台'),solid('beds','beds',[970,620,1230,730]),solid('fence','fence',[210,650,360,675])],
  [{bounds:[430,300,800,650],bridgeY:[430,550]}],
  [back('archive.garden','archive.exterior',800,890,800,820),entry('archive.greenhouse','进入采集温室','archive.greenhouse.interior',1150,420),bench('archive.garden','潮汐采集工作台','archive',300,400,300,510)],{parentSceneId:'archive.exterior',pairedExterior:'archive.exterior'}),
 layout('observatory.summit.exterior','云顶高地','observatory','exterior',[[160,700],[400,270],[1150,200],[1450,650],[1230,900],[400,920]],
  [solid('summit','dome',[640,250,970,490],'云顶观测台'),solid('telescope','telescope',[1040,530,1200,620],'露天观测台'),solid('boulders','rock',[300,550,450,680]),solid('fence','fence',[1100,740,1300,765])],[],
  [back('observatory.summit','observatory.exterior',800,890,800,820),entry('observatory.summit-observatory','进入云顶观测室','observatory.summit.interior',805,490),bench('observatory.summit','露天观测工作台','observatory',1120,580,1120,680)],{parentSceneId:'observatory.exterior',pairedExterior:'observatory.exterior'}),
 layout('market.warehouse.interior','集市仓库','market','interior',rect(180,280,1350,920),
  [solid('shelves','shelves',[200,300,420,600]),solid('stock','crates',[620,350,820,500]),solid('crate','crates',[800,680,1000,820]),solid('bench','bench',[920,300,1250,470],'仓库工作台')],[],
  [back('market.warehouse','market.exterior'),bench('market.warehouse','仓库整理工作台','market',1080,400,1080,540)],{parentSceneId:'market.exterior',pairedExterior:'market.exterior'}),
 layout('market.windmill.interior','风车齿轮室','market','interior',rect(180,280,1350,920),
  [solid('gear-wheel','wheel',[620,340,850,570],'风车齿轮'),solid('grain-crates','crates',[230,330,430,520]),solid('rhythm-bench','bench',[950,340,1250,480],'循环节拍台')],[],
  [{...back('market.windmill','market.exterior'),pairedDoorId:'market.windmill'},bench('market.windmill','齿轮与循环节拍工作台','market',1100,410,1100,560)],{parentSceneId:'market.exterior',pairedExterior:'market.exterior'}),
 layout('workshop.material-shed.interior','材料装配棚','workshop','interior',rect(180,280,1350,920),
  [solid('parts-shelves','shelves',[230,310,440,580],'分类材料架'),solid('parts-crates','crates',[630,350,810,490]),solid('assembly-bench','bench',[950,340,1250,480],'函数装配台'),solid('finished-crates','crates',[930,720,1160,840])],[],
  [back('workshop.material-shed','workshop.exterior'),bench('workshop.material-shed','材料与函数装配工作台','workshop',1100,410,1100,560)],{parentSceneId:'workshop.exterior',pairedExterior:'workshop.exterior'}),
 layout('archive.records.interior','星图档案馆','archive','interior',rect(180,280,1350,920),
  [solid('shelves','shelves',[200,300,420,600]),solid('table','records',[630,600,870,760]),solid('shelf-east','shelves',[1200,610,1320,850]),solid('bench','bench',[920,300,1250,470],'档案检索台')],[],
  [back('archive.records','archive.exterior'),bench('archive.records','档案检索工作台','archive',1080,400,1080,540)],{parentSceneId:'archive.exterior',pairedExterior:'archive.exterior'}),
 layout('archive.greenhouse.interior','采集温室','archive','interior',rect(180,280,1350,920),
  [solid('beds-west','beds',[520,350,740,530]),solid('beds-south','beds',[780,650,990,810]),solid('bench','bench',[920,300,1250,470],'温室样本台')],[],
  [back('archive.greenhouse','archive.garden.exterior'),bench('archive.greenhouse','温室样本工作台','archive',1080,400,1080,540)],{parentSceneId:'archive.garden.exterior',pairedExterior:'archive.garden.exterior'}),
 layout('harbor.test-lighthouse.observation-room','测试灯塔观景室','harbor','interior',rect(180,280,1350,920),
  [solid('viewing-lens','telescope',[640,340,900,570],'观景镜'),solid('test-console','bench',[990,340,1250,475],'测试控制台'),solid('view-chart','records',[270,350,450,470],'航路观察图')],[],
  [hotspot('harbor.test-lighthouse.stairs-down','下楼回测试机房','door',200,820,260,850,{return:true,to:'harbor.test-lighthouse.interior',buildingId:'harbor.test-lighthouse',pairedDoorId:'harbor.test-lighthouse.stairs'}),
   bench('harbor.test-lighthouse.observation-room','测试验证工作台','harbor',1120,410,1120,550),
   hotspot('harbor.test-lighthouse.observation-room.chart','查看七岛航路','inspect',360,410,360,550,{uiAction:'map'})],{parentSceneId:'harbor.test-lighthouse.interior',pairedExterior:'harbor.test-lighthouse.interior',entranceKind:'stairs'}),
 layout('beacon.dispatch-tower.lantern-room','航路灯室','beacon','interior',rect(180,280,1350,920),
  [solid('beacon-lens','lantern',[620,330,890,610],'航路灯'),solid('chart-table','records',[300,350,500,450],'七岛航路观察台'),solid('log-shelf','shelves',[1100,350,1290,610])],[],
  [hotspot('beacon.dispatch-tower.stairs-down','下楼回调度室','door',200,820,260,850,{return:true,to:'beacon.dispatch-tower.interior',buildingId:'beacon.dispatch-tower',pairedDoorId:'beacon.dispatch-tower.stairs-up'}),
   bench('beacon.dispatch-tower.lantern-room','航灯调度工作台','beacon',755,500,755,690),
   hotspot('beacon.dispatch-tower.lantern-room.chart','查看七岛航路','inspect',400,400,400,530,{uiAction:'map'})],{parentSceneId:'beacon.dispatch-tower.interior',pairedExterior:'beacon.dispatch-tower.interior',entranceKind:'stairs'}),
 layout('observatory.summit.interior','云顶观测室','observatory','interior',rect(180,280,1350,920),
  [solid('telescope','telescope',[630,330,900,560]),solid('charts','records',[250,300,430,500]),solid('bench','bench',[990,320,1250,470],'星图观测台')],[],
  [back('observatory.summit-observatory','observatory.summit.exterior'),bench('observatory.summit-observatory','星图观测工作台','observatory',1120,400,1120,540)],{parentSceneId:'observatory.summit.exterior',pairedExterior:'observatory.summit.exterior'})
];
for(const scene of layouts) for(const h of scene.hotspots) if(h.kind==='door')h.fromSceneId=scene.id;
export const WORLD_PLACEHOLDER_LAYOUTS = layouts;
export const CANONICAL_ROOM_LINKS = [
 {legacyId:'candidate.workshop.clockworks',id:'workshop.clockworks.interior',buildingId:'workshop.clockworks',parentSceneId:'workshop.exterior'},
 {legacyId:'candidate.observatory.waterworks',id:'observatory.waterworks.interior',buildingId:'observatory.waterworks',parentSceneId:'observatory.exterior'},
 {legacyId:'candidate.beacon.dispatch-tower',id:'beacon.dispatch-tower.interior',buildingId:'beacon.dispatch-tower',parentSceneId:'beacon.exterior'},
 {legacyId:'candidate.protocol.workshop',id:'protocol.workshop.interior',buildingId:'protocol.workshop',parentSceneId:'protocol.exterior'}
];
export function expandPhysicalScenes(legacyScenes) {
 const scenes=structuredClone(legacyScenes);
 for(const scene of scenes){
  scene.artStatus=scene.candidate?'candidate':'existing';scene.placeholder=false;
  scene.kind=scene.id==='harbor.exterior'?'island':scene.id.startsWith('candidate.')?'preview':'interior';
  scene.islandId=scene.id.startsWith('candidate.')?scene.id.split('.')[1]:'harbor';
  scene.parentSceneId=scene.pairedExterior;scene.legacyPreview=scene.kind==='preview';
  if(scene.kind==='island')scene.missing=[];
  if(scene.id==='harbor.test-lighthouse.interior'){
   Object.assign(scene.hotspots.find(h=>h.id==='harbor.test-lighthouse.stairs'),{kind:'door',label:'登上测试灯塔观景室',to:'harbor.test-lighthouse.observation-room',buildingId:'harbor.test-lighthouse',pairedDoorId:'harbor.test-lighthouse.stairs-down'});
   scene.doors=scene.hotspots.filter(h=>h.kind==='door');
  }
  for(const h of scene.hotspots)if(h.kind==='door'){
   h.fromSceneId=scene.id;h.buildingId??=h.id.replace(/\.(front-door|exit)$/,'');
   if(h.return&&scene.parentSceneId){h.to=scene.parentSceneId;h.pairedDoorId=`${h.buildingId}.front-door`;}
  }
 }
 const harbor=scenes.find(s=>s.id==='harbor.exterior');
 Object.assign(harbor.hotspots.find(h=>h.id==='harbor.pier'),{kind:'port',portId:'harbor.port',label:'启程码头 · 选择航线'});
 for(const link of CANONICAL_ROOM_LINKS){
  const source=scenes.find(s=>s.id===link.legacyId),room=structuredClone(source);
  Object.assign(room,{id:link.id,title:source.title.replace('候选试走','室内候选'),kind:'interior',parentSceneId:link.parentSceneId,pairedExterior:link.parentSceneId,legacyPreview:false});
  room.hotspots=room.hotspots.map(h=>({...h,id:`${link.buildingId}.${h.id.split('.').at(-1)}`,fromSceneId:link.id,...(h.return?{to:link.parentSceneId,buildingId:link.buildingId,pairedDoorId:`${link.buildingId}.front-door`}:{}),...(h.kind==='workbench'?{workbenchId:`${link.buildingId}.bench`}:{})}));
  if(room.id==='beacon.dispatch-tower.interior'){Object.assign(room.hotspots.find(h=>h.id==='beacon.dispatch-tower.map'),{label:'查看七岛航路',uiAction:'map'});room.hotspots.push(hotspot('beacon.dispatch-tower.stairs-up','登上航路灯室','door',1100,480,1080,620,{to:'beacon.dispatch-tower.lantern-room',buildingId:'beacon.dispatch-tower',pairedDoorId:'beacon.dispatch-tower.stairs-down',fromSceneId:room.id}));}
  room.doors=room.hotspots.filter(h=>h.kind==='door');scenes.push(room);
 }
 scenes.push(...structuredClone(WORLD_PLACEHOLDER_LAYOUTS));
 for(const scene of scenes){
  for(const h of scene.hotspots){
   const building=scene.placeholderLayout?.solids.find(s=>['building','waterworks','tower','dome','greenhouse','windmill'].includes(s.kind)&&h.kind==='door'&&!h.return&&h.x>=s.bounds[0]&&h.x<=s.bounds[2]&&Math.abs(h.y-s.bounds[3])<20);
   h.hitbox=h.id==='harbor.test-lighthouse.stairs'?{x:1080,y:140,w:220,h:550}:scene.id==='harbor.exterior'&&h.kind==='port'?{x:8,y:650,w:652,h:280}:scene.placeholder&&scene.kind==='island'&&h.kind==='port'?{x:670,y:800,w:490,h:175}:building?{x:building.bounds[0]-22,y:building.bounds[1]-110,w:building.bounds[2]-building.bounds[0]+44,h:building.bounds[3]-building.bounds[1]+125}:{x:h.x-40,y:h.y-48,w:80,h:96};
  }
  for(const door of scene.doors)if(!door.return){const target=scenes.find(s=>s.id===door.to);if(target)door.arrival=structuredClone(target.spawn);}
 }
 return scenes;
}
