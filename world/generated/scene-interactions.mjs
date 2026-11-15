export const HOTSPOT_SINGLE_CLICK_DELAY_MS = 0;
export const HOTSPOT_CAMERA_HOLD_MS = 500;

                                       
                            
                                          
                                    
 

                                                                      
                                 
                                   
                                   
 
                                       
                                                                                             
                                                                       
                                           
 

                   
                         
                               
                                         
                     
                   
                      
                                              
 

export function createHotspotClickIntent({
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  holdCamera = () => () => {},
}                       = {}) {
  let current                 = null;
  let epoch = 0;
  let disposed = false;

  function releaseCamera(request         ) {
    if (!request.holding) return;
    request.holding = false;
    if (request.timer !== null) clearTimer(request.timer);
    request.timer = null;
    request.release();
  }

  function cancel() {
    const previous = current;
    current = null;
    epoch++;
    if (previous) releaseCamera(previous);
  }

  function begin(target             , source                        )                 {
    cancel();
    if (disposed) return null;
    const token = ++epoch;
    const request          = {
      token, target, activated: false, holding: false, release: () => {}, timer: null,
      context: Object.freeze({ intentId: token, source, isCurrent: () => !disposed && current === request && epoch === token }),
    };
    current = request;
    if (source === 'pointer') {
      const release = holdCamera();
      request.release = release;
      if (!request.context.isCurrent()) { release(); return null; }
      request.holding = true;
      request.timer = setTimer(() => releaseCamera(request), HOTSPOT_CAMERA_HOLD_MS);
    }
    return request;
  }

  function click(target             , detail        , approach               ) {
    if (disposed || detail > 1) return;
    const request = begin(target, detail === 0 ? 'keyboard' : 'pointer');
    if (!request?.context.isCurrent()) return;
    try { return approach(request.context); }
    catch (error) { cancel(); throw error; }
  }

  function activate(target             , action               ) {
    if (disposed) return;
    const request = current?.target === target ? current : null;
    if (!request || request.activated || !request.context.isCurrent()) return;
    request.activated = true;
    releaseCamera(request);
    if (request.context.isCurrent()) return action(request.context);
  }

  function bind(button             , { approach, activate: action }                ) {
    button.addEventListener('click', event => {
      event.stopPropagation();
      return click(button, (event              ).detail, approach);
    });
    button.addEventListener('dblclick', event => {
      event.preventDefault();
      event.stopPropagation();
      return activate(button, action);
    });
  }

  return Object.freeze({
    bind, cancel,
    pending: () => current?.holding === true,
    dispose() { disposed = true; cancel(); },
  });
}


//# sourceURL=../typed/scene-interactions.mts