// New reconstruction coordinates, measured against the unmodified approved art.
// These anchors are not claimed to be recovered historical implementation data.
export const WORKSHOP_ART = Object.freeze({
  width: 1585, height: 992, atlasWidth: 1774, atlasHeight: 887,
  background: new URL('./assets/workshop/environment-original-r1.png', import.meta.url).href,
  props: new URL('./assets/workshop/props-original-r1.png', import.meta.url).href,
});

export const WORKSHOP_OBJECTS = Object.freeze([
  { id: 'brief', name: '委托板', intent: 'brief', label: '查看当前委托',
    crop: [80, 208, 440, 470], anchor: [470, 590], width: 230 },
  { id: 'bench', name: '工作台', intent: 'write', label: '在工作台写代码',
    crop: [555, 280, 610, 390], anchor: [845, 596], width: 310 },
  { id: 'tray', name: '作品托盘', intent: 'result', label: '查看本次运行结果',
    crop: [1180, 335, 555, 335], anchor: [1195, 594], width: 260 },
].map(object => Object.freeze({ ...object, crop: Object.freeze(object.crop), anchor: Object.freeze(object.anchor) })));

export function fitWorkshop(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) throw new RangeError('Invalid workshop viewport');
  const scale = Math.min(width / WORKSHOP_ART.width, height / WORKSHOP_ART.height);
  return { width: WORKSHOP_ART.width * scale, height: WORKSHOP_ART.height * scale, scale };
}

export function workshopObjectStyle(object) {
  const [x, y, width, height] = object.crop;
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > WORKSHOP_ART.atlasWidth || y + height > WORKSHOP_ART.atlasHeight) throw new RangeError('Invalid workshop crop');
  return {
    left: `${object.anchor[0] / WORKSHOP_ART.width * 100}%`,
    bottom: `${(1 - object.anchor[1] / WORKSHOP_ART.height) * 100}%`,
    width: `${object.width / WORKSHOP_ART.width * 100}%`,
    ratio: `${width} / ${height}`,
    imageWidth: `${WORKSHOP_ART.atlasWidth / width * 100}%`,
    imageHeight: `${WORKSHOP_ART.atlasHeight / height * 100}%`,
    imageLeft: `${-x / width * 100}%`,
    imageTop: `${-y / height * 100}%`,
  };
}
