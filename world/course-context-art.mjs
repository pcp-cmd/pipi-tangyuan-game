import { COURSE_CANDIDATE_ART, COURSE_ART_REUSE } from './course-candidate-art.mjs';

const objects = Object.freeze({
  paw: '<ellipse cx="31" cy="39" rx="15" ry="12"/><circle cx="12" cy="25" r="6"/><circle cx="24" cy="16" r="6"/><circle cx="38" cy="16" r="6"/><circle cx="50" cy="25" r="6"/>',
  coins: '<ellipse cx="31" cy="44" rx="22" ry="8"/><path d="M9 35v9m44-9v9"/><ellipse cx="31" cy="35" rx="22" ry="8"/><path d="M9 26v9m44-9v9"/><ellipse cx="31" cy="26" rx="22" ry="8"/><path d="M31 21v10m-4-7h8"/>',
  postcard: '<rect x="5" y="10" width="53" height="41" rx="3"/><path d="M35 14v32M10 20h16m-16 8h16m-16 8h12"/><rect x="43" y="17" width="9" height="10"/>',
  gate: '<path d="M6 54V8h10v46m32 0V8h10v46M16 16h32m-32 29h32M24 16v29m16-29v29"/><path d="M24 9l8-7 8 7"/>',
  backpack: '<rect x="13" y="13" width="38" height="45" rx="10"/><path d="M23 13V6h18v7m-28 8H6v24h7m38-24h7v24h-7"/><rect x="20" y="34" width="24" height="16" rx="3"/><path d="M29 22h6"/>',
  shell: '<path d="M30 55C-5 37 1 9 30 10c30-1 35 28 0 45Z"/><path d="M30 55L11 19m19 36L20 12m10 43V10m0 45 11-42m-11 42L50 20"/>',
  book: '<path d="M32 14C18 5 5 9 5 9v44s14-3 27 5c13-8 27-5 27-5V9s-13-4-27 5Zm0 0v44"/><path d="M12 20h12m-12 9h12m16-9h12m-12 9h12"/>',
  tag: '<path d="M4 10h34l22 22-22 22H4Z"/><circle cx="43" cy="32" r="4"/><path d="M12 24h18m-18 10h13m-13 10h18"/>',
  sieve: '<path d="M5 10h54L37 33v20l-10 6V33Z"/><path d="M14 18h36M20 24h24"/>',
  warning: '<path d="M32 4 61 56H3Z"/><path d="M32 21v16"/><circle cx="32" cy="46" r="2"/>',
  bottle: '<path d="M24 6h16v15c0 5 12 8 12 20v15H12V41c0-12 12-15 12-20Z"/><path d="M23 11h18"/><rect x="20" y="34" width="24" height="14" rx="3"/>',
  shop: '<path d="M6 25h52v31H6Z"/><path d="M3 25 10 8h44l7 17Z"/><path d="M17 8v17m15-17v17m15-17v17"/><rect x="13" y="35" width="14" height="21"/><rect x="36" y="35" width="15" height="10"/>',
  crate: '<path d="M7 15 31 5l26 10v37L31 61 7 52Z"/><path d="M7 15 31 25l26-10M31 25v36M20 10l25 10v14M7 41l24 9 26-9"/>',
  checklist: '<rect x="10" y="6" width="44" height="52" rx="3"/><path d="m17 18 4 4 7-8m6 5h12m-29 15 4 4 7-8m6 5h12m-29 15 4 4 7-8m6 5h12"/>',
  compass: '<circle cx="32" cy="32" r="27"/><path d="m43 17-7 20-15 10 7-20Z"/><path d="M32 2v8m30 22h-8M32 62v-8M2 32h8"/>',
  lock: '<rect x="12" y="27" width="40" height="31" rx="4"/><path d="M21 27V16a11 11 0 0 1 22 0v11"/><circle cx="32" cy="39" r="4"/><path d="M32 43v6"/>',
  receipt: '<path d="M11 5h42v54l-7-5-7 5-7-5-7 5-7-5-7 5Z"/><path d="M19 17h26m-26 10h26m-26 10h14m7 0h5m-26 10h26"/>',
  search: '<circle cx="26" cy="25" r="18"/><path d="m39 38 19 20M17 18h18m-18 8h13"/>',
  ship: '<path d="M3 40h58L48 55H16Zm29-35v35M30 9 9 32h21m5-21 19 21H35M3 61l12-4 17 4 16-4 13 4"/>',
  ticket: '<path d="M6 10h52v16a7 7 0 0 0 0 14v14H6V40a7 7 0 0 0 0-14Z"/><path d="M40 13v7m0 6v7m0 6v7m0 4v4M14 23h18m-18 12h18"/>',
  buoy: '<path d="M24 7h16l6 37H18Z"/><path d="M20 32h24M21 24h22"/><ellipse cx="32" cy="47" rx="23" ry="9"/><path d="m5 61 12-3 15 3 15-3 12 3"/>',
  ruler: '<rect x="5" y="20" width="54" height="25" rx="2"/><path d="M13 20v13m9-13v8m10-8v13m9-13v8m9-8v13"/>',
  flags: '<path d="M12 59V8l40 4-8 11 8 11-40-5"/><path d="M23 11v19m14-17v19M6 59h15"/>',
  notes: '<path d="M10 9h37v40H10Z"/><path d="M17 16h19m-19 9h19m-19 9h12"/><path d="M47 17h9v40H20v-8"/>',
  gear: '<path d="m25 4 14 0 2 9 8 4 8-3 7 12-7 6v8l7 6-7 12-8-3-8 4-2 9H25l-2-9-8-4-8 3-7-12 7-6v-8l-7-6 7-12 8 3 8-4Z" transform="translate(3 -2) scale(.9)"/><circle cx="32" cy="32" r="11"/>',
  wallet: '<rect x="5" y="15" width="51" height="40" rx="5"/><path d="M7 16V9h42v6"/><path d="M56 27H38v16h18Z"/><circle cx="44" cy="35" r="2"/>',
  stream: '<path d="M3 15h25l9 12h24M3 32h16l12 14h30M3 50h13l8 11h37"/><path d="m54 21 7 6-7 6m0 7 7 6-7 6m0 3 7 6"/>',
  shield: '<path d="m32 4 25 10v19c0 14-25 27-25 27S7 47 7 33V14Z"/><path d="M32 15v29m-8-15h16"/>',
  leaf: '<path d="M8 55C-1 15 29 3 59 5c0 32-17 59-51 50Z"/><path d="M8 55 49 16M20 44l-1-20m13 9 18 1"/>',
  queue: '<path d="M2 20h60M2 49h60"/><rect x="6" y="25" width="12" height="18"/><rect x="25" y="25" width="12" height="18"/><rect x="44" y="25" width="12" height="18"/><path d="m48 9 9 6-9 6"/>',
  gauge: '<path d="M7 53a28 28 0 1 1 50 0Z"/><path d="M32 13v7M13 25l7 4m24 0 7-4M32 43l14-20"/><circle cx="32" cy="43" r="4"/>',
  map: '<path d="m4 12 18-7 20 7 18-7v46l-18 7-20-7-18 7Z"/><path d="M22 5v46m20-39v46M11 37l11-9 12 9 17-15"/>',
  telescope: '<path d="m8 13 43 17-8 18L1 31Z"/><path d="m50 31 11 4-6 13-11-4M26 41v18m0-9L13 61m13-11 13 11"/>',
  chart: '<path d="M7 4v53h53"/><path d="M17 48V30h8v18m8 0V19h8v29m8 0V9h8v39"/>',
  clock: '<circle cx="32" cy="32" r="27"/><path d="M32 12v20l15 9M32 5v5M5 32h5m44 0h5M32 54v5"/>',
  wheel: '<circle cx="32" cy="32" r="23"/><circle cx="32" cy="32" r="6"/><path d="M32 2v24m0 12v24M2 32h24m12 0h24M11 11l17 17m8 8 17 17M11 53l17-17m8-8 17-17"/>',
  lantern: '<path d="M20 15V9a12 12 0 0 1 24 0v6M16 16h32l6 38H10Z"/><path d="M18 54v7h28v-7M20 22v25h24V22Z"/><path d="M32 27v15"/>',
  key: '<circle cx="19" cy="19" r="13"/><circle cx="19" cy="19" r="4"/><path d="m28 28 30 30m-9-9 7-7m-16-2 7-7"/>',
  anchor: '<circle cx="32" cy="10" r="6"/><path d="M32 16v43M19 25h26M6 38c0 16 12 21 26 21s26-5 26-21M6 38l-3 12m3-12 11 5m41-5 3 12m-3-12-11 5"/>',
  signal: '<path d="M29 36h6v24h-6Z"/><circle cx="32" cy="23" r="10"/><path d="M16 10a20 20 0 0 0 0 27m32-27a20 20 0 0 1 0 27M7 3a31 31 0 0 0 0 41m50-41a31 31 0 0 1 0 41"/>',
  rope: '<path d="M18 58V21C18 3 48 3 48 21c0 15-30 15-30 0m0 10c0 17 30 17 30 0m-30 9c0 17 30 17 30 0M48 21v37"/>',
});

