                                      
                                                                              
                          
                                                                                          
                                                                
 
                          
                      
                                 
                                      
                                  
 

const localDetails                                            = {
  'harbor.code-workshop.front-door': [[946, 404], [978, 403], [979, 470], [948, 471]],
  'harbor.test-lighthouse.front-door': [[783, 101], [805, 101], [805, 133], [783, 133]],
  'harbor.pier': [[320, 534], [347, 535], [346, 569], [321, 569]],
  'harbor.camp': [[1305, 544], [1318, 544], [1318, 563], [1305, 563]],
  'harbor.code-workshop.exit': [[155, 690], [181, 672], [182, 742], [157, 765]],
  'harbor.code-workshop.bench': [[1087, 368], [1128, 353], [1143, 360], [1170, 369], [1166, 376], [1136, 368], [1090, 376]],
  'harbor.code-workshop.anvil': [[1125, 667], [1169, 670], [1171, 653], [1235, 650], [1265, 664], [1274, 689], [1244, 704], [1176, 694], [1127, 685]],
};

const assetDetails                                            = {
  'harbor.agent-mailbox': [[403, 393], [585, 425], [568, 482], [383, 463]],
  'harbor.agent-tools': [[925, 289], [1084, 197], [1120, 210], [1148, 242], [1180, 246], [1216, 280], [1245, 284], [1220, 347], [999, 381]],
  'harbor.agent-records': [[593, 276], [802, 279], [744, 492], [677, 629], [642, 761], [480, 775], [543, 563]],
};

function points(polygon          )                {
  if (!polygon || polygon.length < 3) return null;
  const result = polygon.map(point => Array.isArray(point) ? [point[0], point[1]]          : [(point                 ).x, (point                 ).y]         );
  return result.every(point => point.every(Number.isFinite)) ? result : null;
}

export function physicalObjectCue(item         )                         {
  const detail = localDetails[item.id];
  if (detail) return detail;
  const assetDetail = assetDetails[item.id];
  if (assetDetail && item.asset) {
    const asset = item.asset;
    return assetDetail.map(([x, y]) => [asset.x + x / asset.naturalWidth * asset.width, asset.y + y / asset.naturalHeight * asset.height]         );
  }
  return points(item.doorPolygon);
}

export function physicalArtClip(item         )                {
  const polygon = points(item.highlightPolygon), asset = item.asset;
  if (!polygon || !asset || asset.width <= 0 || asset.height <= 0) return null;
  return `polygon(${polygon.map(([x, y]) => `${(x - asset.x) / asset.width * 100}% ${(y - asset.y) / asset.height * 100}%`).join(',')})`;
}

                           
                                   
                          
                         
                                                      
                                                                                                       
 

export function createObjectCueSelection() {
  let selected                = null;
  let hovered                = null;
  let focused                = null;
  let context                = null;
  let selectedReached = false;
  function clear() { selected = null; hovered = null; focused = null; selectedReached = false; }
  function resolve(view                 ) {
    const nextContext = `${view.physicalSceneId}/${view.leader}`;
    if (context !== null && context !== nextContext) clear();
    context = nextContext;
    if (!['ready', 'walking'].includes(view.phase)) { clear(); return null; }
    const eligible = new Map(view.hotspots.filter(item => view.nearby.some(near => near.id === item.id)).map(item => [item.id, item]));
    if (focused && !eligible.has(focused)) focused = null;
    if (hovered && !eligible.has(hovered)) hovered = null;
    if (selected && (!view.hotspots.some(item => item.id === selected) || selectedReached && !eligible.has(selected))) { selected = null; selectedReached = false; }
    if (selected && eligible.has(selected)) selectedReached = true;
    const id = [focused, hovered, selected].find(id => id !== null && eligible.has(id)) ?? view.nearby.find(item => eligible.has(item.id))?.id;
    const item = id ? eligible.get(id) : null;
    return item ? Object.freeze({ id: item.id, label: item.label, kind: item.kind, sceneId: view.physicalSceneId, leader: view.leader }) : null;
  }
  return Object.freeze({
    enter(id        ) { hovered = id; },
    leave(id        ) { if (hovered === id) hovered = null; },
    focus(id        ) { focused = id; },
    blur(id        ) { if (focused === id) focused = null; },
    select(id        ) { selected = id; hovered = null; focused = null; selectedReached = false; },
    clear, resolve,
    view: () => Object.freeze({ selected, active: hovered ?? focused ?? selected }),
  });
}


//# sourceURL=../typed/physical-object-cue.mts