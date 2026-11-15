// Conservative body navigation: whole segments must lie inside the union of
// radius-inset convex floor areas and outside radius-expanded solid footprints.
import {segmentSafe} from './generated/navigation-geometry.mjs';
export {segmentSafe};
const EPS = 1e-7;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const point = p => ({ x: p.x, y: p.y });
const finite = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
const asPoint = p => Array.isArray(p) ? { x: p[0], y: p[1] } : p;
function pointSegmentDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
function segmentDistance(a,b,c,d){
  const ux=b.x-a.x,uy=b.y-a.y,vx=d.x-c.x,vy=d.y-c.y,wx=c.x-a.x,wy=c.y-a.y,den=ux*vy-uy*vx;
  if(Math.abs(den)>EPS){const t=(wx*vy-wy*vx)/den,u=(wx*uy-wy*ux)/den;if(t>=-EPS&&t<=1+EPS&&u>=-EPS&&u<=1+EPS)return 0;}
  return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
}
export function clearOfFuturePath(a,b,path,clearance){
  if(path.length===1)return pointSegmentDistance(path[0],a,b)>=clearance-EPS;
  return path.slice(1).every((p,i)=>segmentDistance(a,b,path[i],p)>=clearance-EPS);
}
export function remainingPath(path,travel){
  for(let i=1;i<path.length;i++){const length=distance(path[i-1],path[i]);if(travel<length-EPS){const t=length?travel/length:0;return[{x:path[i-1].x+(path[i].x-path[i-1].x)*t,y:path[i-1].y+(path[i].y-path[i-1].y)*t},...path.slice(i)];}travel-=length;}
  return[point(path.at(-1))];
}
const rectangle = ([l, t, r, b], radius) => [[l - radius, t - radius], [r + radius, t - radius], [r + radius, b + radius], [l - radius, b + radius]];
export const pointSafe = (scene, p) => segmentSafe(scene, p, p);
export function pairSafe(scene, cats) {
  return ['pipi', 'tangyuan'].every(cat => pointSafe(scene, cats?.[cat])) && distance(cats.pipi, cats.tangyuan) >= 2 * scene.navigation.radius + 6 - EPS;
}
export function pairStepSafe(scene, before, after, clearance = 2 * scene.navigation.radius + 6) {
  if (!['pipi', 'tangyuan'].every(cat => segmentSafe(scene, before[cat], after[cat]))) return false;
  const x = before.pipi.x - before.tangyuan.x, y = before.pipi.y - before.tangyuan.y;
  const dx = after.pipi.x - after.tangyuan.x - x, dy = after.pipi.y - after.tangyuan.y - y;
  const t = Math.max(0, Math.min(1, -(x * dx + y * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x + t * dx, y + t * dy) >= clearance - EPS;
}
class Queue {
  values = [];
  push(value) { let i = this.values.length; this.values.push(value); while (i) { const p = (i - 1) >> 1; if (this.values[p].score <= value.score) break; this.values[i] = this.values[p]; i = p; } this.values[i] = value; }
  pop() { const first = this.values[0], last = this.values.pop(); if (!this.values.length) return first; let i = 0; while (i * 2 + 1 < this.values.length) { let j = i * 2 + 1; if (j + 1 < this.values.length && this.values[j + 1].score < this.values[j].score) j++; if (this.values[j].score >= last.score) break; this.values[i] = this.values[j]; i = j; } this.values[i] = last; return first; }
}
const graphs = new WeakMap();
function graph(scene) {
  if (graphs.has(scene)) return graphs.get(scene);
  const step = scene.navigation.gridStep || 20, points = [], edges = [], grid = new Map();
  const add = p => { const i = points.length; points.push(point(p)); edges.push([]); return i; };
  for (let y = step; y < scene.height; y += step) for (let x = step; x < scene.width; x += step) if (pointSafe(scene, { x, y })) grid.set(`${x},${y}`, add({ x, y }));
  for (const [key, i] of grid) {
    const [x, y] = key.split(',').map(Number);
    for (const [dx, dy] of [[step, 0], [0, step], [step, step], [-step, step]]) {
      const j = grid.get(`${x + dx},${y + dy}`);
      if (j !== undefined && segmentSafe(scene, points[i], points[j])) { const cost = distance(points[i], points[j]); edges[i].push([j, cost]); edges[j].push([i, cost]); }
    }
  }
  for (const p of scene.navigation.waypoints || []) {
    if (!pointSafe(scene, p)) continue;
    const i = add(p);
    for (let j = 0; j < i; j++) if (distance(p, points[j]) <= 190 && segmentSafe(scene, p, points[j])) { const cost = distance(p, points[j]); edges[i].push([j, cost]); edges[j].push([i, cost]); }
  }
  const result = { points, edges }; graphs.set(scene, result); return result;
}
export function findPath(scene, start, target, avoid = []) {
  if (!segmentSafe(scene, start, start, avoid) || !segmentSafe(scene, target, target, avoid)) return null;
  if (segmentSafe(scene, start, target, avoid)) return distance(start, target) < EPS ? [point(start)] : [point(start), point(target)];
  const path = segmentSafe(scene, start, target) ? [point(start), point(target)] : searchPath(scene, start, target, []);
  if (!path || !avoid.length || path.slice(1).every((p, i) => segmentSafe(scene, path[i], p, avoid))) return path;
  return searchPath(scene, start, target, avoid);
}
function searchPath(scene, start, target, avoid) {
  const base = graph(scene), n = base.points.length, end = n + 1, points = [...base.points, point(start), point(target)];
  const join = p => base.points.flatMap((q, i) => distance(p, q) <= 190 && segmentSafe(scene, p, q, avoid) ? [[i, distance(p, q)]] : []);
  const starts = join(start), ends = new Map(join(target));
  if (!starts.length || !ends.size) return null;
  const cost = new Map([[n, 0]]), parent = new Map(), closed = new Set(), queue = new Queue();
  queue.push({ id: n, score: distance(start, target), cost: 0 });
  while (queue.values.length) {
    const current = queue.pop(), { id } = current;
    if (closed.has(id) || current.cost !== cost.get(id)) continue;
    if (id === end) {
      const result = [point(target)]; let at = end;
      while (at !== n) { at = parent.get(at); result.unshift(point(points[at])); }
      const smooth = [result[0]]; let i = 0;
      while (i < result.length - 1) { let j = result.length - 1; while (j > i + 1 && !segmentSafe(scene, result[i], result[j], avoid)) j--; smooth.push(result[j]); i = j; }
      return smooth;
    }
    closed.add(id);
    const links = id === n ? starts : [...base.edges[id], ...(ends.has(id) ? [[end, ends.get(id)]] : [])];
    for (const [next, length] of links) {
      if (avoid.length && !segmentSafe(scene, points[id], points[next], avoid)) continue;
      const value = current.cost + length;
      if (value >= (cost.get(next) ?? Infinity)) continue;
      cost.set(next, value); parent.set(next, id); queue.push({ id: next, cost: value, score: value + distance(points[next], target) });
    }
  }
  return null;
}
function insetPolygon(polygon, radius, scene) {
  const source=polygon.map(asPoint);
  let area=0;
  for(let i=0;i<source.length;i++){const q=source[(i+1)%source.length];area+=source[i].x*q.y-q.x*source[i].y;}
  const sign=area>=0?1:-1;
  let result=[{x:radius,y:radius},{x:scene.width-radius,y:radius},{x:scene.width-radius,y:scene.height-radius},{x:radius,y:scene.height-radius}];
  for(let i=0;i<source.length&&result.length;i++){
    const a=source[i],b=source[(i+1)%source.length],dx=b.x-a.x,dy=b.y-a.y;
    const side=p=>sign*(dx*(p.y-a.y)-dy*(p.x-a.x))-radius*Math.hypot(dx,dy);
    const next=[];
    for(let j=0;j<result.length;j++){
      const p=result[j],q=result[(j+1)%result.length],u=side(p),v=side(q);
      if(u>=-EPS)next.push(p);
      if((u>=0)!==(v>=0)){const t=u/(u-v);next.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});}
    }
    result=next;
  }
  return result;
}
function projectToSegment(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  return{x:a.x+dx*t,y:a.y+dy*t};
}
export function findReachablePath(scene,start,requested,avoid=[]){
  if(!finite(requested)||!segmentSafe(scene,start,start,avoid))return null;
  const exact=findPath(scene,start,requested,avoid);
  if(exact)return{path:exact,target:point(requested),requested:point(requested),snapped:false};
  const base=graph(scene),parents=new Map(),cost=new Map(),queue=new Queue();
  for(let i=0;i<base.points.length;i++)if(distance(start,base.points[i])<=190&&segmentSafe(scene,start,base.points[i],avoid)){
    const length=distance(start,base.points[i]);cost.set(i,length);parents.set(i,null);queue.push({id:i,cost:length,score:length});
  }
  while(queue.values.length){
    const current=queue.pop();if(current.cost!==cost.get(current.id))continue;
    for(const [id,length] of base.edges[current.id]){
      if(avoid.length&&!segmentSafe(scene,base.points[current.id],base.points[id],avoid))continue;
      const value=current.cost+length;if(value>=(cost.get(id)??Infinity))continue;
      cost.set(id,value);parents.set(id,current.id);queue.push({id,cost:value,score:value});
    }
  }
  const polygons=scene.navigation.zones.map(p=>insetPolygon(p,scene.navigation.radius,scene));
  const margin=.001;
  for(const block of scene.navigation.blocks)polygons.push(rectangle(block,scene.navigation.radius+margin).map(asPoint));
  for(const obstacle of avoid)if(Array.isArray(obstacle))polygons.push(rectangle(obstacle,scene.navigation.radius+margin).map(asPoint));
  const candidates=[point(start),...Array.from(cost.keys(),id=>base.points[id])],edges=[];
  for(const polygon of polygons)for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length];edges.push([a,b]);candidates.push(a,projectToSegment(requested,a,b));
  }
  for(let i=0;i<edges.length;i++)for(let j=0;j<i;j++){
    const [a,b]=edges[i],[c,d]=edges[j],dx=b.x-a.x,dy=b.y-a.y,ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex;
    if(Math.abs(den)<EPS)continue;
    const t=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,u=((c.x-a.x)*dy-(c.y-a.y)*dx)/den;
    if(t>=0&&t<=1&&u>=0&&u<=1)candidates.push({x:a.x+t*dx,y:a.y+t*dy});
  }
  for(const obstacle of avoid)if(!Array.isArray(obstacle)){
    const angle=Math.atan2(requested.y-obstacle.y,requested.x-obstacle.x),radius=scene.navigation.radius+obstacle.radius+margin;
    for(let i=0;i<16;i++)candidates.push({x:obstacle.x+Math.cos(angle+i*Math.PI/8)*radius,y:obstacle.y+Math.sin(angle+i*Math.PI/8)*radius});
  }
  const seen=new Set();
  const ranked=candidates.filter(p=>{const key=`${p.x.toFixed(5)},${p.y.toFixed(5)}`;if(seen.has(key)||!segmentSafe(scene,p,p,avoid))return false;seen.add(key);return true;})
    .sort((a,b)=>{const delta=distance(a,requested)-distance(b,requested);return Math.abs(delta)>EPS?delta:distance(a,start)-distance(b,start);});
  for(const target of ranked){
    let path;
    if(segmentSafe(scene,start,target,avoid))path=[point(start),point(target)];
    else{
      let join=null,length=Infinity;
      for(const [id,travel] of cost){const gap=distance(base.points[id],target);if(gap<=190&&travel+gap<length&&segmentSafe(scene,base.points[id],target,avoid)){join=id;length=travel+gap;}}
      if(join===null)continue;
      path=[point(target)];for(let at=join;at!==null;at=parents.get(at))path.unshift(point(base.points[at]));path.unshift(point(start));
      const smooth=[path[0]];for(let i=0;i<path.length-1;){let j=path.length-1;while(j>i+1&&!segmentSafe(scene,path[i],path[j],avoid))j--;smooth.push(path[j]);i=j;}path=smooth;
    }
    return{path,target:point(target),requested:point(requested),snapped:distance(target,requested)>EPS};
  }
  return null;
}
const passingGraphs = new WeakMap();
function passingGraph(scene) {
  if(passingGraphs.has(scene))return passingGraphs.get(scene);
  const cached=graph(scene),base={points:[...cached.points],edges:cached.edges.map(links=>[...links])};
  for(const position of scene.navigation.zones.flatMap(p=>insetPolygon(p,scene.navigation.radius,scene))){
    if(!pointSafe(scene,position))continue;
    const id=base.points.length;base.points.push(position);base.edges.push([]);
    for(let i=0;i<id;i++){const length=distance(position,base.points[i]);if(length<=190&&segmentSafe(scene,position,base.points[i])){base.edges[id].push([i,length]);base.edges[i].push([id,length]);}}
  }
  passingGraphs.set(scene,base);
  return base;
}
export function findPassingPath(scene,start,leader,leaderPath,clearance,{startClearance=clearance,strict=false}={}){
  const avoid=[{...point(leader),radius:startClearance-scene.navigation.radius}],base=passingGraph(scene),cost=new Map(),parents=new Map(),queue=new Queue();
  const buildPath=id=>{
    const path=[];for(let at=id;at!==null;at=parents.get(at))path.unshift(point(base.points[at]));path.unshift(point(start));
    const smooth=[path[0]];for(let i=0;i<path.length-1;){let j=path.length-1;while(j>i+1&&!segmentSafe(scene,path[i],path[j],avoid))j--;smooth.push(path[j]);i=j;}return smooth;
  };
  if(!segmentSafe(scene,start,start,avoid))return null;
  for(let i=0;i<base.points.length;i++)if(distance(start,base.points[i])<=190&&segmentSafe(scene,start,base.points[i],avoid)){
    const length=distance(start,base.points[i]);cost.set(i,length);parents.set(i,null);queue.push({id:i,cost:length,score:length});
  }
  while(queue.values.length){
    const current=queue.pop();if(current.cost!==cost.get(current.id))continue;
    const position=base.points[current.id];
    if(clearOfFuturePath(position,position,leaderPath,clearance)){
      return buildPath(current.id);
    }
    for(const [id,length] of base.edges[current.id]){
      if(!segmentSafe(scene,position,base.points[id],avoid))continue;
      const value=current.cost+length;if(value>=(cost.get(id)??Infinity))continue;
      cost.set(id,value);parents.set(id,current.id);queue.push({id,cost:value,score:value});
    }
  }
  if(!strict)for(const [id] of [...cost].sort((a,b)=>a[1]-b[1]))if(findPath(scene,leader,leaderPath.at(-1),[{...base.points[id],radius:clearance-scene.navigation.radius}]))return buildPath(id);
  return null;
}

