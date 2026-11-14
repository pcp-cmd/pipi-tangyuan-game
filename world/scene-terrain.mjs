// Bounded, hand-authored feet terrain on the existing illustration.
// This is not a pixel mask, a full-island navmesh or sprite-body collision.
import { SCENE } from './scene-model.js';
import { WALK_NODES, WALK_EDGES, WALK_BLOCKS, WALK_PLACES, boardActorPoint, pathToPlace, pathLength, pathFrame } from './scene-walk.mjs';

const EPS = 1e-8;
const finite = p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= SCENE.width && p.y >= 0 && p.y <= SCENE.height;
const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const copy = p => ({ x: p.x, y: p.y });
const freezePolygon = points => Object.freeze(points.map(p => Object.freeze(Array.isArray(p) ? { x: p[0], y: p[1] } : copy(p))));
function corridor(a, b, width) {
  const d = gap(a, b), dx = d ? (b.x - a.x) / d : 1, dy = d ? (b.y - a.y) / d : 0;
  return freezePolygon([
    { x: a.x - dx * width - dy * width, y: a.y - dy * width + dx * width },
    { x: b.x + dx * width - dy * width, y: b.y + dy * width + dx * width },
    { x: b.x + dx * width + dy * width, y: b.y + dy * width - dx * width },
    { x: a.x - dx * width + dy * width, y: a.y - dy * width - dx * width },
  ]);
}
// Open paved areas are deliberately smaller than the apparent whole island.
// Existing landmark corridors remain available, with the fire/fence excluded.
export const TERRAIN_ZONES = Object.freeze([
  ...WALK_EDGES.map(([a, b]) => corridor(WALK_NODES[a], WALK_NODES[b], 23)),
  freezePolygon([[720,1020],[910,1020],[970,825],[760,825]]),
  freezePolygon([[740,815],[800,720],[930,720],[1100,765],[1100,800],[950,870]]),
  freezePolygon([[500,795],[650,795],[700,825],[700,880],[635,900],[500,860]]),
  freezePolygon([[1100,650],[1250,645],[1335,655],[1345,710],[1190,735],[1095,710]]),
]);
// The low campsite rock was outside stage30's seven guards. Its visible feet
// area is now excluded; the companion waits to its west, not on that rock.
export const TERRAIN_BLOCKS = Object.freeze([...WALK_BLOCKS, Object.freeze({ id: 'camp-low-rock', left: 1138, top: 659, right: 1185, bottom: 706 })]);
const entryZones = [];
// Preserve the existing board's visual spawn anchors. Narrow, checked entry
// connectors are traversable, but not advertised as free-click destinations.
for (const point of SCENE.points) for (const offset of [-90, 0, 90]) {
  const route = pathToPlace(boardActorPoint(point, offset), 'harbor');
  for (let i = 1; i < Math.min(route.length, 3); i++) entryZones.push(corridor(route[i - 1], route[i], 5));
}
export const TERRAIN_ENTRY_ZONES = Object.freeze(entryZones);
const navigationZones = Object.freeze([...TERRAIN_ZONES, ...TERRAIN_ENTRY_ZONES]);
const rectangle = r => [{ x:r.left,y:r.top },{ x:r.right,y:r.top },{ x:r.right,y:r.bottom },{ x:r.left,y:r.bottom }];

