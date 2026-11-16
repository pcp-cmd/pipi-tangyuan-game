/** Page visibility only. Course DOM and action state belong to the explorer. */
const PAGES = ['companions', 'courses', 'discoveries', 'saves']         ;
                                               

                                      
                             
                                                      
 

                                         
                              
                         
                  
 

                          
                             
                       
                        
 

const mounted = new WeakMap                                     ();

export function mountJournalPages({ root, onPageChange = () => {} }                     )                         {
  if (!root?.querySelector || typeof onPageChange !== 'function') {
    throw new TypeError('A journal root and optional page-change callback are required.');
  }
  const existing = mounted.get(root);
  if (existing) return existing;
  const doc = root.ownerDocument;
  const required = (selector        )              => {
    const node = root.querySelector             (selector);
    if (!node) throw new TypeError('The journal requires all four tabs and matching page pairs.');
    return node;
  };
  const tabs = PAGES.map(page => required(`[data-journal-page="${page}"]`));
  const panels = PAGES.map(page => required(`[data-journal-panel="${page}"]`));
  let active              = 'companions';
  let disposed = false;

  const captureScroll = (panel             )                            =>
    [panel, ...panel.querySelectorAll             ('.journal-leaf, .journal-leaf-body')]
      .map(node => ({ node, top: node.scrollTop, left: node.scrollLeft }));
  const scrollPositions = panels.map(captureScroll);
  function restoreScroll(index        )       {
    for (const { node, top, left } of scrollPositions[index]) {
      if (node !== panels[index] && !panels[index].contains(node)) continue;
      node.scrollTop = top;
      node.scrollLeft = left;
    }
  }

  function show(page        )          {
    if (disposed) return false;
    const index = PAGES.findIndex(candidate => candidate === page);
    if (index < 0) return false;
    const previousIndex = PAGES.indexOf(active);
    const changing = previousIndex !== index;
    const priorPanel = panels[previousIndex];
    const moveFocus = changing && priorPanel.contains(doc.activeElement);
    if (changing) scrollPositions[previousIndex] = captureScroll(priorPanel);
    active = PAGES[index];
    for (let i = 0; i < PAGES.length; i++) {
      const selected = i === index;
      tabs[i].setAttribute('aria-selected', String(selected));
      tabs[i].tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    }
    root.dataset.journalPage = active;
    if (moveFocus) tabs[index].focus({ preventScroll: true });
    if (changing) {
      // A synchronous destination render may change its scroll geometry. Restore
      // after the owner callback, while a same-page sync never touches scrolling.
      onPageChange(active);
      if (!disposed && PAGES[index] === active) restoreScroll(index);
    }
    return true;
  }

  function click(event            )       {
    const target = event.target                  ;
    const tab = target?.closest?.             ('[data-journal-page]');
    if (tab && tabs.includes(tab)) show(tab.dataset.journalPage ?? '');
  }
  function keydown(event               )       {
    const index = tabs.indexOf(event.target               );
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    show(PAGES[next]);
    tabs[next].focus({ preventScroll: true });
  }

  // Capture makes the destination visible before the existing jump/focus code.
  root.addEventListener('click', click, true);
  root.addEventListener('keydown', keydown);
  const api                         = Object.freeze({
    show,
    syncVisible() { return show(active); },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener('click', click, true);
      root.removeEventListener('keydown', keydown);
      mounted.delete(root);
    }
  });
  mounted.set(root, api);
  show(active);
  return api;
}


//# sourceURL=../typed/journal-pages.mts