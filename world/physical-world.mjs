import { journeyTimings } from './interaction-timing.mjs';
import {loadSceneAssets} from './generated/asset-loader.mjs';
import {createPhysicalStartup} from './generated/startup-physical.mjs';
import {createSaveStore} from '../integration/recovery-save-store.mjs';
import {PHYSICAL_SCENES,DEFAULT_PHYSICAL_SCENE_ID,PHYSICAL_PORTS,PHYSICAL_ROUTES,PHYSICAL_REGISTRY_VERSION} from './physical-scenes.mjs';
import {parsePhysicalState,upgradePhysicalState,freshPhysicalState,PHYSICAL_SAVE_KEY,LEGACY_PHYSICAL_STATE_SCHEMA,PHYSICAL_MIGRATION_PREFIX} from './physical-state.mjs';
import {distance,pointSafe,pairSafe,pairStepSafe,segmentSafe,findPath,findReachablePath,findPassingPath,findCompanionPassage,companionClearance,pathLength,alongPath,clearOfFuturePath,remainingPath} from './physical-navigation.mjs';
export {parsePhysicalState,PHYSICAL_SAVE_KEY} from './physical-state.mjs';
const copy=value=>structuredClone(value);
const names=['pipi','tangyuan'];
const opposite=cat=>cat==='pipi'?'tangyuan':'pipi';
const point=p=>({x:p.x,y:p.y});
const followGap=scene=>Math.max(scene.navigation.followGap,companionClearance(scene));
const messages={busy:'正在确认保存或切换，请稍候。','outside-walkable-floor':'那里不能走，请选择地面。','no-clear-route':'暂时没有安全的通路，请换一个落点。','companion-space':'伙伴需要更多让路空间，请换方向或换一只带队。','not-near':'请先走到门或工作台旁，再按 E 交互。','not-near-exit':'请先走到出口旁，再按 E 返回。','asset-unavailable':'场景图片未能载入，当前位置保持不变。','learning-save-blocked':'代码尚未确认保存，当前位置保持不变。','return-before-preview':'请先返回启航岛，再打开另一间候选房。','obstacle':'前方是墙壁或家具。','companion-route-unavailable':'伙伴暂时找不到安全通路。','no-return-anchor':'这里没有室内返回入口。','not-near-port':'请先走到码头旁，再选择航线。','invalid-route':'这条航线无法从当前码头出发。'};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
function browserAsset(scene,{signal}={}){return loadSceneAssets(scene,import.meta.url,signal);}