// Exact line clipping against a convex polygon, followed by interval union.
// Sampling alone could skip a thin obstacle or a gap between two areas.
export function polygonInterval(a, b, polygon) {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) { const p=polygon[i],q=polygon[(i+1)%polygon.length]; area += p.x*q.y-q.x*p.y; }
  const sign = area >= 0 ? 1 : -1;
  let lo = 0, hi = 1;
  for (let i = 0; i < polygon.length; i++) {
    const p=polygon[i],q=polygon[(i+1)%polygon.length], ex=q.x-p.x, ey=q.y-p.y;
    const at=sign*(ex*(a.y-p.y)-ey*(a.x-p.x)), delta=sign*(ex*(b.y-a.y)-ey*(b.x-a.x));
    if (Math.abs(delta) < EPS) { if (at < -EPS) return null; }
    else { const t = -at/delta; if (delta > 0) lo=Math.max(lo,t); else hi=Math.min(hi,t); }
    if (lo-hi > EPS) return null;
  }
  return [Math.max(0,lo),Math.min(1,hi)];
}
function clearOfBlocks(a, b) { return TERRAIN_BLOCKS.every(r => polygonInterval(a,b,rectangle(r)) === null); }
function covered(a, b, zones) {
  const spans=zones.map(p=>polygonInterval(a,b,p)).filter(Boolean).sort((a,b)=>a[0]-b[0]);
  let end=0;
  for (const [lo,hi] of spans) { if (lo > end+EPS) return false; end=Math.max(end,hi); if (end >= 1-EPS) return true; }
  return false;
}
export const terrainTargetValid = p => !!(finite(p) && clearOfBlocks(p,p) && covered(p,p,TERRAIN_ZONES));
export const terrainFootValid = p => !!(finite(p) && clearOfBlocks(p,p) && covered(p,p,navigationZones));
export const terrainSegmentClear = (a,b) => !!(finite(a) && finite(b) && clearOfBlocks(a,b) && covered(a,b,navigationZones));

