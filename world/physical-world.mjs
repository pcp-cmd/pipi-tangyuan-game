import {createSaveStore} from '../integration/recovery-save-store.mjs';
import {PHYSICAL_SCENES,DEFAULT_PHYSICAL_SCENE_ID,PHYSICAL_PORTS,PHYSICAL_ROUTES,PHYSICAL_REGISTRY_VERSION} from './physical-scenes.mjs';
import {parsePhysicalState,upgradePhysicalState,freshPhysicalState,PHYSICAL_SAVE_KEY,LEGACY_PHYSICAL_STATE_SCHEMA,PHYSICAL_MIGRATION_PREFIX} from './physical-state.mjs';
import {distance,pointSafe,pairSafe,pairStepSafe,segmentSafe,findPath,findReachablePath,findPassingPath,pathLength,alongPath,clearOfFuturePath,remainingPath} from './physical-navigation.mjs';
export {parsePhysicalState,PHYSICAL_SAVE_KEY} from './physical-state.mjs';
const copy=value=>structuredClone(value);
const names=['pipi','tangyuan'];
const opposite=cat=>cat==='pipi'?'tangyuan':'pipi';
const point=p=>({x:p.x,y:p.y});
const messages={busy:'正在确认保存或切换，请稍候。','outside-walkable-floor':'那里不能走，请选择地面。','no-clear-route':'暂时没有安全的通路，请换一个落点。','companion-space':'伙伴需要更多让路空间，请换方向或换一只带队。','not-near':'请先走到门或工作台旁，再按 E 交互。','not-near-exit':'请先走到出口旁，再按 E 返回。','asset-unavailable':'场景图片未能载入，当前位置保持不变。','learning-save-blocked':'代码尚未确认保存，当前位置保持不变。','return-before-preview':'请先返回启航岛，再打开另一间候选房。','obstacle':'前方是墙壁或家具。','companion-route-unavailable':'伙伴暂时找不到安全通路。','no-return-anchor':'这里没有室内返回入口。','not-near-port':'请先走到码头旁，再选择航线。','invalid-route':'这条航线无法从当前码头出发。'};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
async function browserAsset(scene){
  const assets=[{src:scene.background,sha256:scene.assetSha256,naturalWidth:scene.width,naturalHeight:scene.height},...scene.hotspots.flatMap(h=>h.asset?[h.asset]:[])];
  await Promise.all(assets.map(async asset=>{
    const url=new URL(asset.src,import.meta.url).href;
    const response=await fetch(url);if(!response.ok)throw new Error('asset-unavailable');
    const bytes=await response.arrayBuffer();
    if(asset.sha256){const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==asset.sha256)throw new Error('asset-identity');}
    const image=new Image();image.src=url;await image.decode();
    if(image.naturalWidth!==asset.naturalWidth||image.naturalHeight!==asset.naturalHeight)throw new Error('asset-dimensions');
  }));
  return{width:scene.width,height:scene.height};
}

