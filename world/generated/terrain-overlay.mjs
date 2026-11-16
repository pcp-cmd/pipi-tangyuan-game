import { pointSafe } from '../physical-navigation.mjs';
                                                                

                            
                              
                                                              
                  
                  
 

export function mountTerrainOverlay(overlay               )              {
  let current               = null, width = 0, height = 0, rendered               = null;
  let paths = new WeakMap                ();
  function refresh()       {
    if (!current || overlay.hasAttribute('hidden') || rendered === current) return;
    let path = paths.get(current);
    if (path === undefined) {
      const points           = [];
      for (let y = 12; y < height; y += 16) for (let x = 12; x < width; x += 16) {
        if (pointSafe(current, { x, y })) points.push(`M${x - 2},${y - 2}h4v4h-4z`);
      }
      path = points.join(''); paths.set(current, path);
    }
    const floor = overlay.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
    floor.classList.add('physical-walkable-grid'); floor.setAttribute('d', path);
    overlay.replaceChildren(floor); rendered = current;
  }
  return Object.freeze({
    setScene(scene       , sceneWidth        , sceneHeight        )       {
      current = scene; width = sceneWidth; height = sceneHeight; rendered = null;
      overlay.setAttribute('viewBox', `0 0 ${width} ${height}`); overlay.replaceChildren();
      refresh();
    },
    refresh,
    dispose()       { current = null; rendered = null; paths = new WeakMap(); overlay.replaceChildren(); },
  });
}


//# sourceURL=../typed/terrain-overlay.mts