let graph;
function terrainGraph() {
  if (graph) return graph;
  const points=[],edges=[],indices=new Map();
  for (let y=400;y<=1040;y+=20) for (let x=480;x<=1380;x+=20) {
    const p={x,y}; if (!terrainFootValid(p)) continue;
    indices.set(`${x},${y}`,points.length);points.push(p);edges.push([]);
  }
  for (let i=0;i<points.length;i++) for (const [dx,dy] of [[20,0],[0,20],[20,20],[-20,20]]) {
    const p=points[i],j=indices.get(`${p.x+dx},${p.y+dy}`);
    if (j === undefined || !terrainSegmentClear(p,points[j])) continue;
    const cost=gap(p,points[j]);edges[i].push([j,cost]);edges[j].push([i,cost]);
  }
  graph={points,edges};return graph;
}
class MinHeap {
  items=[];
  push(item) { let i=this.items.length;this.items.push(item);while(i){const p=(i-1)>>1;if(this.items[p].score<=item.score)break;this.items[i]=this.items[p];i=p;}this.items[i]=item; }
  pop() { const first=this.items[0],last=this.items.pop();if(!this.items.length)return first;let i=0;while(true){const left=i*2+1;if(left>=this.items.length)break;let next=left;if(left+1<this.items.length&&this.items[left+1].score<this.items[left].score)next++;if(this.items[next].score>=last.score)break;this.items[i]=this.items[next];i=next;}this.items[i]=last;return first; }
}
export function terrainPath(start, target) {
  if (!terrainFootValid(start) || !terrainTargetValid(target)) return null;
  if (terrainSegmentClear(start,target)) return gap(start,target)<EPS ? [copy(start)] : [copy(start),copy(target)];
  const {points,edges}=terrainGraph(), n=points.length, end=n+1;
  const p=[...points,copy(start),copy(target)];
  const joins=point=>points.flatMap((q,i)=>gap(point,q)<=80&&terrainSegmentClear(point,q)?[[i,gap(point,q)]]:[]);
  const sourceEdges=joins(start),targetEdges=new Map(joins(target));
  if(!sourceEdges.length||!targetEdges.size)return null;
  const costs=new Map([[n,0]]),parents=new Map(),closed=new Set(),queue=new MinHeap();
  queue.push({id:n,score:gap(start,target),cost:0});
  while(queue.items.length){
    const {id,cost}=queue.pop();if(closed.has(id)||cost!==costs.get(id))continue;
    if(id===end){
      const route=[copy(target)];let current=end;
      while(current!==n){current=parents.get(current);route.unshift(copy(p[current]));}
      // Simplify only when the complete segment stays inside the positive mask.
      const smooth=[route[0]];let at=0;
      while(at<route.length-1){let next=route.length-1;while(next>at+1&&!terrainSegmentClear(route[at],route[next]))next--;smooth.push(route[next]);at=next;}
      return smooth;
    }
    closed.add(id);
    const links=id===n?sourceEdges:[...edges[id],...(targetEdges.has(id)?[[end,targetEdges.get(id)]]:[])];
    for(const [next,length]of links){const candidate=cost+length;if(candidate>=(costs.get(next)??Infinity))continue;costs.set(next,candidate);parents.set(next,id);queue.push({id:next,cost:candidate,score:candidate+gap(p[next],target)});}
  }
  return null;
}
export function planTerrainWalk(positions, target, leader='pipi') {
  if (!['pipi','tangyuan'].includes(leader) || !positions || !terrainTargetValid(target)) return null;
  const follower=leader==='pipi'?'tangyuan':'pipi', lead=terrainPath(positions[leader],target);
  if(!lead||!terrainFootValid(positions[follower]))return null;
  const candidates=[];
  if(gap(positions[follower],target)>=85&&gap(positions[follower],target)<=160&&terrainTargetValid(positions[follower]))candidates.push(copy(positions[follower]));
  const length=pathLength(lead);
  if(length>=100)candidates.push(copy(pathFrame(lead,length-100)));
  const angle=Math.atan2(positions[follower].y-target.y,positions[follower].x-target.x);
  for(const radius of[95,120,150])for(let i=0;i<32;i++){const theta=angle+(i%2?-1:1)*Math.ceil(i/2)*Math.PI/16;candidates.push({x:target.x+Math.cos(theta)*radius,y:target.y+Math.sin(theta)*radius});}
  for(const point of candidates){
    if(gap(point,target)<85||!terrainTargetValid(point))continue;
    const follow=terrainPath(positions[follower],point);if(follow)return {[leader]:lead,[follower]:follow};
  }
  return null;
}
export function terrainPlacePaths(positions,id,leader='pipi') {
  if(!Object.hasOwn(WALK_PLACES,id)||!['pipi','tangyuan'].includes(leader)||!positions)return null;
  const follower=leader==='pipi'?'tangyuan':'pipi';
  const lead=WALK_NODES[WALK_PLACES[id][0]],follow=id==='camp'?{x:1115,y:685}:WALK_NODES[WALK_PLACES[id][1]];
  const result={[leader]:terrainPath(positions[leader],lead),[follower]:terrainPath(positions[follower],follow)};
  return Object.values(result).every(Boolean)?result:null;
}
export function terrainStatistics(){const g=terrainGraph();return {nodes:g.points.length,edges:g.edges.reduce((n,e)=>n+e.length,0)/2,gridStep:20,connectorLimit:80,positiveZones:TERRAIN_ZONES.length,entryZones:entryZones.length,blocks:TERRAIN_BLOCKS.length};}

export function terrainPointFromClient(point, rect) {
  if(!point||!rect||![point.x,point.y,rect.left,rect.top,rect.width,rect.height].every(Number.isFinite)||rect.width<=0||rect.height<=0)return null;
  const result={x:(point.x-rect.left)*SCENE.width/rect.width,y:(point.y-rect.top)*SCENE.height/rect.height};
  return finite(result)?result:null;
}

export function moveTerrainAim(aim, key, size) {
  const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(!Object.hasOwn(directions,key)||!aim||!size||![aim.x,aim.y,size.width,size.height].every(Number.isFinite)||size.width<40||size.height<40)return null;
  const [dx,dy]=directions[key],bound=(n,length)=>Math.max(16/length,Math.min(1-16/length,n));
  return {x:bound(aim.x+dx*16/size.width,size.width),y:bound(aim.y+dy*16/size.height,size.height)};
}