const relations = Object.freeze({
  forward: '<path d="M102 68h25m-8-7 8 7-8 7"/>',
  compare: '<path d="M105 60h22m-22 14h22"/>',
  collect: '<path d="M103 51q15 0 15 17v17m-7-8 7 8 7-8M103 84q9 0 15-16"/>',
  split: '<path d="M103 68h9m0 0 17-17m-17 17 17 17M121 51h8v8m-8 26h8v-8"/>',
  loop: '<path d="M105 57a13 13 0 1 1-1 19m1-19v10h10"/>',
  stop: '<rect x="106" y="58" width="19" height="19" rx="2"/><path d="M101 68h-5m39 0h-5"/>',
  ordered: '<path d="M104 54h22m-22 13h16m-16 13h10"/>',
  protect: '<path d="m115 51 13 5v12c0 9-13 16-13 16s-13-7-13-16V56Z"/>',
  wait: '<path d="M105 50h21m-21 35h21m-19-35c0 18 17 17 17 35m0-35c0 18-17 17-17 35"/>',
});

const xml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));

export function courseContextArt({ id, title, scenario, symbols }) {
  const sourceCourseId = COURSE_ART_REUSE[id] || id;
  const candidate = COURSE_CANDIDATE_ART[sourceCourseId];
  if (candidate) return Object.freeze({ ...candidate, status: 'candidate', sourceCourseId, reused: sourceCourseId !== id, label: '',
    alt: `${title}：${scenario}`,
    source: candidate.source || 'user-supplied-original-course-art', executionEvidence: false, symbols: Object.freeze([...symbols]) });
  const [left, right, relation] = symbols;
  if (!objects[left] || !objects[right] || !relations[relation]) throw new Error(`Unknown course illustration motif for ${id}.`);
  const alt = `${title}：${scenario}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 132" role="img" aria-label="${xml(alt)}"><title>${xml(title)}</title><desc>${xml(alt)}</desc><rect x="1" y="1" width="222" height="130" rx="18" fill="#f2e7cc"/><path d="M18 106q25-9 46 0t46 0 46 0 46 0" fill="none" stroke="#b5c6ae" stroke-width="3"/><circle cx="58" cy="63" r="40" fill="#d5dfc9"/><circle cx="167" cy="67" r="34" fill="#e5d5ac"/><g fill="#e7bc66" stroke="#244c42" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(25 30)">${objects[left]}</g><g transform="translate(142 42) scale(.8)">${objects[right]}</g><g fill="none">${relations[relation]}</g></g></svg>`;
  return Object.freeze({ status: 'placeholder', label: '', alt, svg, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    symbols: Object.freeze([...symbols]), source: 'project-native-svg', executionEvidence: false });
}
