// Scene-space presentation anchors. Walk routes and saved locations deliberately
// remain owned by SCENE.places; moving a sign never moves a destination.
export const LANDMARK_SIGNS = Object.freeze({
  harbor: Object.freeze({ x: 405, y: 797, width: 164, height: 136, art: 'harbor-post.svg', label: '启程码头', kind: 'post' }),
  workshop: Object.freeze({ x: 1260, y: 438, width: 84, height: 110, art: 'workshop-hanging.svg', label: '代码\n工坊', kind: 'hanging' }),
  lighthouse: Object.freeze({ x: 810, y: 242, width: 44, height: 64, art: null, label: '测试灯塔', kind: 'architecture' }),
  camp: Object.freeze({ x: 1426, y: 532, width: 84, height: 110, art: 'camp-hanging.svg', label: '休息\n营地', kind: 'hanging' }),
});
export function mountLandmarkSign(button, place, doc = document) {
  const sign = LANDMARK_SIGNS[place.id];
  if (!sign) throw new RangeError('Unknown landmark sign');
  button.classList.add('place-sign'); button.dataset.sign = sign.kind; button.dataset.placeName = place.name;
  button.setAttribute('aria-label', place.name); button.title = place.name;
  button.style.left = `${sign.x}px`; button.style.top = `${sign.y}px`;
  button.style.setProperty('--sign-width', `${sign.width}px`); button.style.setProperty('--sign-height', `${sign.height}px`);
  if (!sign.art) return button;
  const visual = doc.createElement('span'); visual.className = 'place-sign-visual'; visual.setAttribute('aria-hidden', 'true');
  const art = doc.createElement('img'); art.className = 'place-sign-art'; art.alt = ''; art.draggable = false; art.src = new URL(`./assets/signs/${sign.art}`, import.meta.url).href;
  const label = doc.createElement('span'); label.className = 'place-sign-title'; label.textContent = sign.label;
  visual.append(art, label); button.append(visual);
  return button;
}