const companionSourceClearance=240;
export const companionClearance = scene => Math.max(2*scene.navigation.radius+6,Math.ceil(companionSourceClearance*(scene.catScale??.64)));

export function findCompanionPassage(scene,leader,follower,target,clearance=companionClearance(scene)) {
  const radius=scene.navigation.radius,initial=Math.min(clearance,distance(leader,follower));
  const avoid=p=>[{...point(p),radius:clearance-radius}];
  if(initial>=clearance-EPS){
    const path=findPath(scene,leader,target,avoid(follower));
    if(path)return {path,setup:[],clearance};
  }else if(leader.x>follower.x){
    const path=findPath(scene,leader,target,[{...point(follower),radius:initial-radius}]);
    const next=path?.[1];
    if(next&&next.x>=leader.x&&(leader.x-follower.x)*(next.x-leader.x)+(leader.y-follower.y)*(next.y-leader.y)>=0&&clearOfFuturePath(follower,follower,path.slice(1),clearance))return {path,setup:[],clearance};
  }
  const base=findPath(scene,leader,target);
  if(!base)return null;
  const yielding=findPassingPath(scene,follower,leader,base,clearance,{startClearance:initial,strict:true});
  if(yielding)return {path:base,setup:[{role:'follower',path:yielding}],clearance};
  const startAvoid=[{...point(follower),radius:initial-radius}];
  const candidates=graph(scene).points.filter(p=>distance(leader,p)<=2*clearance&&distance(p,follower)>=clearance&&segmentSafe(scene,leader,p,startAvoid))
    .sort((a,b)=>distance(leader,a)-distance(leader,b)).slice(0,32);
  for(const position of candidates){
    const path=findPath(scene,position,target);
    if(!path)continue;
    const escape=[point(leader),point(position)];
    if(clearOfFuturePath(follower,follower,path,clearance))return {path,setup:[{role:'leader',path:escape}],clearance};
    const passing=findPassingPath(scene,follower,position,path,clearance,{strict:true});
    if(passing)return {path,setup:[{role:'leader',path:escape},{role:'follower',path:passing}],clearance};
  }
  return null;
}
export function pathLength(path) { return path.slice(1).reduce((sum, p, i) => sum + distance(path[i], p), 0); }
export function alongPath(path, travel) {
  for (let i = 1; i < path.length; i++) { const length = distance(path[i - 1], path[i]); if (travel <= length) { const t = length ? travel / length : 0; return { x: path[i - 1].x + (path[i].x - path[i - 1].x) * t, y: path[i - 1].y + (path[i].y - path[i - 1].y) * t }; } travel -= length; }
  return point(path.at(-1));
}
