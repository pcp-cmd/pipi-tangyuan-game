const harborGround = [
  [[800,620],[925,575],[980,630],[965,710],[925,760],[775,780],[705,755]],
  [[690,770],[760,705],[925,705],[1110,765],[1110,810],[960,875],[750,850]],
  [[745,820],[985,820],[955,940],[900,1030],[650,1030]],
];

export function addOpenGround(scenes) {
  const harbor = scenes.find(scene => scene.id === 'harbor.exterior');
  if (!harbor) throw new Error('Starting island ground is missing.');
  // Add visible paving and its grass margins. Existing floors and collision blocks stay intact.
  harbor.navigation.zones.push(...structuredClone(harborGround));
  return scenes;
}
