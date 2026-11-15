import { startSceneBoot } from './scene-boot-controller.js';

void startSceneBoot({ document, load: async () => {
  const scene = await import('./scene.js');
  return scene.startupResult;
} });
