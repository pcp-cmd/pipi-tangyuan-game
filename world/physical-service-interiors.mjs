const rect = (l,t,r,b) => [[l,t],[r,t],[r,b],[l,b]];
const pose = (x,y,facing='left') => ({x,y,facing});
const mask = (id,frontY,polygon) => ({id,frontY,polygon:polygon.map(([x,y])=>({x,y}))});

export const SERVICE_INTERIOR_GEOMETRY_VERSION = 'dedicated-service-interiors-20261114-v1';
export const SERVICE_INTERIORS = {
  'market.closed-house.interior': {
    assetSha256:'315c4aa7d8ed90c9cc6c06134dbd53d535204417c9fc5ab3826c294007141add',
    originalPng:{path:'assets/service-interiors/market.closed-house.interior-candidate-v1.png',sha256:'374c42494ce7bac38b3724e3c0af3687cb1d1093d695ad7424e5cc3083c138bd'},
    spawn:{pipi:pose(1045,740),tangyuan:pose(1045,645)},
    zones:[rect(475,535,1135,640),[[380,575],[475,535],[1135,535],[1180,585],[1120,675],[450,704]],rect(970,620,1130,850)],
    blocks:[[416,400,613,527],[650,380,990,515],[1102,395,1190,504],[936,697,973,884],[1135,640,1185,860]],
    exit:{x:1050,y:756,approach:{x:1050,y:813},radius:30,highlightPolygon:[[937,701],[954,637],[989,605],[1040,587],[1092,597],[1134,631],[1157,680],[1162,856],[1135,880],[966,891],[938,865]],highlightOccluderIds:['entry-arch','entry-left-post','entry-right-post']},
    desk:{x:815,y:427,approach:{x:815,y:568},radius:35,highlightPolygon:[[648,400],[742,382],[857,378],[986,396],[989,429],[972,440],[968,491],[947,494],[944,446],[726,467],[726,511],[696,513],[690,450],[650,429]],highlightOccluderIds:['preparation-table']},
    occluders:[
      mask('front-left-wall',946,[[167,391],[452,700],[938,650],[940,885],[445,956],[170,748]]),
      mask('front-right-wall',920,[[1152,606],[1213,588],[1338,418],[1352,728],[1158,870]]),
      mask('entry-arch',895,[[937,701],[954,637],[989,605],[1040,587],[1092,597],[1134,631],[1157,680],[1124,684],[1102,650],[1063,632],[1032,634],[994,652],[976,690]]),
      mask('entry-left-post',895,[[937,689],[975,686],[974,878],[938,889]]),
      mask('entry-right-post',895,[[1126,672],[1160,675],[1162,858],[1128,865]]),
      mask('preparation-table',515,[[648,400],[742,382],[857,378],[986,396],[989,429],[972,440],[968,491],[947,494],[944,446],[726,467],[726,511],[696,513],[690,450],[650,429]]),
    ],
  },
  'workshop.closed-house.interior': {
    assetSha256:'b6d3e8a4993f88ba10a2321aeb109011f8e8f2d3eaba683593c34526804dc927',
    originalPng:{path:'assets/service-interiors/workshop.closed-house.interior-candidate-v1.png',sha256:'8c3b8da7617a361396954a6f7ee4c52aabcd2d2afce6e887a7e4314ff1a1e9bf'},
    spawn:{pipi:pose(1040,660),tangyuan:pose(940,685)},
    waypoints:[{x:1128,y:680},{x:1128,y:760}],
    zones:[rect(570,610,1070,790),rect(900,585,1158,710),rect(1090,650,1156,870),[[420,690],[570,610],[900,610],[1060,650],[760,850],[660,865],[420,792]]],
    blocks:[[324,468,563,675],[653,395,1000,584],[991,441,1080,580],[765,734,1065,970],[1061,709,1104,897],[1158,625,1230,829]],
    exit:{x:1130,y:755,approach:{x:1128,y:814},radius:27,highlightPolygon:[[1038,618],[1071,565],[1133,530],[1178,536],[1273,582],[1257,607],[1235,613],[1248,858],[1094,898],[1064,895],[1061,653]],highlightOccluderIds:['entry-roof','entry-left-post','open-door']},
    desk:{x:825,y:441,approach:{x:875,y:632},radius:35,highlightPolygon:[[654,410],[707,387],[794,390],[998,444],[998,479],[980,490],[972,582],[937,588],[929,509],[841,486],[822,582],[776,587],[711,569],[713,492],[662,535],[657,448]],highlightOccluderIds:['journal-desk']},
    occluders:[
      mask('front-left-wall',951,[[126,442],[421,645],[417,808],[775,890],[771,977],[389,929],[126,716]]),
      mask('front-window-wall',980,[[766,735],[1056,652],[1102,665],[1101,901],[780,976]]),
      mask('entry-roof',905,[[1038,618],[1071,565],[1133,530],[1178,536],[1273,582],[1257,607],[1225,614],[1161,581],[1110,615],[1086,665],[1055,656]]),
      mask('entry-left-post',905,[[1061,650],[1103,650],[1101,888],[1064,897]]),
      mask('open-door',852,[[1161,627],[1215,616],[1230,640],[1228,824],[1164,793]]),
      mask('journal-desk',588,[[654,410],[707,387],[794,390],[998,444],[998,479],[980,490],[972,582],[937,588],[929,509],[841,486],[822,582],[776,587],[711,569],[713,492],[662,535],[657,448]]),
    ],
  },
  'archive.post-office.interior': {
    assetSha256:'a493fe83424a9098e08bb06dedb0c71cdfaa0f5b98e3d65530c0e0b17312e257',
    originalPng:{path:'assets/service-interiors/archive.post-office.interior-candidate-v1.png',sha256:'85825a82c01181fd9517c1864443698941ba3dc3354bddd83e4b0d375ff59c24'},
    spawn:{pipi:pose(1005,713),tangyuan:pose(1005,620)},
    zones:[[[360,490],[685,370],[935,440],[980,520],[905,620],[520,668]],[[850,460],[965,470],[1060,540],[1060,655],[945,655],[820,570]],rect(930,545,1080,805)],
    blocks:[[299,281,595,437],[594,239,673,371],[687,149,939,405],[849,639,932,835],[1080,579,1158,793]],
    exit:{x:1005,y:689,approach:{x:1005,y:765},radius:30,highlightPolygon:[[787,595],[990,344],[1035,347],[1197,518],[1149,556],[1154,779],[1095,798],[933,838],[878,834],[850,814],[845,639]],highlightOccluderIds:['entry-gable','entry-left-pier','entry-right-pier']},
    desk:{x:480,y:326,approach:{x:625,y:466},radius:35,highlightPolygon:[[298,358],[420,301],[522,273],[594,295],[658,273],[675,288],[669,359],[594,383],[590,414],[396,484],[306,464]],highlightOccluderIds:['deposit-counter']},
    occluders:[
      mask('front-window-wall',918,[[269,449],[523,645],[846,610],[845,836],[519,911],[268,687]]),
      mask('entry-gable',843,[[787,595],[990,344],[1035,347],[1197,518],[1149,556],[1040,515],[978,533],[931,561],[885,642]]),
      mask('entry-left-pier',843,[[851,589],[895,575],[936,614],[932,820],[879,835],[847,814]]),
      mask('entry-right-pier',807,[[1076,566],[1129,580],[1154,778],[1096,787],[1072,761]]),
      mask('deposit-counter',485,[[298,358],[420,301],[522,273],[594,295],[658,273],[675,288],[669,359],[594,383],[590,414],[396,484],[306,464]]),
    ],
  },
};
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
freeze(SERVICE_INTERIORS);

export function dedicatedServiceInterior(roomId) {
  const source = SERVICE_INTERIORS[roomId];
  if (!source) throw new RangeError('Unknown dedicated service interior');
  const data = structuredClone(source);
  return {
    width:1536,height:1024,background:`assets/service-interiors/${roomId}-candidate-v1.webp`,assetSha256:data.assetSha256,originalPng:data.originalPng,
    geometryVersion:SERVICE_INTERIOR_GEOMETRY_VERSION,catScale:0.64,spawn:data.spawn,occluders:data.occluders,
    navigation:{radius:22,speed:180,followGap:90,gridStep:16,zones:data.zones,blocks:data.blocks,waypoints:[...Object.values(data.spawn),data.exit.approach,data.desk.approach,...(data.waypoints??[])]},
    exit:data.exit,desk:data.desk,
  };
}
