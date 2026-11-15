import { reportStartupStage } from './startup.mjs';
                                                                 

                                                                                 
                               
                                         
                                                                                                  
                                                              
                               
                                                                                                                                                                                  
                                                                     

                                           
                                          
                        
                                                
                                                  
                                          
                                                                          
                                              
                                               
 

export async function coordinateSceneStartup(dependencies                          )                         {
  const stage = dependencies.reportStage ?? reportStartupStage;
  const state = (value                   ) => dependencies.onState?.(value);
  const recover = (scope               , reason        )                => {
    state({ phase: 'recovery-required', reason });
    dependencies.exposeRecovery({ scope, reason });
    return { status: 'recovery-required', reason };
  };
  state({ phase: 'validating-session' });
  stage('save');
  const session = await dependencies.loadSession();
  dependencies.mountRecovery();
  if (!session.valid) return recover('session', session.reason);
  state({ phase: 'valid-session' });
  stage('scene');
  state({ phase: 'preparing-resources' });
  const physical = await dependencies.preparePhysical();
  if (physical.status !== 'done') {
    const reason = physical.reason ?? physical.status;
    if (physical.status === 'asset-blocked') {
      state({ phase: 'asset-blocked', reason });
      return { status: 'asset-blocked', reason };
    }
    return recover('physical', reason);
  }
  state({ phase: 'resource-ready' });
  stage('controls');
  state({ phase: 'synchronizing-leader' });
  const leader = await dependencies.synchronizeLeader();
  if (leader.status !== 'done') return recover('leader', leader.reason ?? leader.status);
  state({ phase: 'leader-sync-done' });
  state({ phase: 'preparing-controls' });
  await dependencies.prepareControls();
  state({ phase: 'playable' });
  return { status: 'playable' };
}


//# sourceURL=../typed/scene-startup.mts