export function createPhysicalWorld({storage,locks,beforeTransition=async()=>true,travelGuard=()=>true,loadAsset=browserAsset,onChange=()=>{},requestFrame=callback=>requestAnimationFrame(callback),cancelFrame=id=>cancelAnimationFrame(id),now=()=>performance.now()}={}){
  if(!storage||typeof beforeTransition!=='function'||typeof travelGuard!=='function')throw new TypeError('PhysicalWorld requires a scoped storage and transition guards');
  let pendingState=null,state=null,phase='loading',notice='',issue='',generation=0,disposed=false,frame=null,route=null,trail=null,lastTime=null,activeWrite=false,persistedState=null,migration=null,movementId=0,navigation=null,movingFlags={pipi:false,tangyuan:false};
  let assetFailure=null,retryTransition=null;
  const pauses=new Set(),assets=new Map(),assetController=new AbortController();
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
    const value=state||pendingState||freshPhysicalState(),spec=PHYSICAL_SCENES[value.physicalSceneId],save=store.snapshot();
    const poses=Object.fromEntries(names.map(cat=>[cat,{...value.cats[cat],moving:!!movingFlags[cat]}]));
    const leader=value.cats[value.leader];
    const nearby=spec.hotspots.filter(h=>distance(leader,h.approach)<=h.radius)
      .sort((a,b)=>distance(leader,a.approach)-distance(leader,b.approach)).map(({id,label,kind})=>({id,label,kind}));
    return freeze({phase:disposed?'disposed':phase,physicalSceneId:value.physicalSceneId,revision:value.revision,scene:spec,poses,leader:value.leader,discovered:[...value.discovered],hotspots:spec.hotspots,nearby,returnAvailable:value.returnTrail.length>0,assetFailure:assetFailure?copy(assetFailure):null,retryTransitionAvailable:!!retryTransition,navigation:navigation?copy(navigation):null,save:{status:save.status,dirty:!!state&&JSON.stringify(state)!==persistedState,issue,raw:save.raw,pendingRaw:(phase==='recovery-required'||save.dirty)?store.pendingExport()?.raw||null:null},notice});
  }
  function emit(){try{onChange(view());}catch{}}
  function stopMotion(arrived=false,preserveArrival=false){if(navigation&&(!preserveArrival||navigation.status==='walking'))navigation={...navigation,status:arrived?'arrived':'cancelled'};if(frame!==null)cancelFrame(frame);frame=null;route=null;lastTime=null;movingFlags={pipi:false,tangyuan:false};if(phase==='walking')phase=pauses.size?'suspended':'ready';}
  function recover(reason){issue=reason;notice='位置尚未确认保存；当前场景保留，请先导出恢复记录。';phase='recovery-required';stopMotion();emit();return{status:'recovery-required',reason};}
  function blocked(reason,message){notice=message||messages[reason]||'暂时无法进行这个操作。';emit();return{status:'blocked',reason};}
  function available(){return !disposed&&state&&['ready','walking'].includes(phase)&&!pauses.size&&!activeWrite;}
  function epochCurrent(token){return !disposed&&token===generation&&!pauses.size;}
  async function preload(spec){
    if(!assets.has(spec.id))assets.set(spec.id,Promise.resolve().then(()=>loadAsset(spec,{signal:assetController.signal})).then(size=>{if(size?.width!==spec.width||size?.height!==spec.height)throw Object.assign(new Error('asset-dimensions'),{code:'asset-dimensions',phase:'dimensions'});assetFailure=null;return true;}).catch(error=>{assets.delete(spec.id);assetFailure={targetId:spec.id,code:error?.code||'asset-unavailable',phase:error?.phase||'request',httpStatus:error?.httpStatus??null,path:error?.url?new URL(error.url,import.meta.url).pathname:spec.background};throw error;}));
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
  const startup=createPhysicalStartup({
    read:()=>store.readLatest(),upgrade:upgradePhysicalState,fresh:freshPhysicalState,
    async prepareMigration(loaded){
      if(loaded.state&&(loaded.state.schema===LEGACY_PHYSICAL_STATE_SCHEMA||loaded.state.registryVersion!==PHYSICAL_REGISTRY_VERSION)){
        const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(loaded.raw)))].map(n=>n.toString(16).padStart(2,'0')).join('');
        migration={raw:loaded.raw,key:PHYSICAL_MIGRATION_PREFIX+hash};
      }
    },
    pending(candidate){pendingState=copy(candidate);phase='loading';issue='';notice='';emit();},
    loadAsset:candidate=>preload(PHYSICAL_SCENES[candidate.physicalSceneId]),
    publish(candidate,initializing){
      pendingState=null;
      if(initializing)return save(candidate,{initializing:true});
      state=copy(candidate);persistedState=JSON.stringify(candidate);phase=pauses.size?'suspended':'ready';issue='';notice='';emit();return{status:'done',revision:state.revision};
    },
    recover,
    assetBlocked(reason){issue=reason;notice='当前场景图片未能载入。可以重试，原存档和位置保持不变。';phase='asset-blocked';stopMotion();emit();return{status:'asset-blocked',reason};},
    disposed:()=>disposed,
  });
  const ready=startup.start();
  async function flush(){
    if(disposed)return{status:'blocked',reason:'disposed'};
    if(phase==='asset-blocked')return{status:'asset-blocked',reason:issue};
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
    const goal=Math.max(0,pathLength(candidateTrail)-followGap(spec));
    let nextCursor=leaderTravel>=followGap(spec)||finish?Math.min(goal,trail.cursor+spec.navigation.speed*1.15*dt):trail.cursor;
    // Stop at a trail corner instead of cutting across its two segments.
    let boundary=0;for(let i=1;i<candidateTrail.length;i++){boundary+=distance(candidateTrail[i-1],candidateTrail[i]);if(boundary>trail.cursor+1e-7){nextCursor=Math.min(nextCursor,boundary);break;}}
    let nextFollower=alongPath(candidateTrail,nextCursor);
    // Waiting is safe because the leader path was planned around this cat.
    // Do not let following consume the leader's still-needed passing space.
    const clearance=Math.min(route?.clearance??companionClearance(spec),distance(before.pipi,before.tangyuan));
    if(futurePath&&!clearOfFuturePath(before[follower],nextFollower,futurePath,clearance)){
      nextFollower=point(before[follower]);nextCursor=trail.cursor;
    }
    let after={...before,[leader]:{...before[leader],...leaderPoint},[follower]:{...before[follower],...nextFollower}},cursor=nextCursor;
    if(!pairStepSafe(spec,before,after,clearance)){
      after={...before,[leader]:{...before[leader],...leaderPoint}};cursor=trail.cursor;
      if(!pairStepSafe(spec,before,after,clearance))return false;
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
    const elapsed=Math.max(0,Math.min(1,(time-(lastTime??time-16))/1000));lastTime=time;
    const expected=route,token=generation;
    progressRoute(elapsed);
    if(route===expected&&phase==='walking'&&!disposed&&!pauses.size&&generation===token&&frame===null)queueFrame();
  }
  function progressRoute(remaining){
    const expected=route,token=generation;
    while(remaining>1e-7&&route===expected&&phase==='walking'&&!disposed&&!pauses.size&&generation===token){
      let cornerTime=Infinity,length=0;
      for(let i=1;i<route.path.length;i++){
        length+=distance(route.path[i-1],route.path[i]);
        if(length>route.travel+1e-7){cornerTime=(length-route.travel)/scene().navigation.speed;break;}
      }
      const dt=Math.min(.05,remaining,cornerTime);stepFrame(dt);remaining-=dt;
    }
  }
  function stepFrame(dt){
    const expected=route;
    if(route.kind==='yield'){
      const travel=Math.min(route.length,route.travel+scene().navigation.speed*dt),next=alongPath(route.path,travel);
      const after={...state.cats,[route.cat]:{...state.cats[route.cat],...next}};
      if(!pairStepSafe(scene(),state.cats,after)){stopMotion();notice='伙伴暂时无法让路，请换方向。';emit();void flush();return;}
      movingFlags=Object.fromEntries(names.map(cat=>[cat,distance(state.cats[cat],after[cat])>.00001]));markMovement(after);route.travel=travel;emit();
      if(route!==expected||phase!=='walking'||disposed||pauses.size)return;
      if(travel>=route.length-.001){
        if(route.setup.length){
          const next=route.setup.shift();Object.assign(route,{cat:next.cat,path:next.path,length:pathLength(next.path),travel:0});
        }else{
          const {target,requested,snapped,mainPath,clearance,steering}=route,id=navigation?.movementId??null;
          startPlan({path:mainPath,setup:[],clearance},target,requested,snapped,id,steering);
        }
        return;
      }
      return;
    }
    const travel=Math.min(route.length,route.travel+scene().navigation.speed*dt),target=alongPath(route.path,travel);
    if(!advance(target,dt,travel>=route.length-.001,remainingPath(route.path,travel))){stopMotion();notice='两猫前方空间不足，请换方向或换一只带队。';emit();void flush();return;}
    route.travel=travel;emit();
    if(route!==expected||phase!=='walking'||disposed||pauses.size)return;
    if(travel>=route.length-.001){
      const together=pathLength(trail.points)-followGap(scene())-trail.cursor<.1;
      if(together||names.every(cat=>!movingFlags[cat])){const steering=route.steering;stopMotion(true);notice=together?'':'已到达，伙伴在安全位置等候。';emit();if(!steering)void flush();return;}
    }
  }
  function startPlan(plan,target,requested=target,snapped=false,resumeId=null,steering=null){
    stopMotion();trail=null;
    const steps=plan.setup.map(step=>({cat:step.role==='leader'?state.leader:opposite(state.leader),path:step.path}));
    const first=steps.shift();
    if(first)route={kind:'yield',cat:first.cat,path:first.path,length:pathLength(first.path),travel:0,setup:steps,mainPath:plan.path,clearance:plan.clearance,steering,target:point(target),requested:point(requested),snapped};
    else{
      trail=makeTrail();if(!trail)return blocked('companion-route-unavailable');
      route={path:plan.path,length:pathLength(plan.path),travel:0,clearance:plan.clearance,steering};
    }
    navigation=steering?null:{movementId:resumeId??++movementId,target:point(target),requested:point(requested),snapped,status:'walking'};
    phase='walking';notice=first?'伙伴正在让出通路…':'';lastTime=null;emit();
    if(!steering)queueFrame();
    return{...copy(navigation),status:'started',revision:state.revision};
  }
  function walk(target,requested=target,snapped=false,resumeId=null){
    if(!available())return blocked('busy');
    const spec=scene(),leader=state.cats[state.leader],follower=state.cats[opposite(state.leader)];
    if(!pointSafe(spec,target))return blocked('outside-walkable-floor');
    let plan=findCompanionPassage(spec,leader,follower,target);
    if(!plan){
      const clearance=2*spec.navigation.radius+6,avoid=p=>[{...point(p),radius:clearance-spec.navigation.radius}];
      const path=findPath(spec,leader,target,avoid(follower));
      if(path)plan={path,setup:[],clearance};
      else{
        const base=findPath(spec,leader,target);if(!base)return blocked('no-clear-route');
        const yielding=findPassingPath(spec,follower,leader,base,clearance);
        const resumed=yielding&&findPath(spec,leader,target,avoid(yielding.at(-1)));
        if(!resumed)return blocked('companion-space');
        plan={path:resumed,setup:[{role:'follower',path:yielding}],clearance};
      }
    }
    return startPlan(plan,target,requested,snapped,resumeId);
  }
  async function transition(targetId,{returnTrail,destination,leader=state.leader,commitGuard=null}){
    if(!available())return blocked('busy');
    const target=PHYSICAL_SCENES[targetId];if(!target)return blocked('unknown-scene');
    stopMotion();assetFailure=null;retryTransition=null;const token=++generation;phase='transitioning';notice='正在确认入口与保存…';emit();
    const source=copy(state);destination??=target.spawn;
    if(!pairSafe(target,destination)){phase='ready';return blocked('unsafe-arrival');}
    const endResources=journeyTimings.span(targetId,'resources');
    try{await preload(target);endResources('ready');}catch{
      endResources('failed');if(!epochCurrent(token))return{status:'superseded'};phase='ready';
      retryTransition={targetId,fromSceneId:source.physicalSceneId,revision:source.revision,options:{returnTrail:copy(returnTrail),destination:copy(destination),leader,commitGuard}};
      const failure=assetFailure;
      const detail=failure?.httpStatus?`HTTP ${failure.httpStatus}`:{'asset-timeout':'等待超时','asset-identity':'文件校验未通过','asset-dimensions':'图片尺寸不匹配','asset-decode':'图片解码失败','asset-aborted':'请求已取消'}[failure?.code]||'网络请求失败';
      return blocked('asset-unavailable',`${detail}。伙伴仍在原处，可重试进入。`);
    }
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
    if(intent.kind==='retry-transition'){
      const retry=retryTransition;
      if(!retry)return blocked('no-asset-retry');
      if(retry.fromSceneId!==state.physicalSceneId||retry.revision!==state.revision){retryTransition=null;assetFailure=null;return blocked('stale-asset-retry','位置已经变化，请重新走近入口。');}
      return transition(retry.targetId,retry.options);
    }
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
      const magnitude=Math.hypot(intent.dx,intent.dy),direction=magnitude?{x:intent.dx/magnitude,y:intent.dy/magnitude}:null;
      if(route?.steering&&direction&&distance(route.steering,direction)<.001){progressRoute(intent.dt);return{status:'done',revision:state.revision};}
      if(route?.kind==='yield')trail=null;
      stopMotion();if(!direction){emit();return{status:'done',revision:state.revision};}
      const spec=scene(),lead=state.cats[state.leader],follower=state.cats[opposite(state.leader)],length=spec.navigation.speed*intent.dt;
      const target={x:lead.x+direction.x*length,y:lead.y+direction.y*length};
      if(!segmentSafe(spec,lead,target))return blocked('obstacle');
      const clearance=companionClearance(spec),after={...state.cats,[state.leader]:{...lead,...target}};
      if(distance(lead,follower)<clearance-.001||!pairStepSafe(spec,state.cats,after,clearance)){
        const ahead=findReachablePath(spec,lead,{x:lead.x+direction.x*clearance*2,y:lead.y+direction.y*clearance*2});
        const plan=ahead&&findCompanionPassage(spec,lead,follower,ahead.target);
        if(plan){startPlan(plan,ahead.target,ahead.target,false,null,direction);progressRoute(intent.dt);return{status:'done',revision:state.revision};}
      }
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
    const token={reason};pauses.add(token);generation++;stopMotion();if(!disposed&&phase!=='recovery-required'&&phase!=='loading'&&phase!=='asset-blocked')phase='suspended';emit();
    let released=false;return()=>{if(released)return;released=true;pauses.delete(token);if(!pauses.size&&phase==='suspended')phase='ready';emit();};
  }
  function dispose(){if(disposed)return;disposed=true;generation++;assetController.abort();stopMotion();phase='disposed';emit();}
  return Object.freeze({ready,retryAssets:startup.retry,view,act,flush,suspend,dispose});
}
