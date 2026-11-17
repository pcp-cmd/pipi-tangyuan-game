const groundRoutes = new Set(['market.forest.front-door', 'archive.garden.front-door', 'observatory.summit.front-door', 'market.forest.exit', 'archive.garden.exit', 'observatory.summit.exit', 'workshop.yard']);
const points = polygon => polygon.map(point => Array.isArray(point) ? point : [point.x, point.y]);
export function objectGlowDefinition(item, scene) {
  if (groundRoutes.has(item.id)) return { kind: 'ground', reason: 'Walkable ground or path keeps its original marker and input.' };
  if (item.asset) return { kind: 'alpha', asset: item.asset };
  if (!item.highlightPolygon?.length) throw new Error(`Missing visual outline: ${item.id}`);
  return { kind: 'mask', width: scene.width, height: scene.height, polygon: points(item.highlightPolygon) };
}
export function createObjectGlow({ document: doc, item, scene, zIndex, exclude = [] }) {
  const definition = objectGlowDefinition(item, scene);
  if (definition.kind === 'ground') return null;
  const layer = doc.createElement('div'); layer.className = 'physical-object-glow'; layer.setAttribute('aria-hidden', 'true');
  layer.dataset.glowKind = definition.kind; layer.style.zIndex = String(zIndex);
  const paint = doc.createElement(definition.kind === 'alpha' ? 'img' : 'div'); paint.className = 'object-glow-paint';
  if (definition.kind === 'alpha') {
    const asset = definition.asset;
    paint.src = asset.src; paint.alt = ''; paint.draggable = false; paint.decoding = 'async';
    Object.assign(paint.style, { left: `${asset.x}px`, top: `${asset.y}px`, width: `${asset.width}px`, height: `${asset.height}px` });
  } else {
    const polygon = values => values.map(point => point.join(',')).join(' ');
    const cuts = exclude.map(value => `<polygon points="${polygon(points(value))}" fill="black"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}"><defs><filter id="soft"><feGaussianBlur stdDeviation="0.7"/></filter><mask id="shape"><polygon points="${polygon(definition.polygon)}" fill="white" filter="url(#soft)"/>${cuts}</mask></defs><rect width="100%" height="100%" fill="white" mask="url(#shape)"/></svg>`;
    Object.assign(paint.style, { inset: '0', backgroundImage: `url("${scene.background}")`, backgroundSize: '100% 100%', maskImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, maskSize: '100% 100%', maskRepeat: 'no-repeat' });
  }
  layer.append(paint); return layer;
}
