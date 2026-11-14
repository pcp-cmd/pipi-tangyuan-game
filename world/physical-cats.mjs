export const CAT_SHEET_GEOMETRY = Object.freeze({width:1536,height:2288,columns:8,rows:11,frameWidth:192,frameHeight:208});
export const CAT_FOOT_ANCHORS = Object.freeze({
  pipi: Object.freeze({
    0: [201,201,201,200,200,201,200,null],
    1: [180,183,183,183,183,183,183,180],
    2: [177,179,179,180,179,179,180,177],
    3: [193,193,193,193],
    4: [201,201,201,201,201],
    5: [183,177,177,181,179,184,181,186],
    6: [201,200,201,201,201,201],
    7: [196,195,196,196,196,196],
    8: [197,197,197,197,198,198],
    9: [200,200,200,200,200,200,200,200],
    10: [200,200,200,200,200,200,200,200],
  }),
  tangyuan: Object.freeze({
    0: [203,203,203,203,203,203,203,null],
    1: [182,182,185,187,184,181,189,180],
    2: [182,186,189,179,178,176,189,183],
    3: [203,203,203,203],
    4: [198,198,198,198,198],
    5: [202,178,202,170,203,182,170,203],
    6: [203,202,203,203,203,203],
    7: [202,203,202,203,202,202],
    8: [203,203,203,203,203,203],
    9: [203,203,203,203,203,203,203,203],
    10: [203,203,203,203,203,203,203,203],
  }),
});
for (const table of Object.values(CAT_FOOT_ANCHORS)) for (const row of Object.values(table)) Object.freeze(row);

export function physicalFootAnchor(cat, row, column) {
  const table = CAT_FOOT_ANCHORS[cat];
  if (!table) throw new TypeError('Unknown cat');
  const measured = table[row]?.[column];
  if (!Number.isFinite(measured)) throw new RangeError('No ground anchor for this sprite cell');
  return {x:96,y:measured};
}
