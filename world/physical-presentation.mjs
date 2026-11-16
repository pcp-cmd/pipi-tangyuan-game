import { worldGazeAngle } from './pets-frame-adapter.mjs';
import { physicalFootAnchor } from './physical-cats.mjs';
import { mountTerrainOverlay } from './generated/terrain-overlay.mjs';
import { createHotspotClickIntent } from './hotspot-click-intent.mjs';
import { physicalObjectShape } from './physical-object-shape.mjs';
import {physicalObjectCue,physicalArtClip,createObjectCueSelection} from './physical-object-cue.mjs';
const names = { pipi: '皮皮', tangyuan: '汤圆' };
const polygonPoints = polygon => polygon.map(point => Array.isArray(point) ? point : [point.x, point.y]);
// Foot depth first; stable cat order and foreground paint never share a slot.
export const physicalDepthZ = (footY, layer = 0) => 2000 + 5 * Math.round(footY) + layer;

export function mountPhysicalPresentation({ document: doc = document, sprites, sceneSpec, onApproach, onInteract, onActivate = onInteract, onReturn, onSceneChange = () => {}, clickIntent = createHotspotClickIntent() }) {
  const world = doc.getElementById('world'), host = doc.getElementById('game');
  const background = doc.getElementById('sceneBackground');
  const terrain = mountTerrainOverlay(doc.getElementById('terrainOverlay'));
  const actorNodes = Object.fromEntries(Object.keys(names).map(cat => [cat, doc.getElementById(`${cat}Actor`)]));
  const hotspots = doc.createElement('div'); hotspots.id = 'physicalHotspots'; world.append(hotspots);
  const foreground = doc.createElement('div'); foreground.id = 'physicalForeground'; foreground.setAttribute('aria-hidden', 'true'); world.append(foreground);
  const actions = doc.createElement('nav'); actions.className = 'physical-actions'; actions.setAttribute('aria-label', '场景互动');
  const interact = doc.createElement('button'); interact.id = 'physicalInteract'; interact.type = 'button'; interact.className = 'physical-interact'; interact.hidden = true;
  const interactKey = doc.createElement('kbd'); interactKey.textContent = 'E'; interactKey.setAttribute('aria-hidden','true');
  const interactLabel = doc.createElement('span'); interactLabel.className = 'physical-action-label'; interact.append(interactKey,interactLabel);
  const back = doc.createElement('button'); back.id = 'physicalReturn'; back.type = 'button'; back.className = 'physical-return'; back.hidden = true;
  const save = doc.createElement('p'); save.id = 'physicalSaveStatus'; save.setAttribute('role', 'status'); save.className = 'physical-save-status'; save.hidden = true;
  actions.append(back, interact); host.append(actions, save);
  const cueSelection=createObjectCueSelection();
  let latest = null, currentScene = null;
  function clearSelection() { cueSelection.clear(); updateSelection(); }
  function updateSelection() {
    const {active,selected}=cueSelection.view();
    for (const object of hotspots.querySelectorAll('.physical-object')) {object.dataset.active=String(object.dataset.objectId===active);object.dataset.selected=String(object.dataset.objectId===selected);}
  }
  interact.addEventListener('click', () => { clickIntent.cancel(); const item = latest?.nearby[0]; if (item) void onInteract(item.id); });
  back.addEventListener('click', () => { clickIntent.cancel(); void onReturn(); });
  const updateAnchor = cat => {
    const actor = actorNodes[cat], art = actor.querySelector('.cat-art');
    const row = Number(art.dataset.petSourceRow ?? art.dataset.petRow ?? 0), column = Number(art.dataset.petSourceColumn ?? art.dataset.petColumn ?? art.dataset.petFrame ?? 0);
    actor.style.setProperty('--foot-anchor', String(physicalFootAnchor(cat, row, column).y));
  };
  const observer = new MutationObserver(records => {
    for (const cat of Object.keys(names)) if (records.some(record => record.target === actorNodes[cat].querySelector('.cat-art'))) updateAnchor(cat);
  });
  for (const cat of Object.keys(names)) observer.observe(actorNodes[cat].querySelector('.cat-art'), { attributes: true, attributeFilter: ['data-pet-state','data-pet-frame','data-pet-row','data-pet-column','data-pet-source-row','data-pet-source-column','class'] });
  function build(view) {
    clickIntent.cancel();
    cueSelection.clear();
    const spec = sceneSpec(view.physicalSceneId);
    currentScene = view.physicalSceneId;
    world.dataset.physicalScene = currentScene;
    world.dataset.interior = String(['interior','preview'].includes(spec?.kind) || currentScene.endsWith('.interior'));
    world.style.width = `${view.scene.width}px`; world.style.height = `${view.scene.height}px`;
    world.style.setProperty('--physical-cat-scale', String(spec?.catScale ?? .64));
    background.src = view.scene.background;
    background.alt = view.scene.title.replace(/ · .*$/, '');
    doc.getElementById('placeHotspots').hidden = currentScene !== 'harbor.exterior';
    const title = host.querySelector('.island-plaque h1'); if (title) title.textContent = view.scene.title.replace(/ · .*$/, '');
    const subtitle = host.querySelector('.island-plaque span'); if (subtitle) subtitle.textContent = '皮皮与汤圆的 Python 远行';
    const artNotice = doc.getElementById('assetNotice');
    // Asset review status belongs in the release audit, not on the island.
    if (artNotice) { artNotice.hidden = true; artNotice.textContent = ''; }
    hotspots.replaceChildren();
    for (const item of view.hotspots) {
      const object = doc.createElement('div'); object.className = 'physical-object'; object.dataset.objectId = item.id;
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'physical-hotspot';
      button.dataset.physicalHotspot = item.id; button.dataset.kind = item.kind; button.title = item.label;
      button.setAttribute('aria-label', `${item.label}。单击走近，双击使用`);
      button.style.left = `${item.x}px`; button.style.top = `${item.y}px`;
      if (item.asset) {
        const art = doc.createElement('img'); art.className = 'physical-object-art'; art.src = item.asset.src; art.alt = ''; art.setAttribute('aria-hidden','true'); art.draggable = false;
        Object.assign(art.style,{position:'absolute',left:`${item.asset.x}px`,top:`${item.asset.y}px`,width:`${item.asset.width}px`,height:`${item.asset.height}px`,pointerEvents:'none',zIndex:String(physicalDepthZ(item.asset.frontY, 2))});
        const clip=physicalArtClip(item);if(clip)art.style.clipPath=clip;
        object.append(art);
      }
      const shape = physicalObjectShape(item);
      if (shape) {
        button.dataset.objectShape = 'true';
        button.style.left = `${shape.x}px`; button.style.top = `${shape.y}px`;
        button.style.width = `${shape.width}px`; button.style.height = `${shape.height}px`;
        button.style.clipPath = shape.clip;
        const detail=physicalObjectCue(item);
        const createCue = zIndex => {
          const ns = 'http://www.w3.org/2000/svg', outline = doc.createElementNS(ns, 'svg'), polygon = doc.createElementNS(ns, 'polygon');
          outline.classList.add('physical-object-cue'); outline.setAttribute('aria-hidden', 'true');
          outline.style.zIndex = String(zIndex); outline.setAttribute('viewBox', `0 0 ${view.scene.width} ${view.scene.height}`);
          polygon.setAttribute('points', detail.map(point => point.join(',')).join(' '));
          polygon.setAttribute('vector-effect', 'non-scaling-stroke'); outline.append(polygon);
          return outline;
        };
        if(detail)object.append(createCue(item.asset ? physicalDepthZ(item.asset.frontY, 3) : 996));
        for (const mask of spec?.occluders ?? []) {
          if (!detail||!item.highlightOccluderIds?.includes(mask.id)) continue;
          const outline = createCue(physicalDepthZ(mask.frontY, 3));
          outline.dataset.occluder = mask.id;
          outline.style.clipPath = `polygon(${polygonPoints(mask.polygon).map(([x,y]) => `${x / view.scene.width * 100}% ${y / view.scene.height * 100}%`).join(',')})`;
          object.append(outline);
        }
      } else if (item.hitbox) {
        button.dataset.hitbox = 'true';
        button.style.left = `${item.hitbox.x}px`; button.style.top = `${item.hitbox.y}px`;
        button.style.width = `${item.hitbox.w}px`; button.style.height = `${item.hitbox.h}px`;
        button.style.setProperty('--marker-x', `${item.x - item.hitbox.x}px`);
        button.style.setProperty('--marker-y', `${item.y - item.hitbox.y}px`);
      }
      const lookAt = () => {
        if (!latest) return;
        for (const cat of Object.keys(names)) {
          const angle = worldGazeAngle(latest.poses[cat], { x: item.x, y: item.y });
          if (angle !== null) sprites.look?.(cat, angle);
        }
      };
      const clearLook = () => { for (const cat of Object.keys(names)) sprites.clearLook?.(cat); };
      const enter=()=>{cueSelection.enter(item.id);updateSelection();lookAt();};
      const leave=()=>{cueSelection.leave(item.id);updateSelection();clearLook();};
      const focus=()=>{cueSelection.focus(item.id);updateSelection();lookAt();};
      const blur=()=>{cueSelection.blur(item.id);updateSelection();clearLook();};
      button.addEventListener('pointerenter', enter); button.addEventListener('focus', focus);
      button.addEventListener('pointerleave', leave); button.addEventListener('blur', blur);
      const select = (action,intent) => { cueSelection.select(item.id); updateSelection(); return action(item.id,intent); };
      button.addEventListener('pointerdown', () => { cueSelection.select(item.id); updateSelection(); });
      clickIntent.bind(button, { approach: intent => select(onApproach,intent), activate: intent => select(onActivate,intent) });
      object.append(button); hotspots.append(object);
    }
    foreground.replaceChildren();
    for (const mask of spec?.occluders ?? []) {
      const layer = doc.createElement('div'); layer.className = 'physical-occluder'; layer.dataset.occluder = mask.id;
      layer.style.backgroundImage = `url("${view.scene.background}")`;
      layer.style.clipPath = `polygon(${polygonPoints(mask.polygon).map(([x,y]) => `${x / view.scene.width * 100}% ${y / view.scene.height * 100}%`).join(',')})`;
      layer.style.zIndex = String(physicalDepthZ(mask.frontY, 2)); foreground.append(layer);
    }
    terrain.setScene(spec, view.scene.width, view.scene.height);
    onSceneChange(view);
  }
  function render(view) {
    if (!view?.scene || !view.poses) return;
    latest = view;
    if (currentScene !== view.physicalSceneId) build(view);
    const moving = view.phase === 'walking'; world.dataset.walking = String(moving);
    for (const cat of Object.keys(names)) {
      const pose = view.poses[cat], actor = actorNodes[cat];
      actor.style.left = `${pose.x}px`; actor.style.top = `${pose.y}px`; actor.style.zIndex = String(physicalDepthZ(pose.y, cat === 'pipi' ? 0 : 1));
      actor.classList.toggle('leader', view.leader === cat);
      actor.setAttribute('aria-label', `${names[cat]}，${view.leader === cat ? '当前领队，' : ''}在${view.scene.title.replace(/ · .*$/, '')}。打开伙伴手账`);
      actor.querySelector('small').textContent = view.leader === cat ? '领队' : '同行';
      sprites.setMotion?.(cat, { moving: Boolean(pose.moving), facing: pose.facing });
      updateAnchor(cat);
    }
    const nearest = view.nearby[0];
    interact.hidden = !nearest || !['ready','walking'].includes(view.phase);
    interactLabel.textContent = nearest?.label ?? '';
    interact.setAttribute('aria-label',nearest?`E：${nearest.label}`:'场景互动');
    back.hidden = !view.returnAvailable;
    back.textContent = view.scene.legacyPreview ? '回到来处' : '走向出口';
    back.disabled = ['loading','asset-blocked','transitioning','suspended','recovery-required'].includes(view.phase);
    for (const button of hotspots.querySelectorAll('.physical-hotspot')) button.classList.toggle('within-reach', view.nearby.some(item => item.id === button.dataset.physicalHotspot));
    const trouble = !['saved','idle','loading','saving'].includes(view.save?.status) || view.phase === 'recovery-required';
    save.hidden = !trouble;
    save.textContent = trouble ? (view.notice || '位置尚未确认保存。请先到手账导出恢复备份。') : '';
    doc.getElementById('roamControls').hidden = !moving;
    doc.getElementById('stopRoam').disabled = !moving;
    doc.getElementById('roamStatus').textContent = moving ? '两位伙伴正在走路' : '';
  }
  function dispose() { clickIntent.dispose(); observer.disconnect(); terrain.dispose(); actions.remove(); save.remove(); hotspots.remove(); foreground.remove(); }
  return Object.freeze({ render, clearSelection, refreshTerrain: terrain.refresh, dispose });
}
