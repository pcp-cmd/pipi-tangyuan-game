                                                                      
                                                                                 
                                                                               
                                                              

                        
                      
                     
                     
                     
                     
                      
                      
                          
                                    
                                
 

                           
                     
                     
                         
                          
                        
                                
 

export const WORKSHOP_LAYOUT_VERSION = 'harbor-workshop-layout-20261116-v3';
export const WORKSHOP_OBJECT_PLACEMENT                                            = Object.freeze({
  'harbor.agent-mailbox': Object.freeze({ x: 310, y: 356, width: 215, frontY: 540, block: [384, 515, 450, 541]         , approach: { x: 450, y: 620 } }),
  'harbor.agent-tools': Object.freeze({ x: 900, y: 380, width: 285, frontY: 562, block: [937, 510, 1149, 562]         , approach: { x: 1010, y: 625 } }),
  'harbor.agent-records': Object.freeze({ x: 1170, y: 278, width: 185, frontY: 474, block: [1218, 370, 1307, 384]         , approach: { x: 1200, y: 595 } }),
});

export const WORKSHOP_BENCH_APPROACH             = Object.freeze({ x: 1185, y: 600 });

export function placeWorkshopObjects                        (entries              )      {
  return entries.map(entry => {
    const placement = WORKSHOP_OBJECT_PLACEMENT[entry.id];
    if (!placement) throw new Error(`Missing workshop placement: ${entry.id}`);
    return {
      ...structuredClone(entry), x: placement.x, y: placement.y, w: placement.width,
      h: placement.width * entry.ih / entry.iw, floorY: placement.frontY,
      block: [...placement.block], approach: { ...placement.approach },
    };
  });
}

export function migrateLayoutPoses                   (
  poses   ,
  fallback   ,
  valid                       ,
)    {
  if (valid(poses)) return structuredClone(poses);
  if (!valid(fallback)) throw new TypeError('No safe migration placement; retain the original physical state');
  return structuredClone(fallback);
}


//# sourceURL=../typed/scene-layout.mts