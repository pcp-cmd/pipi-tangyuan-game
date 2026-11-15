                                                                 
                                                                       
                                                                        
                                                                                                  

                                  
                          
                                                       
                                              
 

                                 
                         
                          
                                       
 

                                                                                      
                                                                          
                                                                                                            
                             

const EPS = 1e-7;
const frozenGeometry = new WeakMap                                   ();
const finite = (p                                    )                       =>
  p !== null && p !== undefined && Number.isFinite(p.x) && Number.isFinite(p.y);
const isBlock = (value                    )                           => Array.isArray(value);
const asPoint = (p              )                  => Array.isArray(p)
  ? { x: p[0]          , y: p[1]           }
  : p                   ;

function preparePolygon(polygon                         , inset        )                  {
  const points = polygon.map(asPoint);
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const q = points[(i + 1) % points.length];
    area += points[i].x * q.y - q.x * points[i].y;
  }
  const edges = points.map((s, i) => {
    const t = points[(i + 1) % points.length], ex = t.x - s.x, ey = t.y - s.y;
    return { x: s.x, y: s.y, ex, ey, inset: inset * Math.hypot(ex, ey) };
  });
  return { sign: area >= 0 ? 1 : -1, edges };
}

function rectangle([l, t, r, b]                 , radius        )                          {
  return [[l - radius, t - radius], [r + radius, t - radius], [r + radius, b + radius], [l - radius, b + radius]];
}

function hasFrozenGeometry(navigation                 )          {
  return Object.isFrozen(navigation) && Object.isFrozen(navigation.zones) && Object.isFrozen(navigation.blocks)
    && navigation.zones.every(polygon => Object.isFrozen(polygon) && polygon.every(p => Object.isFrozen(p)))
    && navigation.blocks.every(block => Object.isFrozen(block));
}

function geometry(navigation                 )                   {
  const cached = frozenGeometry.get(navigation);
  if (cached) return cached;
  const prepared = {
    zones: navigation.zones.map(p => preparePolygon(p, navigation.radius)),
    blocks: navigation.blocks.map(block => preparePolygon(rectangle(block, navigation.radius), 0)),
  };
  if (hasFrozenGeometry(navigation)) frozenGeometry.set(navigation, prepared);
  return prepared;
}

function interval(a                 , b                 , polygon                 )              {
  let lo = 0, hi = 1;
  const sign = polygon.sign;
  for (const { x, y, ex, ey, inset } of polygon.edges) {
    const at = sign * (ex * (a.y - y) - ey * (a.x - x)) - inset;
    const delta = sign * (ex * (b.y - a.y) - ey * (b.x - a.x));
    if (Math.abs(delta) < EPS) { if (at < -EPS) return null; }
    else {
      const v = -at / delta;
      if (delta > 0) lo = Math.max(lo, v); else hi = Math.min(hi, v);
    }
    if (lo > hi + EPS) return null;
  }
  return [Math.max(0, lo), Math.min(1, hi)];
}

function pointSegmentDistance(p                 , a                 , b                 )         {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

export function segmentSafe(
  scene                ,
  a                 ,
  b                 ,
  avoid                                = [],
)          {
  const { radius } = scene.navigation;
  if (![a, b].every(p => finite(p) && p.x >= radius && p.y >= radius && p.x <= scene.width - radius && p.y <= scene.height - radius)) return false;
  const prepared = geometry(scene.navigation);
  if (prepared.blocks.some(block => interval(a, b, block) !== null)) return false;
  if (avoid.some(obstacle => isBlock(obstacle)
    ? interval(a, b, preparePolygon(rectangle(obstacle, radius), 0)) !== null
    : !finite(obstacle) || !Number.isFinite(obstacle.radius) || obstacle.radius < 0
      || pointSegmentDistance(obstacle, a, b) < radius + obstacle.radius - EPS)) return false;
  const spans         = [];
  for (const zone of prepared.zones) {
    const span = interval(a, b, zone);
    if (span) spans.push(span);
  }
  spans.sort((a, b) => a[0] - b[0]);
  let end = 0;
  for (const [lo, hi] of spans) {
    if (lo > end + EPS) return false;
    end = Math.max(end, hi);
    if (end >= 1 - EPS) return true;
  }
  return false;
}


//# sourceURL=../typed/navigation-geometry.mts