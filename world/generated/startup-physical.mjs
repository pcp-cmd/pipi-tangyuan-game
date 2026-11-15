                                                                       
                                                                                
                                                                      
                                                  
                             
                           
                 
                                                              
                                  
                                                
                                                                               
                                       
                                            
                          
  

export function createPhysicalStartup                             (hooks                 ) {
  let active                          = null;
  let last                 = null;
  const attempt = async ()                   => {
    if (hooks.disposed()) return { status: 'superseded' };
    const loaded = hooks.read();
    if (!loaded.state && loaded.status !== 'idle') return hooks.recover(loaded.status);
    const candidate = loaded.state ? hooks.upgrade(loaded.state) : hooks.fresh();
    await hooks.prepareMigration(loaded);
    if (hooks.disposed()) return { status: 'superseded' };
    hooks.pending(candidate);
    try { await hooks.loadAsset(candidate); }
    catch (error) {
      if (hooks.disposed()) return { status: 'superseded' };
      const reason = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : 'asset-unavailable';
      return hooks.assetBlocked(reason);
    }
    if (hooks.disposed()) return { status: 'superseded' };
    return hooks.publish(candidate, !loaded.state);
  };
  const start = ()                   => {
    if (active) return active;
    const pending = attempt().then(outcome => { last = outcome; return outcome; }).finally(() => { active = null; });
    active = pending;
    return pending;
  };
  return Object.freeze({
    start,
    retry: () => active ?? (last?.status === 'asset-blocked' ? start() : Promise.resolve({ status: 'blocked', reason: 'not-asset-blocked' })),
  });
}


//# sourceURL=../typed/startup-physical.mts