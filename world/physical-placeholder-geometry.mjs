const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
function stroke(x1,y1,x2,y2,width){
 const length=Math.hypot(x2-x1,y2-y1),dx=(y2-y1)/length*width/2,dy=-(x2-x1)/length*width/2;
 return[[x1+dx,y1+dy],[x2+dx,y2+dy],[x2-dx,y2-dy],[x1-dx,y1-dy]];
}
const rotate=(polygon,cx,cy,angle)=>polygon.map(([x,y])=>[cx+(x-cx)*Math.cos(angle)-(y-cy)*Math.sin(angle),cy+(x-cx)*Math.sin(angle)+(y-cy)*Math.cos(angle)]);
export function placeholderSolidLayers(s){
 const [l,t,r,b]=s.bounds,w=r-l,h=b-t,cx=(l+r)/2,polygons=[],fronts=[];
 if(['building','waterworks','dome','greenhouse','tower'].includes(s.kind)){
  const top=t-(s.kind==='tower'?110:65);
  polygons.push(rect(l,t,w,h),[[l-22,t+14],[cx,top],[r+22,t+14]],rect(l-22,t+8,w+44,18));
  if(s.kind==='dome'){
   const curve=[];for(let i=0;i<=32;i++){const u=i/32,v=1-u;curve.push([v*v*(l-10)+2*v*u*cx+u*u*(r+10),v*v*(t+18)+2*v*u*(t-180)+u*u*(t+18)]);}polygons.push(curve);
  }
  if(s.kind==='tower')polygons.push(rect(cx-38,top-40,76,40),rect(cx-3.5,top-60,7,20));
 }else if(s.kind==='windmill'){
  polygons.push(rect(l+30,t+35,w-60,h-35),[[l+16,t+45],[cx,t-55],[r-16,t+45]],rect(cx-9,t-20,18,135),rect(cx-75,t+36,150,18),rect(cx-14,t+31,28,28));
 }else if(s.kind==='wheel'){
  polygons.push(Array.from({length:64},(_,i)=>[cx+Math.cos(i*Math.PI/32)*(w/2+6),(t+b)/2+Math.sin(i*Math.PI/32)*(w/2+6)]));
 }else if(s.kind==='fence'){
  polygons.push(rect(l,t,w,h),rect(l,t-6,w,8));for(let x=l;x<r;x+=45)polygons.push(rect(x,t-16,12,h+22));
 }else if(s.kind==='trees'){
  for(let x=l+30;x<r;x+=65)for(let y=t+35;y<b;y+=90){polygons.push(rect(x-7,y-5,14,45),[[x-38,y+6],[x,y-72],[x+38,y+6]],[[x-32,y-18],[x,y-90],[x+32,y-18]]);fronts.push(y+40,y+40,y+40);}
 }else if(s.kind==='mountain')polygons.push([[l,b],[cx,t-110],[r,b]]);
 else if(s.kind==='tent')polygons.push([[l,b],[cx,t],[r,b]]);
 else if(s.kind==='rock')polygons.push([[l,b-10],[l+15,t+40],[l+w*.4,t],[r-15,t+30],[r,b]]);
 else if(s.kind==='telescope'){
  polygons.push(rect(cx-65,b-35,130,30),stroke(cx,b-30,cx,b-110,14),stroke(cx-45,b-30,cx,b-100,11),stroke(cx+45,b-30,cx,b-100,11));
  for(const p of [rect(l,t+25,w,55),rect(l,t+17,18,71),rect(r-18,t+20,18,65)])polygons.push(rotate(p,cx,t+50,-25*Math.PI/180));
 }else{
  polygons.push(rect(l,t,w,h));
  if(['bench','records','stall'].includes(s.kind))polygons.push(rect(l-7,t-10,w+14,28));
  if(s.kind==='stall')polygons.push([[l-10,t],[l+10,t-60],[r-10,t-60],[r+10,t]]);
 }
 return polygons.map((polygon,i)=>({polygon,frontY:fronts[i]??b+(s.kind==='fence'?6:0)}));
}
export const placeholderSolidSilhouettes=s=>placeholderSolidLayers(s).map(layer=>layer.polygon);
export function placeholderOccluders(solids){
 return solids.flatMap(s=>placeholderSolidLayers(s).map(({polygon,frontY},index)=>({id:`${s.id}-${index}`,frontY,polygon:polygon.map(([x,y])=>({x,y}))})));
}