export function createPhysicalWorld({storage,locks,beforeTransition=async()=>true,travelGuard=()=>true,loadAsset=browserAsset,onChange=()=>{},requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id),now=()=>performance.now()}={}){
  if(!storage||typeof beforeTransition!=='function'||typeof travelGuard!=='function')throw new TypeError('PhysicalWorld requires a scoped storage and transition guards');
  let state=null,phase='loading',notice='',issue='',generation=0,disposed=false,frame=null,route=null,trail=null,lastTime=null,activeWrite=false,persistedState=null,migration=null,movementId=0,navigation=null,movingFlags={pipi:false,tangyuan:false};
  const pauses=new Set(),assets=new Map();
  const retainedStorage={
    getItem:key=>storage.getItem(key),
    keys:()=>typeof storage.keys==='function'?storage.keys():Array.from({length:storage.length},(_,i)=>storage.key(i)),
    setItem:(key,raw)=>{
      if(key===PHYSICAL_SAVE_KEY&&migration&&storage.getItem(key)===migration.raw){
        const previous=storage.getItem(migration.key);
        if(previous!==null&&previous!==migration.raw)throw Error('migration-archive-conflict');
        if(previous===null)storage.setItem(migration.key,migration.raw);
        if(storage.getItem(migration.key)!==migration.raw)throw Error('migration-archive-readback');
      }
      storage.setItem(key,raw);
    }
  };
  const store=createSaveStore({key:PHYSICAL_SAVE_KEY,parse:parsePhysicalState,storage:retainedStorage,locks,additionalRecoveryPrefixes:[PHYSICAL_MIGRATION_PREFIX]});
  function scene(){return PHYSICAL_SCENES[(state||freshPhysicalState()).physicalSceneId];}
  function view(){
    const value=state||freshPhysicalState(),spec=PHYSICAL_SCENES[value.physicalSceneId],save=store.snapshot();
    const poses=Object.fromEntries(names.map(cat=>[cat,{...value.cats[cat],moving:!!movingFlags[cat]}]));
    const nearby=spec.hotspots.filter(h=>distance(value.cats[value.leader],h.approach)<=h.radius).map(({id,label,kind})=>({id,label,kind}));
    return freeze({phase:disposed?'disposed':phase,physicalSceneId:value.physicalSceneId,revision:value.revision,scene:spec,poses,leader:value.leader,discovered:[...value.discovered],hotspots:spec.hotspots,nearby,returnAvailable:value.returnTrail.length>0,navigation:navigation?copy(navigation):null,save:{status:save.status,dirty:!!state&&JSON.stringify(state)!==persistedState,issue,raw:save.raw,pendingRaw:(phase==='recovery-required'||save.dirty)?store.pendingExport()?.raw||null:null},notice});
  }
  function emit(){try{onChange(view());}catch{}}
  function stopMotion(arrived=false,preserveArrival=false){if(navigation&&(!preserveArrival||navigation.status==='walking'))navigation={...navigation,status:arrived?'arrived':'cancelled'};if(frame!==null)cancelFrame(frame);frame=null;route=null;lastTime=null;movingFlags={pipi:false,tangyuan:false};if(phase==='walking')phase=pauses.size?'suspended':'ready';}
  function recover(reason){issue=reason;notice='位置尚未确认保存；当前场景保留，请先导出恢复记录。';phase='recovery-required';stopMotion();emit();return{status:'recovery-required',reason};}
  function blocked(reason,message){notice=message||messages[reason]||'暂时无法进行这个操作。';emit();return{status:'blocked',reason};}
  function available(){return !disposed&&state&&['ready','walking'].includes(phase)&&!pauses.size&&!activeWrite;}
  function epochCurrent(token){return !disposed&&token===generation&&!pauses.size;}
  async function preload(spec){
    if(!assets.has(spec.id))assets.set(spec.id,Promise.resolve().then(()=>loadAsset(spec)).then(size=>{if(size?.width!==spec.width||size?.height!==spec.height)throw new Error('asset-dimensions');return true;}).catch(error=>{assets.delete(spec.id);throw error;}));
    return assets.get(spec.id);
  }
  async function save(candidate,{initializing=false,token=null,publish=true,successNotice=''}={}){
    if(activeWrite)return blocked('save-busy');activeWrite=true;
    let result;try{result=await(initializing?store.initialize(candidate):store.save(candidate));}catch{result={status:'error'};}finally{activeWrite=false;}
    if(result.status!=='saved')return recover(result.status);
    if(disposed)return{status:'superseded'};
    // A synchronous storage write may have happened before cancellation. Do
    // not publish a late target; retain both the old view and durable candidate.
    if(token!==null&&!epochCurrent(token))return recover('superseded-after-write');
    if(publish)state=copy(candidate);persistedState=JSON.stringify(candidate);
    issue='';phase=pauses.size?'suspended':'ready';notice=successNotice;emit();return{status:'done',revision:state.revision};
  }
  const ready=(async()=>{
    const loaded=store.readLatest();
    if(!loaded.state&&loaded.status!=='idle')return recover(loaded.status);
    const candidate=loaded.state?upgradePhysicalState(loaded.state):freshPhysicalState();
    if(loaded.state&&(loaded.state.schema===LEGACY_PHYSICAL_STATE_SCHEMA||loaded.state.registryVersion!==PHYSICAL_REGISTRY_VERSION)){
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(loaded.raw)))].map(n=>n.toString(16).padStart(2,'0')).join('');
      migration={raw:loaded.raw,key:PHYSICAL_MIGRATION_PREFIX+hash};
    }
    try{await preload(PHYSICAL_SCENES[candidate.physicalSceneId]);}catch{return recover('asset-unavailable');}
    if(disposed)return{status:'superseded'};
    if(!loaded.state)return save(candidate,{initializing:true});
    state=copy(candidate);persistedState=JSON.stringify(candidate);phase=pauses.size?'suspended':'ready';emit();return{status:'done',revision:state.revision};
  })();
  async function flush(){
    if(disposed)return{status:'blocked',reason:'disposed'};
    if(!state||phase==='loading')return{status:'blocked',reason:'loading'};
    if(phase==='recovery-required')return{status:'recovery-required',reason:issue};
    if(phase==='transitioning'||activeWrite)return{status:'blocked',reason:'busy'};
    stopMotion(false,true);
    if(JSON.stringify(state)===persistedState){const observed=store.observe();if(observed.status!=='saved')return recover(observed.status);emit();return{status:'done',revision:state.revision};}
    return save(state,{successNotice:notice});
  }
  function markMovement(poses){
    if(!names.some(cat=>distance(poses[cat],state.cats[cat])>.00001))return false;
    state={...state,revision:state.revision+1,cats:Object.fromEntries(names.map(cat=>[cat,{...poses[cat],facing:Math.abs(poses[cat].x-state.cats[cat].x)>.001?(poses[cat].x>state.cats[cat].x?'right':'left'):state.cats[cat].facing}]))};
    return true;
  }
  function makeTrail(){
    const follower=opposite(state.leader),path=findPath(scene(),state.cats[follower],state.cats[state.leader]);
    return path?{points:path,cursor:0,leaderTravel:0}:null;
  }
  function advance(leaderPoint,dt,finish=false,futurePath=null){
    const spec=scene(),leader=state.leader,follower=opposite(leader),before=state.cats;
    if(!trail)trail=makeTrail();if(!trail)return false;
    const candidateTrail=trail.points.map(point);
    const moved=distance(candidateTrail.at(-1),leaderPoint);
    if(moved>.0001)candidateTrail.push(point(leaderPoint));
    const leaderTravel=trail.leaderTravel+moved;
    const goal=Math.max(0,pathLength(candidateTrail)-spec.navigation.followGap);
    let nextCursor=leaderTravel>=spec.navigation.followGap||finish?Math.min(goal,trail.cursor+spec.navigation.speed*1.15*dt):trail.cursor;
    // Stop at a trail corner instead of cutting across its two segments.
    let boundary=0;for(let i=1;i<candidateTrail.length;i++){boundary+=distance(candidateTrail[i-1],candidateTrail[i]);if(boundary>trail.cursor+1e-7){nextCursor=Math.min(nextCursor,boundary);break;}}
    let nextFollower=alongPath(candidateTrail,nextCursor);
    // Waiting is safe because the leader path was planned around this cat.
    // Do not let following consume the leader's still-needed passing space.
    if(futurePath&&!clearOfFuturePath(before[follower],nextFollower,futurePath,2*spec.navigation.radius+6)){
      nextFollower=point(before[follower]);nextCursor=trail.cursor;
    }
    let after={...before,[leader]:{...before[leader],...leaderPoint},[follower]:{...before[follower],...nextFollower}},cursor=nextCursor;
    if(!pairStepSafe(spec,before,after)){
      after={...before,[leader]:{...before[leader],...leaderPoint}};cursor=trail.cursor;
      if(!pairStepSafe(spec,before,after))return false;
    }
    trail.points=candidateTrail;trail.cursor=cursor;trail.leaderTravel=leaderTravel;
    while(trail.points.length>2&&trail.cursor>distance(trail.points[0],trail.points[1])){trail.cursor-=distance(trail.points[0],trail.points[1]);trail.points.shift();}
    const moving=Object.fromEntries(names.map(cat=>[cat,distance(before[cat],after[cat])>.00001]));
    markMovement(after);movingFlags=moving;return true;
  }
  function queueFrame(){
    const expected=route,token=generation;
    frame=requestFrame(time=>{if(disposed||route!==expected||generation!==token||pauses.size)return;tick(time);});
  }
  function tick(time){
    frame=null;if(disposed||phase!=='walking'||!route||pauses.size)return;
    let remaining=Math.max(0,Math.min(1,(time-(lastTime??time-16))/1000));lastTime=time;
    const expected=route,token=generation;
    while(remaining>1e-7&&route===expected&&phase==='walking'&&!disposed&&!pauses.size&&generation===token){
      let cornerTime=Infinity,length=0;
      for(let i=1;i<route.path.length;i++){
        length+=distance(route.path[i-1],route.path[i]);
        if(length>route.travel+1e-7){cornerTime=(length-route.travel)/scene().navigation.speed;break;}
      }
      const dt=Math.min(.05,remaining,cornerTime);stepFrame(dt);remaining-=dt;
    }
    if(route===expected&&phase==='walking'&&!disposed&&!pauses.size&&generation===token&&frame===null)queueFrame();
  }
  function stepFrame(dt){
    const expected=route;
    if(route.kind==='yield'){
      const travel=Math.min(route.length,route.travel+scene().navigation.speed*dt),next=alongPath(route.path,travel);
      const after={...state.cats,[route.cat]:{...state.cats[route.cat],...next}};
      if(!pairStepSafe(scene(),state.cats,after)){stopMotion();notice='伙伴暂时无法让路，请换方向。';emit();void flush();return;}
      movingFlags=Object.fromEntries(names.map(cat=>[cat,distance(state.cats[cat],after[cat])>.00001]));markMovement(after);route.travel=travel;emit();
      if(route!==expected||phase!=='walking'||disposed||pauses.size)return;
      if(travel>=route.length-.001){const {target,requested,snapped}=route,id=navigation.movementId;stopMotion();if(walk(target,requested,snapped,id).status!=='started')void flush();return;}
      return;
    }
    const travel=Math.min(route.length,route.travel+scene().navigation.speed*dt),target=alongPath(route.path,travel);
    if(!advance(target,dt,travel>=route.length-.001,remainingPath(route.path,travel))){stopMotion();notice='两猫前方空间不足，请换方向或换一只带队。';emit();void flush();return;}
    route.travel=travel;emit();
    if(route!==expected||phase!=='walking'||disposed||pauses.size)return;
    if(travel>=route.length-.001){
      const together=pathLength(trail.points)-scene().navigation.followGap-trail.cursor<.1;
      if(together||names.every(cat=>!movingFlags[cat])){stopMotion(true);notice=together?'':'已到达，伙伴在安全位置等候。';emit();void flush();return;}
    }
  }
  function walk(target,requested=target,snapped=false,resumeId=null){
    if(!available())return blocked('busy');
    if(!pointSafe(scene(),target))return blocked('outside-walkable-floor');
    const leader=state.leader,follower=opposite(leader),r=scene().navigation.radius+6,p=state.cats[follower];
    const avoid=[{...point(p),radius:r}];
    let path=findPath(scene(),state.cats[leader],target,avoid);
    if(!path){
      const base=findPath(scene(),state.cats[leader],target);if(!base)return blocked('no-clear-route');
      const yielding=findPassingPath(scene(),p,state.cats[leader],base,2*scene().navigation.radius+6);
      if(yielding){
        stopMotion();trail=null;route={kind:'yield',cat:follower,path:yielding,length:pathLength(yielding),travel:0,target:point(target),requested:point(requested),snapped};
        navigation={movementId:resumeId??++movementId,target:point(target),requested:point(requested),snapped,status:'walking'};
        phase='walking';notice='伙伴正在让出通路…';lastTime=null;emit();queueFrame();return{...copy(navigation),status:'started',revision:state.revision};
      }
      return blocked('companion-space');
    }
    stopMotion();trail=makeTrail();if(!trail)return blocked('companion-route-unavailable');
    route={path,length:pathLength(path),travel:0,moving:{pipi:false,tangyuan:false}};
    navigation={movementId:resumeId??++movementId,target:point(target),requested:point(requested),snapped,status:'walking'};
    phase='walking';notice='';lastTime=null;emit();queueFrame();return{...copy(navigation),status:'started',revision:state.revision};
  }
  async function transition(targetId,{returnTrail,destination,leader=state.leader,commitGuard=null}){
    if(!available())return blocked('busy');
    const target=PHYSICAL_SCENES[targetId];if(!target)return blocked('unknown-scene');
    stopMotion();const token=++generation;phase='transitioning';notice='正在确认入口与保存…';emit();
    const source=copy(state);destination??=target.spawn;
    if(!pairSafe(target,destination)){phase='ready';return blocked('unsafe-arrival');}
    try{await preload(target);}catch{if(!epochCurrent(token))return{status:'superseded'};phase='ready';return blocked('asset-unavailable');}
    if(!epochCurrent(token))return{status:'superseded'};
    let guard;try{guard=await beforeTransition();}catch{guard=false;}
    if(!epochCurrent(token))return{status:'superseded'};
    if(!(guard===true||guard?.ok===true)){phase='ready';return blocked(guard?.reason||'learning-save-blocked');}
    if(commitGuard){
      let allowed;try{allowed=await commitGuard();}catch{allowed={available:false,reason:'暂时无法核对航线，请稍后再试。'};}
      if(!epochCurrent(token))return{status:'superseded'};
      if(!(allowed===true||allowed?.available===true)){phase='ready';return blocked('learning-milestone',allowed?.reason);}
    }
    const candidate={...source,revision:source.revision+1,physicalSceneId:targetId,cats:copy(destination),leader,returnTrail:copy(returnTrail),discovered:[...new Set([...source.discovered,targetId])]};
    try{parsePhysicalState(JSON.stringify(candidate));}catch{phase='ready';return blocked('invalid-transition');}
    const outcome=await save(candidate,{token});if(outcome.status==='done')trail=null;return outcome;
  }
  async function act(intent){
    if(!intent||typeof intent.kind!=='string')return blocked('invalid-action');
    if(intent.kind==='stop'){stopMotion();emit();return state&&['ready','suspended'].includes(phase)?flush():{status:'done',revision:state?.revision??0};}
    if(!(intent.kind==='leader'&&state&&phase==='suspended'&&!activeWrite&&!disposed)&&!available())return blocked('busy');
    if(intent.kind==='walk')return walk(intent.point);
    if(intent.kind==='groundWalk'){
      const plan=findReachablePath(scene(),state.cats[state.leader],intent.point);
      if(!plan||plan.snapped&&distance(plan.target,plan.requested)>(scene().navigation.maxGroundSnap??96))return blocked('outside-walkable-floor');
      return walk(plan.target,plan.requested,plan.snapped);
    }
    if(intent.kind==='approach'){
      const hotspot=scene().hotspots.find(h=>h.id===intent.hotspotId);return hotspot?walk(hotspot.approach):blocked('unknown-hotspot');
    }
    if(intent.kind==='steer'){
      if(![intent.dx,intent.dy,intent.dt].every(Number.isFinite)||intent.dt<=0||intent.dt>.1)return blocked('invalid-steer');
      stopMotion();const magnitude=Math.hypot(intent.dx,intent.dy);if(!magnitude)return{status:'done',revision:state.revision};
      const lead=state.cats[state.leader],length=scene().navigation.speed*intent.dt;
      const target={x:lead.x+intent.dx/magnitude*length,y:lead.y+intent.dy/magnitude*length};
      if(!segmentSafe(scene(),lead,target))return blocked('obstacle');
      if(!advance(target,intent.dt))return blocked('companion-space');
      notice='';emit();return{status:'done',revision:state.revision};
    }
    if(intent.kind==='leader'){
      if(!names.includes(intent.cat))return blocked('invalid-cat');
      stopMotion();if(state.leader!==intent.cat){state={...state,leader:intent.cat,revision:state.revision+1};trail=null;}return flush();
    }
    if(intent.kind==='preview'){
      if(state.physicalSceneId!==DEFAULT_PHYSICAL_SCENE_ID)return blocked('return-before-preview');
      const target=PHYSICAL_SCENES[intent.sceneId];if(!target?.id.startsWith('candidate.')||target.pairedExterior)return blocked('not-a-candidate-preview');
      return transition(target.id,{returnTrail:[{kind:'preview',doorId:`preview:${target.id}`,fromSceneId:state.physicalSceneId,cats:copy(state.cats),leader:state.leader}]});
    }
    if(intent.kind==='return'){
      const anchor=state.returnTrail.at(-1);if(!anchor)return blocked('no-return-anchor');
      const enteredDoor=PHYSICAL_SCENES[anchor.fromSceneId].doors.find(h=>h.id===anchor.doorId);
      const door=scene().doors.find(h=>h.return&&(anchor.kind==='preview'||h.id===enteredDoor?.pairedDoorId));
      if(!door||distance(state.cats[state.leader],door.approach)>door.radius)return blocked('not-near-exit');
      return transition(anchor.fromSceneId,{returnTrail:state.returnTrail.slice(0,-1),destination:anchor.cats});
    }
    if(intent.kind==='travel'){
      const route=PHYSICAL_ROUTES.find(r=>r.id===intent.routeId);if(!route)return blocked('invalid-route');
      const ports=[PHYSICAL_PORTS[route.fromPortId],PHYSICAL_PORTS[route.toPortId]],from=ports.find(p=>p?.sceneId===state.physicalSceneId),to=ports.find(p=>p&&p!==from);
      if(!from||!to||state.returnTrail.length)return blocked('invalid-route');
      const port=scene().hotspots.find(h=>h.id===from.hotspotId&&h.kind==='port');
      if(!port||distance(state.cats[state.leader],port.approach)>port.radius)return blocked('not-near-port');
      const origin=state,token=generation;
      const check=()=>travelGuard({route,from,to,physical:view()});
      let allowed;try{allowed=await check();}catch{allowed={available:false,reason:'暂时无法核对航线，请稍后再试。'};}
      if(state!==origin||generation!==token||!available())return{status:'superseded'};
      if(!(allowed===true||allowed?.available===true))return blocked('learning-milestone',allowed?.reason);
      return transition(to.sceneId,{returnTrail:[],destination:to.arrival,commitGuard:check});
    }
    if(intent.kind==='interact'){
      const h=scene().hotspots.find(h=>h.id===intent.hotspotId);if(!h)return blocked('unknown-hotspot');
      if(distance(state.cats[state.leader],h.approach)>h.radius)return blocked('not-near');
      stopMotion();
      if(h.kind==='door')return h.return?act({kind:'return'}):transition(h.to,{returnTrail:[...state.returnTrail,{kind:'door',doorId:h.id,fromSceneId:state.physicalSceneId,cats:copy(state.cats),leader:state.leader}],destination:h.arrival});
      const saved=await flush();if(saved.status!=='done')return saved;
      if(h.kind==='port')return{status:'port',portId:h.portId,physicalSceneId:state.physicalSceneId};
      return h.kind==='workbench'?{status:'workbench',workbenchId:h.workbenchId,physicalSceneId:state.physicalSceneId}:{status:'inspect',hotspotId:h.id};
    }
    return blocked('unknown-action');
  }
  function suspend(reason='paused'){
    const token={reason};pauses.add(token);generation++;stopMotion();if(!disposed&&phase!=='recovery-required'&&phase!=='loading')phase='suspended';emit();
    let released=false;return()=>{if(released)return;released=true;pauses.delete(token);if(!pauses.size&&phase==='suspended')phase='ready';emit();};
  }
  function dispose(){if(disposed)return;disposed=true;generation++;stopMotion();phase='disposed';emit();}
  return Object.freeze({ready,view,act,flush,suspend,dispose});
}
