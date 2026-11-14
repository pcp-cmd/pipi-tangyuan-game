const existing={
 'assets/scene-background.png':{
  'harbor.code-workshop.front-door':[[874,390],[911,365],[977,283],[991,261],[1033,268],[1040,252],[1070,253],[1079,274],[1144,271],[1220,355],[1226,329],[1233,329],[1233,348],[1286,350],[1286,407],[1233,412],[1238,475],[1080,482],[1011,471],[996,484],[918,483],[877,478]],
  'harbor.test-lighthouse.front-door':[[742,379],[754,349],[766,180],[755,166],[757,140],[772,135],[772,105],[765,99],[769,89],[808,59],[811,12],[820,12],[819,57],[863,90],[868,99],[858,108],[860,135],[876,145],[876,167],[863,182],[880,346],[864,366],[818,379],[819,402],[765,403]],
  'harbor.pier':[[8,674],[197,636],[211,672],[317,685],[342,641],[357,670],[453,646],[470,683],[565,681],[584,789],[626,793],[663,824],[715,857],[750,899],[654,930],[603,992],[551,1001],[549,932],[507,922],[483,980],[428,977],[431,906],[344,890],[320,925],[287,917],[289,872],[233,851],[217,889],[178,876],[182,828],[95,811],[93,753],[15,740]],
  'harbor.camp':[[1160,610],[1182,550],[1200,535],[1220,550],[1278,489],[1288,457],[1300,458],[1317,474],[1397,473],[1392,413],[1405,407],[1406,419],[1462,417],[1464,489],[1454,511],[1409,509],[1409,528],[1472,579],[1479,615],[1407,629],[1283,625],[1245,638],[1172,638]]
 },
 'assets/rooms/harbor.code-workshop.interior-v4.png':{
  exit:[[25,608],[63,531],[332,531],[340,568],[331,647],[331,940],[299,944],[56,947],[56,648]],
  bench:[[1026,350],[1093,350],[1127,331],[1154,345],[1205,351],[1208,328],[1278,329],[1283,351],[1315,351],[1320,399],[1310,473],[1274,473],[1270,413],[1077,412],[1075,473],[1036,473]]
 },
 'assets/rooms/harbor.test-lighthouse.interior-v2.png':{
  exit:[[220,454],[252,417],[307,415],[319,402],[353,354],[403,319],[449,323],[499,359],[541,420],[554,477],[550,678],[488,682],[348,772],[221,803]],
  bench:[[621,442],[691,414],[709,365],[864,357],[895,421],[906,440],[901,535],[871,542],[868,480],[684,490],[683,560],[655,566],[630,545]],
  stairs:[[1009,141],[1039,129],[1093,137],[1121,158],[1149,197],[1152,220],[1176,259],[1181,283],[1200,323],[1214,342],[1237,382],[1247,416],[1262,445],[1267,475],[1280,515],[1285,547],[1279,584],[1272,612],[1241,680],[1204,698],[1119,676],[1084,674],[1080,524],[1107,508],[1122,454],[1123,400],[1093,331],[1061,270],[1037,204]]
 },
 'assets/rooms/observatory.waterworks.interior-v1.png':{
  exit:[[205,652],[230,631],[322,690],[329,781],[471,805],[471,944],[300,970],[207,880]],
  bench:[[569,406],[688,399],[698,387],[866,386],[881,411],[961,410],[968,444],[957,514],[927,517],[924,458],[610,460],[611,520],[584,517],[578,448]]
 },
 'assets/rooms/beacon.dispatch-tower.interior-v3.png':{
  exit:[[94,622],[118,580],[176,554],[231,561],[282,598],[320,651],[348,704],[348,919],[284,929],[109,885]],
  bench:[[600,304],[609,183],[646,122],[680,99],[770,88],[851,99],[883,160],[892,281],[920,302],[919,352],[900,372],[900,438],[872,439],[869,361],[645,362],[645,438],[615,437],[610,352],[595,341]],
  map:[[175,253],[464,140],[476,149],[477,358],[528,414],[528,450],[504,464],[504,522],[473,535],[471,477],[287,553],[289,598],[259,606],[258,565],[181,534]],
  'stairs-up':[[881,0],[1038,0],[1061,42],[1096,97],[1152,128],[1204,171],[1236,224],[1244,252],[1225,289],[1217,318],[1191,356],[1191,407],[1163,449],[1176,473],[1175,577],[1146,594],[1134,537],[1033,490],[1026,332],[1058,307],[1094,250],[1105,205],[1055,152],[997,111],[888,69]]
 },
 'assets/rooms/protocol.workshop.interior-v3.png':{
  exit:[[113,696],[158,675],[158,639],[184,627],[397,666],[398,948],[356,965],[133,976],[113,968]],
  bench:[[517,551],[551,510],[578,505],[578,479],[613,447],[641,452],[645,477],[664,444],[693,450],[691,511],[725,508],[730,485],[747,489],[751,513],[909,507],[910,496],[995,510],[1010,546],[1007,690],[968,710],[941,708],[940,627],[580,607],[579,675],[535,674]]
 },
 'assets/rooms/workshop.clockworks.interior-v1.png':{
  exit:[[42,625],[67,619],[158,653],[160,753],[287,801],[313,813],[344,823],[343,932],[289,952],[137,902],[45,862]],
  bench:[[603,395],[616,364],[646,364],[648,328],[670,309],[693,315],[706,348],[705,366],[751,362],[750,304],[780,282],[810,279],[814,255],[825,254],[831,283],[869,297],[885,327],[888,366],[954,363],[958,348],[981,346],[983,364],[1014,368],[1026,408],[1016,540],[988,543],[984,431],[652,431],[651,540],[621,540]]
 }
};
const ownedOccluders={
 'harbor.exterior':{'harbor.code-workshop.front-door':[],'harbor.test-lighthouse.front-door':[],'harbor.pier':[],'harbor.camp':[]},
 'harbor.code-workshop.interior':{'harbor.code-workshop.exit':['door-leaf','door-right-post'],'harbor.code-workshop.bench':[]},
 'harbor.test-lighthouse.interior':{'harbor.test-lighthouse.exit':['open-door','door-right-pier'],'harbor.test-lighthouse.bench':[],'harbor.test-lighthouse.stairs':['stairs-front-post']},
 'workshop.clockworks.interior':{'workshop.clockworks.exit':['front-left-pier'],'workshop.clockworks.bench':[]},
 'observatory.waterworks.interior':{'observatory.waterworks.exit':[],'observatory.waterworks.bench':[]},
 'beacon.dispatch-tower.interior':{'beacon.dispatch-tower.exit':['entry-right-pier'],'beacon.dispatch-tower.bench':[],'beacon.dispatch-tower.map':[],'beacon.dispatch-tower.stairs-up':[]},
 'protocol.workshop.interior':{'protocol.workshop.exit':['entry-frame'],'protocol.workshop.bench':[]},
 'market.exterior':{'market.port':[],'market.warehouse.front-door':['warehouse'],'market.forest.front-door':[],'market.windmill':['windmill'],'market.closed-house':[]},
 'workshop.exterior':{'workshop.port':[],'workshop.clockworks.front-door':['clockworks'],'workshop.material-shed.front-door':['material-shed'],'workshop.yard':[],'workshop.closed-house':['small-house']},
 'archive.exterior':{'archive.port':[],'archive.records.front-door':['records'],'archive.garden.front-door':[],'archive.post-office':['post-office']},
 'observatory.exterior':{'observatory.port':[],'observatory.waterworks.front-door':['waterworks'],'observatory.summit.front-door':[]},
 'beacon.exterior':{'beacon.port':[],'beacon.dispatch-tower.front-door':['dispatch-tower'],'beacon.signal':[]},
 'protocol.exterior':{'protocol.port':[],'protocol.workshop.front-door':['protocol-workshop'],'protocol.camp':['camp-tent']},
 'market.forest.exterior':{'market.forest.exit':[],'market.forest.bench':['forest-workbench']},
 'archive.garden.exterior':{'archive.garden.exit':[],'archive.greenhouse.front-door':['greenhouse'],'archive.garden.bench':['garden-workbench']},
 'observatory.summit.exterior':{'observatory.summit.exit':[],'observatory.summit-observatory.front-door':['summit-observatory'],'observatory.summit.bench':[]},
 'market.warehouse.interior':{'market.warehouse.exit':[],'market.warehouse.bench':['warehouse-workbench']},
 'market.windmill.interior':{'market.windmill.exit':[],'market.windmill.bench':['windmill-bench']},
 'workshop.material-shed.interior':{'workshop.material-shed.exit':[],'workshop.material-shed.bench':['assembly-bench']},
 'archive.records.interior':{'archive.records.exit':[],'archive.records.bench':['records-workbench']},
 'archive.greenhouse.interior':{'archive.greenhouse.exit':[],'archive.greenhouse.bench':['sample-bench']},
 'harbor.test-lighthouse.observation-room':{'harbor.test-lighthouse.stairs-down':['stair-rail'],'harbor.test-lighthouse.observation-room.bench':['test-workbench'],'harbor.test-lighthouse.observation-room.chart':['test-chart']},
 'beacon.dispatch-tower.lantern-room':{'beacon.dispatch-tower.stairs-down':['lantern-stair-rail'],'beacon.dispatch-tower.lantern-room.bench':['beacon-lens'],'beacon.dispatch-tower.lantern-room.chart':['lantern-chart']},
 'observatory.summit.interior':{'observatory.summit-observatory.exit':[],'observatory.summit-observatory.bench':['summit-workbench']}
};
const previews={'candidate.workshop.clockworks':'workshop.clockworks.interior','candidate.observatory.waterworks':'observatory.waterworks.interior','candidate.beacon.dispatch-tower':'beacon.dispatch-tower.interior','candidate.protocol.workshop':'protocol.workshop.interior'};
export function applyObjectOutlines(scenes){
 for(const scene of scenes)for(const hotspot of scene.hotspots){
  const source=existing[scene.background],polygon=hotspot.highlightPolygon||source?.[hotspot.id]||source?.[hotspot.id.split('.').at(-1)];
  if(!polygon)throw new Error(`Missing object outline for ${scene.id} ${hotspot.id}`);
  hotspot.highlightPolygon=structuredClone(polygon);
  const ownerScene=previews[scene.id]||scene.id,ownerId=previews[scene.id]?`${ownerScene.replace(/\.interior$/,'')}.${hotspot.id.split('.').at(-1)}`:hotspot.id;
  const ids=ownedOccluders[ownerScene]?.[ownerId];
  if(!ids||ids.some(id=>!scene.occluders.some(mask=>mask.id===id)))throw new Error(`Missing object occluder ownership for ${scene.id} ${hotspot.id}`);
  hotspot.highlightOccluderIds=[...ids];
  if(hotspot.kind==='door'&&!hotspot.doorPolygon)hotspot.doorPolygon=[[hotspot.x-22,hotspot.y-32],[hotspot.x+22,hotspot.y-32],[hotspot.x+22,hotspot.y+32],[hotspot.x-22,hotspot.y+32]];
 }
 return scenes;
}
