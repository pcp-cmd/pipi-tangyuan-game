import {placeholderSolidSilhouettes} from './physical-placeholder-geometry.mjs';
import {findPath} from './physical-navigation.mjs';
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const polygon = (points,fill,extra='') => `<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
const rect = (x,y,w,h,fill,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const label = (x,y,text,size=24,fill='#f1e5bf') => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="middle">${escape(text)}</text>`;
const line = (x1,y1,x2,y2,color,width=6) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
function solidArt(s,p) {
 const [l,t,r,b]=s.bounds,w=r-l,h=b-t,cx=(l+r)/2;
 let out=rect(l+8,t+12,w,h,'#233f3c','opacity=".3"');
 if(['building','waterworks','dome','greenhouse','tower'].includes(s.kind)){
  out+=rect(l,t,w,h,'#c3b28a')+rect(l+12,t+12,w-24,h-20,'#d3c39c');
  const top=t-(s.kind==='tower'?110:65);
  out+=polygon([[l-22,t+14],[cx,top],[r+22,t+14]],p.roof)+rect(l-22,t+8,w+44,18,'#334f51');
  if(s.kind==='dome')out+=`<path d="M${l-10} ${t+18}Q${cx} ${t-180} ${r+10} ${t+18}Z" fill="${p.roof}"/>`;
  if(s.kind==='greenhouse'){
   for(let x=l+20;x<r-20;x+=60)out+=rect(x,t+20,42,h-45,'#9ac4b7')+line(x,t+20,x,b-25,'#678a7d',4);
  }else{
   out+=rect(l+24,t+40,44,52,'#496b74')+rect(r-68,t+40,44,52,'#496b74');
  }
  out+=rect(cx-33,b-75,66,75,'#304d4b')+rect(cx-25,b-67,50,67,'#4e6459')+rect(cx-28,b-7,56,7,'#dbcba0');
  if(s.kind==='tower')out+=rect(cx-38,top-40,76,40,'#e1c274')+line(cx,top-60,cx,top-40,'#435a59',7);
 }else if(s.kind==='windmill'){
  out+=rect(l+30,t+35,w-60,h-35,'#c7b78c')+polygon([[l+16,t+45],[cx,t-55],[r-16,t+45]],p.roof);
  out+=line(cx,t-20,cx,t+115,'#d8c99e',18)+line(cx-75,t+45,cx+75,t+45,'#d8c99e',18)+rect(cx-14,t+31,28,28,'#826b4d');
  out+=rect(cx-28,b-65,56,65,'#304d4b')+rect(cx-20,b-57,40,57,'#4e6459')+rect(cx-24,b-7,48,7,'#dbcba0');
 }else if(s.kind==='wheel'){
  out+=`<circle cx="${cx}" cy="${(t+b)/2}" r="${w/2}" fill="#73654d" stroke="#ccb481" stroke-width="12"/>`;
  for(let a=0;a<Math.PI*2;a+=Math.PI/4)out+=line(cx,(t+b)/2,cx+Math.cos(a)*w/2,(t+b)/2+Math.sin(a)*w/2,'#c8ad79',7);
 }else if(s.kind==='fence'){
  out+=rect(l,t,w,h,'#7c674c')+rect(l,t-6,w,8,'#d0ba88');
  for(let x=l;x<r;x+=45)out+=rect(x,t-16,12,h+22,'#b19a70');
 }else if(s.kind==='trees'){
  for(let x=l+30;x<r;x+=65)for(let y=t+35;y<b;y+=90)out+=rect(x-7,y-5,14,45,'#7e6a4e')+polygon([[x-38,y+6],[x,y-72],[x+38,y+6]],'#3e6650')+polygon([[x-32,y-18],[x,y-90],[x+32,y-18]],'#4b7953');
 }else if(s.kind==='mountain'){
  out+=polygon([[l,b],[cx,t-110],[r,b]],'#8d9fa2')+polygon([[cx-65,t+20],[cx,t-110],[cx+65,t+20],[cx+20,t-8],[cx,t+10],[cx-24,t-12]],'#e4ebe4');
 }else if(s.kind==='tent'){
  out+=polygon([[l,b],[cx,t],[r,b]],'#9b8a67')+polygon([[l+30,b],[cx,t+34],[r-30,b]],'#d0c09a')+polygon([[cx-36,b],[cx,t+65],[cx+36,b]],'#435954');
 }else if(s.kind==='rock'){
  out+=polygon([[l,b-10],[l+15,t+40],[l+w*.4,t],[r-15,t+30],[r,b]],'#7d8d88')+polygon([[l+20,t+45],[l+w*.4,t+8],[r-22,t+36],[r-50,t+60]],'#a0ada2');
 }else if(s.kind==='telescope'){
  out+=rect(cx-65,b-35,130,30,'#807351')+line(cx,b-30,cx,b-110,'#b8a77b',14)+line(cx-45,b-30,cx,b-100,'#b8a77b',11)+line(cx+45,b-30,cx,b-100,'#b8a77b',11);
  out+=`<g transform="rotate(-25 ${cx} ${t+50})">${rect(l,t+25,w,55,'#a5b4ae')}${rect(l,t+17,18,71,'#4a6770')}${rect(r-18,t+20,18,65,'#cfbe88')}</g>`;
 }else if(s.kind==='lantern'){
  out+=rect(l,t,w,h,'#85734f')+rect(l+12,t+12,w-24,h-66,'#d6c374')+rect(l+36,t+32,w-72,h-106,'#f4e7a7')+rect(l,b-45,w,45,'#687d71');
  for(let x=l+28;x<r;x+=68)out+=rect(x,t+10,8,h-65,'#b59a5b');
  out+=rect(l+15,b-26,w-30,10,'#d5c08a');
 }else if(s.kind==='beds'){
  out+=rect(l,t,w,h,'#79654b');
  for(let y=t+15;y<b-10;y+=35)for(let x=l+18;x<r-10;x+=42)out+=rect(x,y,22,14,'#436c4e')+rect(x+6,y-7,10,10,'#85a867');
 }else if(s.kind==='shelves'){
  out+=rect(l,t,w,h,'#76634b');
  for(let y=t+15;y<b-10;y+=65){out+=rect(l+8,y,w-16,40,'#d1be8e');for(let x=l+15;x<r-15;x+=28)out+=rect(x,y+5,17,31,x%3?'#718b81':'#b98560');}
 }else if(s.kind==='crates'){
  out+=rect(l,t,w,h,'#ad8f61');
  for(let y=t+8;y<b-10;y+=70)for(let x=l+8;x<r-10;x+=75)out+=rect(x,y,60,55,'#bda575','stroke="#806a4c" stroke-width="6"')+line(x,y,x+60,y+55,'#806a4c',5);
 }else{
  out+=rect(l,t,w,h,'#8b7656')+rect(l-7,t-10,w+14,28,'#c9b586');
  if(s.kind==='records')out+=rect(l+30,t+30,w-60,h-55,'#dfd4af')+line(l+45,t+60,r-45,b-40,'#7b9c92',4);
  else if(s.kind==='stall')out+=polygon([[l-10,t],[l+10,t-60],[r-10,t-60],[r+10,t]],p.roof);
  else out+=rect(l+25,t+20,w-50,Math.max(10,h-35),'#d9cda9')+rect(l+30,t+26,40,12,'#668d81');
 }
 out=`<g clip-path="url(#solid-${s.id})">${out}</g>`;
 if(s.label)out+=rect(cx-105,b+8,210,32,'#354e49')+label(cx,b+32,s.label,20);
 return out;
}
export function renderPlaceholderScene(scene) {
 const {land,solids,waters,palette:p}=scene.placeholderLayout;
 const indoor=scene.kind==='interior';
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" role="img" aria-labelledby="title desc" shape-rendering="crispEdges"><title id="title">${escape(scene.title)}</title><desc id="desc">工程占位场景，非正式美术。可行走地面、建筑门、桥梁、水域与实物碰撞对应场景注册表。</desc><g font-family="Noto Sans CJK SC,Microsoft YaHei,sans-serif">`;
 out+=`<defs>${solids.map(s=>`<clipPath id="solid-${s.id}">${placeholderSolidSilhouettes(s).map(points=>polygon(points,'#fff')).join('')}</clipPath>`).join('')}</defs>`;
 out+=rect(0,0,scene.width,scene.height,indoor?'#223c3f':p.water);
 if(indoor){
  out+=rect(130,210,1270,740,'#6e725f')+polygon(land,'#b1a383');
  for(let y=310;y<920;y+=42)out+=line(180,y,1350,y,'#a09376',3);
  out+=rect(125,220,1270,60,p.roof)+rect(125,280,55,480,'#8f8a70')+rect(125,890,55,60,'#8f8a70')+rect(1350,280,50,670,'#8f8a70');
  out+=rect(125,760,55,130,'#33514c')+rect(125,760,10,130,'#d3c398')+rect(125,760,55,10,'#d3c398');
  if(scene.entranceKind==='stairs')for(let i=0;i<5;i++)out+=rect(130+i*16,770+i*18,70,14,'#c5b588')+rect(130+i*16,781+i*18,70,4,'#796f58');
 }else{
  for(let y=100;y<1000;y+=100)for(let x=(y%200?40:100);x<1600;x+=190)out+=rect(x,y,60,4,'#a3c0b2','opacity=".2"');
  out+=polygon(land,'#c7bb8c','stroke="#d9cda2" stroke-width="30"')+polygon(land,p.land);
  if(scene.kind==='island'){
   out+=rect(680,800,280,175,'#9e8b61');
   for(let y=812;y<970;y+=22)out+=line(686,y,954,y,'#6f6650',4);
   out+=rect(672,810,14,163,'#d0ba82')+rect(954,810,14,163,'#d0ba82');
  }
  for(let y=310;y<860;y+=94)for(let x=270+(y%30);x<1320;x+=115)out+=rect(x,y,7,6,'#acbc85','opacity=".34"');
  const roadScene={...scene,navigation:{...scene.navigation,radius:42}};
  for(const h of scene.hotspots){
   const path=findPath(roadScene,scene.spawn.pipi,h.approach)||findPath(scene,scene.spawn.pipi,h.approach);
   if(path)out+=`<polyline points="${path.map(p=>`${p.x},${p.y}`).join(' ')}" stroke="#b5ac7f" stroke-width="60" stroke-linejoin="round" fill="none"/>`;
  }
  if(scene.kind==='island')out+=polygon([[995,905],[1150,905],[1120,953],[1022,953]],'#7b694f')+rect(1010,910,125,14,'#d3bd8e')+line(1070,910,1070,830,'#d3bd8e',7)+polygon([[1076,840],[1076,900],[1132,900]],p.accent);

 }
 for(const water of waters){
  const [l,t,r,b]=water.bounds;
  out+=rect(l-10,t-10,r-l+20,b-t+20,'#a9a982')+rect(l,t,r-l,b-t,p.water);
  for(let y=t+25;y<b;y+=45)out+=line(l+20,y,r-20,y,'#7daba9',4);
  if(water.bridgeY){
   const [top,bottom]=water.bridgeY;out+=rect(l-25,top,r-l+50,bottom-top,'#b69e6e');
   for(let x=l-20;x<r+20;x+=24)out+=line(x,top+8,x,bottom-8,'#776d51',4);
   out+=line(l-25,top,l-25,bottom,'#d1bd8f',7)+line(r+25,top,r+25,bottom,'#d1bd8f',7);
  }
 }
 for(const s of solids)out+=solidArt(s,p);
 for(const h of scene.hotspots){
  if(h.kind==='door'&&!h.return&&!solids.some(s=>h.x>=s.bounds[0]&&h.x<=s.bounds[2]&&Math.abs(h.y-s.bounds[3])<20))out+=rect(h.x-48,h.y-48,96,52,'#8e805b')+label(h.x,h.y-14,h.label,16);
  if(h.return&&!indoor)out+=rect(h.x-95,h.y-32,190,30,'#445f50')+label(h.x,h.y-10,'来路 · 返回',20);
  out+=rect(h.approach.x-13,h.approach.y-5,26,10,'#e8d49d','opacity=".8"');
 }
 out+=rect(38,28,scene.width-76,74,'#243f3c')+rect(38,28,8,74,p.accent)+label(scene.width/2,61,scene.title.replace(' · 工程占位',''),27)+label(scene.width/2,88,'工程占位 · 非正式美术',18,'#d7c28b');
 out+=label(scene.width/2,scene.height-20,scene.entranceKind==='stairs'?'楼梯返回下层 · 走近工作台或观察台互动':indoor?'门口返回来处 · 走近工作台后交互':'船埠与路口连接实景 · 黄色短标为互动落脚点',17,'#ede0bc');
 return out+'</g></svg>\n';
}
