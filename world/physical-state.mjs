import { PHYSICAL_SCENES, PHYSICAL_REGISTRY_VERSION, DEFAULT_PHYSICAL_SCENE_ID, LEGACY_PHYSICAL_SCENES, LEGACY_PHYSICAL_REGISTRY_VERSION, PRE_ART_PHYSICAL_SCENES, PRE_ART_PHYSICAL_REGISTRY_VERSION, PRE_SERVICE_PHYSICAL_SCENES, PRE_SERVICE_PHYSICAL_REGISTRY_VERSION } from './physical-scenes.mjs';
import { pairSafe, distance } from './physical-navigation.mjs';
export const PHYSICAL_SAVE_KEY = 'physical-v1';
export const PHYSICAL_STATE_SCHEMA = 'pipi-space/v2';
export const LEGACY_PHYSICAL_STATE_SCHEMA = 'pipi-space/v1';
export const PHYSICAL_MIGRATION_PREFIX = `${PHYSICAL_SAVE_KEY}:pre-v2:`;
const cats = ['pipi','tangyuan'];
const exact = (v, keys) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === keys.length && keys.every(k=>Object.hasOwn(v,k));
const fail = () => {throw new TypeError('Invalid physical state; original bytes must be retained');};
const clone = value => structuredClone(value);
function posesValid(value, scene) {
  if(!scene||!exact(value,cats))return false;
  if(!cats.every(cat=>exact(value[cat],['x','y','facing'])&&Number.isFinite(value[cat].x)&&Number.isFinite(value[cat].y)&&['left','right'].includes(value[cat].facing)))return false;
  return pairSafe(scene,value);
}
function anchorValid(anchor,target,registry){
  if(!exact(anchor,['kind','doorId','fromSceneId','cats','leader'])||!cats.includes(anchor.leader))return false;
  const source=registry[anchor.fromSceneId];
  if(!source||!posesValid(anchor.cats,source))return false;
  if(anchor.kind==='preview')return source.id===DEFAULT_PHYSICAL_SCENE_ID&&anchor.doorId===`preview:${target.id}`&&target.id.startsWith('candidate.')&&!target.pairedExterior;
  const door=source.doors.find(d=>d.id===anchor.doorId);
  return anchor.kind==='door'&&door&&!door.return&&door.to===target.id&&target.doors.some(d=>d.id===door.pairedDoorId&&d.return&&(!d.to||d.to===source.id))&&distance(anchor.cats[anchor.leader],door.approach)<=door.radius+1e-7;
}
export function parsePhysicalState(raw) {
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>256*1024)fail();
  let value;try{value=JSON.parse(raw);}catch{fail();}
  const legacy=value?.schema===LEGACY_PHYSICAL_STATE_SCHEMA,preArt=!legacy&&value?.registryVersion===PRE_ART_PHYSICAL_REGISTRY_VERSION,preService=!legacy&&value?.registryVersion===PRE_SERVICE_PHYSICAL_REGISTRY_VERSION,registry=legacy?LEGACY_PHYSICAL_SCENES:preArt?PRE_ART_PHYSICAL_SCENES:preService?PRE_SERVICE_PHYSICAL_SCENES:PHYSICAL_SCENES;
  const fields=['schema','revision','registryVersion','physicalSceneId','leader','cats',legacy?'returnAnchor':'returnTrail','discovered'];
  if(!exact(value,fields)||value.schema!==(legacy?LEGACY_PHYSICAL_STATE_SCHEMA:PHYSICAL_STATE_SCHEMA)||value.registryVersion!==(legacy?LEGACY_PHYSICAL_REGISTRY_VERSION:preArt?PRE_ART_PHYSICAL_REGISTRY_VERSION:preService?PRE_SERVICE_PHYSICAL_REGISTRY_VERSION:PHYSICAL_REGISTRY_VERSION)||!Number.isSafeInteger(value.revision)||value.revision<0||!cats.includes(value.leader))fail();
  const scene=registry[value.physicalSceneId];
  if(!scene||!posesValid(value.cats,scene))fail();
  if(!Array.isArray(value.discovered)||value.discovered.length>Object.keys(registry).length||new Set(value.discovered).size!==value.discovered.length||!value.discovered.includes(value.physicalSceneId)||value.discovered.some(id=>!Object.hasOwn(registry,id)))fail();
  if(legacy){
    if(scene.id===DEFAULT_PHYSICAL_SCENE_ID){if(value.returnAnchor!==null)fail();}
    else if(value.returnAnchor?.fromSceneId!==DEFAULT_PHYSICAL_SCENE_ID||!anchorValid(value.returnAnchor,scene,registry))fail();
  }else{
    if(!Array.isArray(value.returnTrail)||value.returnTrail.length>32)fail();
    let target=scene;const visited=new Set([scene.id]);
    for(let i=value.returnTrail.length-1;i>=0;i--){
      const anchor=value.returnTrail[i];
      if(!anchorValid(anchor,target,registry)||visited.has(anchor.fromSceneId)||!value.discovered.includes(anchor.fromSceneId))fail();
      visited.add(anchor.fromSceneId);target=registry[anchor.fromSceneId];
    }
    if(target.id!==DEFAULT_PHYSICAL_SCENE_ID&&target.kind!=='island')fail();
  }
  return value;
}
export function upgradePhysicalState(value){
  if(value.schema===PHYSICAL_STATE_SCHEMA&&value.registryVersion===PHYSICAL_REGISTRY_VERSION)return clone(value);
  const upgraded=clone(value);
  const previousRegistry=value.schema===LEGACY_PHYSICAL_STATE_SCHEMA?LEGACY_PHYSICAL_SCENES:value.registryVersion===PRE_ART_PHYSICAL_REGISTRY_VERSION?PRE_ART_PHYSICAL_SCENES:PRE_SERVICE_PHYSICAL_SCENES;
  if(value.schema===LEGACY_PHYSICAL_STATE_SCHEMA){
    upgraded.returnTrail=value.returnAnchor?[clone(value.returnAnchor)]:[];
    delete upgraded.returnAnchor;
    upgraded.discovered=[...new Set([...value.discovered,...(value.returnAnchor?[value.returnAnchor.fromSceneId]:[])])];
  }
  upgraded.schema=PHYSICAL_STATE_SCHEMA;
  upgraded.registryVersion=PHYSICAL_REGISTRY_VERSION;
  const scene=PHYSICAL_SCENES[upgraded.physicalSceneId];
  if(scene.geometryVersion!==previousRegistry[scene.id]?.geometryVersion)upgraded.cats=clone(scene.spawn);
  for(const anchor of upgraded.returnTrail){
    const source=PHYSICAL_SCENES[anchor.fromSceneId];
    if(source.geometryVersion===previousRegistry[source.id]?.geometryVersion)continue;
    const door=source.doors.find(h=>h.id===anchor.doorId);
    anchor.cats=clone(door.returnArrival);
    if(anchor.leader==='tangyuan')anchor.cats={pipi:anchor.cats.tangyuan,tangyuan:anchor.cats.pipi};
  }
  parsePhysicalState(JSON.stringify(upgraded));
  return upgraded;
}
export function freshPhysicalState(){return{schema:PHYSICAL_STATE_SCHEMA,revision:0,registryVersion:PHYSICAL_REGISTRY_VERSION,physicalSceneId:DEFAULT_PHYSICAL_SCENE_ID,leader:'pipi',cats:clone(PHYSICAL_SCENES[DEFAULT_PHYSICAL_SCENE_ID].spawn),returnTrail:[],discovered:[DEFAULT_PHYSICAL_SCENE_ID]};}
