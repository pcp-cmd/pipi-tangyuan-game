import { physicalArtClip } from './physical-object-cue.mjs';
const groundRoutes = new Set(['market.forest.front-door', 'archive.garden.front-door', 'observatory.summit.front-door', 'market.forest.exit', 'archive.garden.exit', 'observatory.summit.exit', 'workshop.yard']);
export function objectGlowDefinition(item) {
  if (groundRoutes.has(item.id)) return { kind: 'ground', reason: 'Walkable ground or path keeps its original marker and input.' };
  if (item.asset) return { kind: 'alpha', asset: item.asset };
  // Hit polygons describe interaction, not verified visual edges.
  return { kind: 'anchor', reason: 'No independent verified visual silhouette; show the anchored prompt only.' };
}
export function createObjectGlow({ document: doc, item, zIndex }) {
  const definition = objectGlowDefinition(item);
  if (definition.kind !== 'alpha') return null;
  const layer = doc.createElement('div'); layer.className = 'physical-object-glow'; layer.setAttribute('aria-hidden', 'true');
  layer.dataset.glowKind = definition.kind; layer.style.zIndex = String(zIndex);
  const asset = definition.asset;
  const paint = doc.createElement('img'); paint.className = 'object-glow-paint';
  paint.src = asset.src; paint.alt = ''; paint.draggable = false; paint.decoding = 'async';
  Object.assign(paint.style, { left: `${asset.x}px`, top: `${asset.y}px`, width: `${asset.width}px`, height: `${asset.height}px` });
  const clip = physicalArtClip(item); if (clip) paint.style.clipPath = clip;
  layer.append(paint); return layer;
}
