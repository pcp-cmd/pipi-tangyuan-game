// Traced on the preserved 1487 x 1058 harbor image. These are paint masks,
// not new obstacles: the deck and the gaps under the rope remain transparent.
// Depth uses the visible foot of each post. The sloping rope is split between
// those feet so a cat in front of its lower end is not drawn behind all of it.
const mask = (id, frontY, points) => Object.freeze({ id, frontY,
  polygon: Object.freeze(points.map(([x, y]) => Object.freeze({ x, y }))) });

export const HARBOR_PIER_OCCLUDERS = Object.freeze([
  mask('harbor-pier-front-post', 914, [
    [494,804],[518,804],[527,807],[531,812],[531,839],
    [536,842],[537,851],[532,856],[531,902],[525,908],
    [516,910],[508,913],[486,914],[481,912],[483,854],
    [479,851],[479,844],[483,839],[483,813],[486,809],
  ]),
  mask('harbor-pier-rope-peg', 875, [
    [407,820],[412,817],[416,820],[417,823],[417,830],
    [414,833],[414,872],[410,875],[406,872],[406,832],
    [403,829],[403,823],
  ]),
  mask('harbor-pier-shore-post', 996, [
    [554,856],[565,853],[591,853],[607,856],[610,864],
    [609,906],[617,910],[619,922],[611,926],[610,957],
    [603,966],[591,973],[584,981],[579,994],[569,997],
    [552,995],[549,987],[548,930],[541,925],[540,912],
    [546,905],[549,861],
  ]),
  mask('harbor-pier-rope-to-peg', 875, [
    [359,782],[363,787],[365,792],[369,797],[374,802],
    [379,806],[388,812],[399,816],[409,818],[415,821],
    [416,828],[405,828],[396,825],[385,822],[375,817],
    [369,812],[363,805],[359,797],[356,791],[355,785],
  ]),
  mask('harbor-pier-rope-west', 889, [
    [414,823],[423,829],[435,835],[438,836],
    [438,845],[432,843],[421,838],[414,832],
  ]),
  mask('harbor-pier-rope-middle', 901, [
    [438,836],[449,841],[461,843],[463,843],
    [463,852],[450,850],[438,845],
  ]),
  mask('harbor-pier-rope-east', 914, [
    [463,843],[474,844],[484,842],[486,850],[474,854],[463,852],
  ]),
  mask('harbor-pier-shore-rope', 996, [
    [551,915],[550,926],[543,938],[535,949],[526,959],
    [515,968],[504,975],[493,981],[482,985],[479,978],
    [489,974],[499,967],[509,960],[519,951],[528,941],
    [535,931],[541,919],[543,912],
  ]),
]);

const ids = new Set(HARBOR_PIER_OCCLUDERS.map(item => item.id));

// Called only after LEGACY / PRE_ART / PRE_SERVICE snapshots have been built.
// Copy this scene and its visual hotspot data rather than mutating a snapshot.
export function addHarborPierOcclusion(scenes) {
  return scenes.map(scene => scene.id !== 'harbor.exterior' ? scene : {
    ...scene,
    occluders: [...scene.occluders.filter(item => !ids.has(item.id)), ...HARBOR_PIER_OCCLUDERS],
    hotspots: scene.hotspots.map(item => item.id !== 'harbor.pier' ? item : {
      ...item,
      highlightOccluderIds: [...new Set([...(item.highlightOccluderIds ?? []), ...ids])],
    }),
  });
}
