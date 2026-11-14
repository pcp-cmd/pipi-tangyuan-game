import {pairSafe, segmentSafe} from './physical-navigation.mjs';
import {dedicatedServiceInterior} from './physical-service-interiors.mjs';

export const SERVICE_BUILDINGS = Object.freeze([
  Object.freeze({
    exteriorId:'market.exterior', entranceId:'market.closed-house', roomId:'market.closed-house.interior',
    sourceRoomId:'market.warehouse.interior', title:'旅人整备屋', page:'companions',
    serviceLabel:'伙伴整备台 · 选择领队', sourceTitle:'集市仓库',
    doorPolygon:[[594,342],[646,342],[646,413],[594,413]],
    description:'旅人整备屋可查看伙伴并切换实际领队；仓库与风车继续提供课程工作台。',
    artNotes:['临时复用集市仓库的室内图、可走地面和遮挡；专用整备屋美术待补。','这里使用现有伙伴页选择领队，不提供购买或补给结算。']
  }),
  Object.freeze({
    exteriorId:'workshop.exterior', entranceId:'workshop.closed-house', roomId:'workshop.closed-house.interior',
    sourceRoomId:'workshop.material-shed.interior', title:'旅人见闻室', page:'discoveries',
    serviceLabel:'见闻桌 · 查看已访地点', sourceTitle:'材料装配棚',
    doorPolygon:[[383,493],[428,493],[428,575],[383,575]],
    description:'旅人见闻室可翻看实际已访地点；钟表工坊与材料装配棚继续提供课程工作台。',
    artNotes:['临时复用材料装配棚的室内图、可走地面和遮挡；专用见闻室美术待补。','见闻页显示真实访问记录，不会把尚未到达的地点自动标为已访。']
  }),
  Object.freeze({
    exteriorId:'archive.exterior', entranceId:'archive.post-office', roomId:'archive.post-office.interior',
    sourceRoomId:'archive.records.interior', title:'旅程寄存邮局', page:'saves',
    serviceLabel:'寄存柜台 · 保存与恢复旅程', sourceTitle:'星图档案馆',
    doorPolygon:[[1253,218],[1305,218],[1305,302],[1253,302]],
    description:'旅程寄存邮局可导出完整旅程或导入到空位置；中央星图档案馆继续提供课程工作台。',
    artNotes:['临时复用星图档案馆的室内图、可走地面和遮挡；专用邮局美术待补。','柜台打开既有旅程存档页，不发送邮件，不另造存档格式。']
  })
]);

export function serviceJournalPage(hotspot) {
  return hotspot?.kind === 'inspect' && hotspot.uiAction === 'journal' &&
    ['companions','discoveries','saves'].includes(hotspot.journalPage) ? hotspot.journalPage : null;
}

function returnPair(scene, approach) {
  const pose = (x,y) => ({x,y,facing:'right'});
  for (const [dx,dy] of [[82,0],[-82,0],[0,82],[0,-82],[60,60],[-60,60],[60,-60],[-60,-60]]) {
    const cats={pipi:pose(approach.x,approach.y),tangyuan:pose(approach.x+dx,approach.y+dy)};
    if(pairSafe(scene,cats)&&segmentSafe(scene,cats.pipi,cats.tangyuan))return cats;
  }
  throw new Error(`No safe service-building return pair in ${scene.id}`);
}

export function addServiceBuildings(scenes, { dedicated = true } = {}) {
  const result=structuredClone(scenes);
  for(const definition of SERVICE_BUILDINGS) {
    const exterior=result.find(scene=>scene.id===definition.exteriorId);
    const source=result.find(scene=>scene.id===definition.sourceRoomId);
    const entrance=exterior?.hotspots.find(h=>h.id===definition.entranceId);
    if(!source||!entrance||result.some(scene=>scene.id===definition.roomId))throw new Error('Invalid service-building source or duplicate identity');
    const room=structuredClone(source), exit=room.hotspots.find(h=>h.return), service=room.hotspots.find(h=>h.kind==='workbench');
    if(room.hotspots.length!==2||!exit||!service)throw new Error('Service layout must contain one exit and one service desk');
    Object.assign(room,{id:definition.roomId,title:definition.title,parentSceneId:exterior.id,pairedExterior:exterior.id,
      artStatus:'temporary-reuse',artReuse:{sourceSceneId:source.id,sourceTitle:definition.sourceTitle},
      artNotice:`临时复用${definition.sourceTitle}室内 · 专用美术待补`,artNotes:[...definition.artNotes],
      missing:[...new Set([...source.missing,'dedicated-service-interior-art'])]});
    Object.assign(exit,{id:`${definition.entranceId}.exit`,fromSceneId:room.id,to:exterior.id,
      buildingId:definition.entranceId,pairedDoorId:definition.entranceId,label:`返回${exterior.title.replace(/ · .*$/,'')}`});
    Object.assign(service,{id:`${definition.entranceId}.service`,fromSceneId:room.id,kind:'inspect',
      label:definition.serviceLabel,uiAction:'journal',journalPage:definition.page});
    delete service.workbenchId;
    delete service.curriculumIslandId;
    if (dedicated) {
      const {exit:exitGeometry,desk:deskGeometry,...geometry} = dedicatedServiceInterior(room.id);
      Object.assign(room,geometry,{artStatus:'dedicated-candidate',artNotice:'',artNotes:[definition.description],missing:['occlusion-browser-review','final-art-approval']});
      delete room.artReuse;
      Object.assign(exit,exitGeometry); Object.assign(service,deskGeometry);
      exit.doorPolygon=structuredClone(exitGeometry.highlightPolygon);
      for (const object of [exit,service]) {
        const xs=object.highlightPolygon.map(p=>p[0]),ys=object.highlightPolygon.map(p=>p[1]);
        object.hitbox={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
      }
    }
    room.doors=[exit];
    Object.assign(entrance,{kind:'door',label:`进入${definition.title}`,to:room.id,fromSceneId:exterior.id,
      buildingId:definition.entranceId,pairedDoorId:exit.id,doorPolygon:structuredClone(definition.doorPolygon),
      arrival:structuredClone(room.spawn),returnArrival:returnPair(exterior,entrance.approach)});
    exterior.doors=exterior.hotspots.filter(h=>h.kind==='door');
    exterior.artNotes=exterior.artNotes.filter(note=>!note.includes('未开放')&&!note.includes('没有对应室内'));
    exterior.artNotes.push(definition.description,...(dedicated?[]:[definition.artNotes[0]]));
    result.push(room);
  }
  return result;
}
