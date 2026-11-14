// The HTML starts inert, before any module or stylesheet has arrived.
// Release input only after scene.js has finished attaching handlers and rendering.
const starts = new WeakMap();

export function startSceneBoot({ document: doc, load, schedule = setTimeout, cancel = clearTimeout }) {
  if (starts.has(doc)) return starts.get(doc);
  const game = doc.getElementById('game');
  const notice = doc.getElementById('sceneBoot');
  const message = doc.getElementById('sceneBootMessage');
  if (!game || !notice || !message || typeof load !== 'function') throw new Error('Missing scene boot controls.');
  game.inert = true;
  game.setAttribute('aria-busy', 'true');
  notice.hidden = false;
  notice.dataset.phase = 'loading';
  const slow = schedule(() => {
    message.textContent = '小岛还在准备。手账和地图暂时不能打开；如果一直没有变化，可以重新载入。';
  }, 8000);
  const result = (async () => {
    try {
      await load();
      game.inert = false;
      game.setAttribute('aria-busy', 'false');
      game.removeAttribute('aria-describedby');
      notice.dataset.phase = 'ready';
      message.textContent = '小岛准备好了，可以打开手账、地图或开始写代码。';
      notice.hidden = true;
      return { ready: true };
    } catch {
      // A full reload retries module loading without duplicating partial handlers.
      notice.dataset.phase = 'failed';
      message.textContent = '小岛暂时没有准备好。请重新载入再试。';
      return { ready: false };
    } finally {
      cancel(slow);
    }
  })();
  starts.set(doc, result);
  return result;
}
