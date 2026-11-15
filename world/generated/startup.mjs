                                                                     
                           
                          
                                                                      
                                          

                                                                                       
                    
                     
                                     
                               
                               
  
const starts = new WeakMap                               ();
const listeners = new Set                               ();
let currentStage               = 'loading';
const labels                               = {
  loading: '正在打开小岛……',
  save: '正在核对这次旅程的存档……',
  scene: '正在准备当前场景……',
  controls: '正在安放伙伴和小岛上的物件……',
};

export function reportStartupStage(stage              )       {
  currentStage = stage;
  for (const listener of listeners) listener(stage);
}

export function startSceneBoot({ document: doc, load, schedule = setTimeout, cancel = clearTimeout }             )                      {
  const previous = starts.get(doc);
  if (previous) return previous;
  const game = doc.getElementById('game');
  const notice = doc.getElementById('sceneBoot');
  const message = doc.getElementById('sceneBootMessage');
  if (!game || !notice || !message) throw new Error('Missing scene boot controls.');
  game.inert = true;
  game.setAttribute('aria-busy', 'true');
  notice.hidden = false;
  const showStage = (stage              ) => {
    notice.dataset.phase = stage;
    message.textContent = labels[stage];
  };
  showStage(currentStage);
  listeners.add(showStage);
  const slow = schedule(() => {
    notice.dataset.slow = 'true';
    message.textContent = `${labels[currentStage]}资源较慢，暂时不能打开手账和地图。可重新载入重试，存档会保留。`;
  }, 8000);
  const result = (async ()                      => {
    try {
      const outcome = await load();
      if (!outcome || outcome.status !== 'playable') {
        const status = outcome?.status ?? 'failed';
        const reason = outcome?.reason;
        notice.dataset.phase = status;
        message.textContent = status === 'asset-blocked'
          ? '当前场景的图片未能准备好。请重新载入重试；原存档和位置保持不变。'
          : status === 'recovery-required'
            ? '这次旅程需要核对保存记录。请先使用恢复面板导出原记录，避免覆盖。'
            : '小岛暂时没有准备好。请重新载入再试。';
        return { ready: false, status, ...(reason ? { reason } : {}) };
      }
      game.inert = false;
      game.setAttribute('aria-busy', 'false');
      game.removeAttribute('aria-describedby');
      notice.dataset.phase = 'ready';
      message.textContent = '小岛准备好了。';
      notice.hidden = true;
      return { ready: true, status: 'playable' };
    } catch (error) {
      notice.dataset.phase = 'failed';
      message.textContent = '小岛暂时没有准备好。请重新载入再试。';
      return { ready: false, status: 'failed', reason: error instanceof Error ? error.message : String(error) };
    } finally {
      cancel(slow);
      listeners.delete(showStage);
    }
  })();
  starts.set(doc, result);
  return result;
}

                                                                                                                    
                                                                                       
                                                
  

export function scheduleStartupTask(task                               , host             = window, onError                           = console.error)             {
  let cancelled = false;
  let frame                    ;
  let idle                    ;
  let timer                    ;
  const run = () => {
    if (cancelled) return;
    try { Promise.resolve(task()).catch(onError); } catch (error) { onError(error); }
  };
  frame = host.requestAnimationFrame(() => {
    if (cancelled) return;
    if (host.requestIdleCallback) idle = host.requestIdleCallback(run, { timeout: 350 });
    else timer = host.setTimeout(run, 0);
  });
  return () => {
    cancelled = true;
    if (frame !== undefined) host.cancelAnimationFrame(frame);
    if (idle !== undefined) host.cancelIdleCallback?.(idle);
    if (timer !== undefined) host.clearTimeout(timer);
  };
}


//# sourceURL=../typed/startup.mts