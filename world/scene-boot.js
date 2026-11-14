import { startSceneBoot } from './scene-boot-controller.js';

void startSceneBoot({ document, load: () => import('./scene.js').catch(error => { console.error('World initialization failed:', error); throw error; }) });
