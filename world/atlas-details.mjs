export function mountAtlasDetails({ detail, disclosure, summary, compact, onResize }) {
  const sync = () => {
    disclosure.open = !compact.matches;
    summary.tabIndex = compact.matches ? 0 : -1;
    onResize();
  };
  const toggle = () => {
    if (!compact.matches && !disclosure.open) disclosure.open = true;
    if (!detail.hidden) onResize();
  };
  const click = event => { if (!compact.matches) event.preventDefault(); };
  compact.addEventListener('change', sync);
  disclosure.addEventListener('toggle', toggle);
  summary.addEventListener('click', click);
  sync();
  return Object.freeze({
    show() { detail.hidden = false; disclosure.open = !compact.matches; },
    focus() { (compact.matches ? summary : detail).focus({ preventScroll: true }); },
    dispose() { compact.removeEventListener('change', sync); disclosure.removeEventListener('toggle', toggle); summary.removeEventListener('click', click); },
  });
}
