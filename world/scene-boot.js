import { startSceneBoot } from './scene-boot-controller.js';
import { markStartupTiming } from './startup-timing.mjs';

markStartupTiming('boot-loader');
void startSceneBoot({ document, load: async () => {
  const scene = await import('./scene.js');
  return scene.startupResult;
} }).then(result => {
  markStartupTiming(result.ready ? 'controls-unlocked' : 'boot-not-playable');
});
