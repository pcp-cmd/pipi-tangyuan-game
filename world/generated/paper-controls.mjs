                              
                  
                   
                                      
                  
 

                                
                  
                
                  
 

const choices = new WeakMap                                ();
const roots = new WeakMap                            ();
let serial = 0;

function textWithout(node      , omitted      )         {
  if (node === omitted) return '';
  if (node.nodeType === 3) return node.textContent || '';
  return Array.from(node.childNodes).map(child => textWithout(child, omitted)).join(' ');
}

function disabledOption(option                   )          {
  return option.disabled || Boolean(option.hidden) || (option.parentElement?.tagName === 'OPTGROUP' && (option.parentElement                       ).disabled);
}

function targetNode(event       )              {
  return event.target && 'nodeType' in event.target ? event.target         : null;
}

export function refreshPaperSelect(select                   )       {
  choices.get(select)?.refresh();
}

export function focusPaperSelect(select                   )          {
  const choice = choices.get(select);
  if (choice) return choice.focus();
  if (select.disabled || select.hidden) return false;
  select.focus({ preventScroll: true });
  return true;
}

export function enhancePaperSelect(select                   )                     {
  const prior = choices.get(select);
  if (prior) return prior;
  if (select.multiple || select.size > 1 || !select.parentNode) return null;
  const doc = select.ownerDocument;
  const view = doc.defaultView;
  const originalTabIndex = select.getAttribute('tabindex');
  const originalAriaHidden = select.getAttribute('aria-hidden');
  const label = select.labels?.[0];
  const accessibleName = select.getAttribute('aria-label') || (label ? textWithout(label, select).trim() : '') || '选择';
  const wrapper = doc.createElement('span');
  wrapper.className = 'paper-choice';
  const trigger = doc.createElement('button');
  trigger.type = 'button';
  trigger.className = 'paper-choice-trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (select.hasAttribute('aria-labelledby')) trigger.setAttribute('aria-labelledby', select.getAttribute('aria-labelledby') || '');
  else trigger.setAttribute('aria-label', accessibleName);
  if (select.hasAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', select.getAttribute('aria-describedby') || '');
  const copy = doc.createElement('span');
  copy.className = 'paper-choice-copy';
  const arrow = doc.createElement('span');
  arrow.className = 'paper-choice-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  trigger.append(copy, arrow);
  const list = doc.createElement('div');
  list.className = 'paper-choice-options';
  list.id = `paper-options-${++serial}`;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', accessibleName);
  list.setAttribute('popover', 'manual');
  list.tabIndex = -1;
  list.hidden = true;
  trigger.setAttribute('aria-controls', list.id);
  select.parentNode.insertBefore(wrapper, select);
  wrapper.append(select, trigger, list);
  select.classList.add('paper-choice-source');
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;

  let open = false;
  let disposed = false;
  let activeIndex = -1;
  let signature = '';
  let typeBuffer = '';
  let typeTime = 0;
  let optionNodes                = [];
  const removals                    = [];

  function listen(target             , type        , handler               , capture = false)       {
    target.addEventListener(type, handler, capture);
    removals.push(() => target.removeEventListener(type, handler, capture));
  }

  function options()                      { return Array.from(select.options); }

  function position()       {
    if (!open) return;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = view?.innerWidth || doc.documentElement.clientWidth;
    const viewportHeight = view?.innerHeight || doc.documentElement.clientHeight;
    const width = Math.min(Math.max(rect.width, 240), Math.max(120, viewportWidth - 24));
    const below = viewportHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const useAbove = below < 180 && above > below;
    const height = Math.min(360, Math.max(96, useAbove ? above : below));
    list.style.width = `${width}px`;
    list.style.maxHeight = `${height}px`;
    list.style.left = `${Math.max(12, Math.min(rect.left, viewportWidth - width - 12))}px`;
    list.style.top = useAbove ? 'auto' : `${rect.bottom + 4}px`;
    list.style.bottom = useAbove ? `${viewportHeight - rect.top + 4}px` : 'auto';
  }

  function setActive(index        , scroll = false)       {
    activeIndex = index;
    for (const [itemIndex, node] of optionNodes.entries()) {
      node.dataset.active = String(itemIndex === index);
    }
    const active = optionNodes[index];
    if (active) {
      list.setAttribute('aria-activedescendant', active.id);
      if (scroll) active.scrollIntoView({ block: 'nearest' });
    } else list.removeAttribute('aria-activedescendant');
  }

  function refresh()       {
    if (disposed) return;
    const current = options();
    wrapper.hidden = select.hidden;
    trigger.disabled = select.disabled || current.every(disabledOption);
    trigger.tabIndex = originalTabIndex === null ? 0 : Number(originalTabIndex);
    copy.textContent = current[select.selectedIndex]?.textContent || '请选择';
    trigger.title = copy.textContent;
    const nextSignature = JSON.stringify(current.map(option => [option.value, option.textContent, disabledOption(option), option.hidden, option.selected, option.parentElement?.tagName === 'OPTGROUP' ? (option.parentElement                       ).label : '']));
    if (nextSignature !== signature) {
      signature = nextSignature;
      optionNodes = [];
      list.replaceChildren();
      let previousGroup                     = null;
      for (const [index, option] of current.entries()) {
        const group = option.parentElement?.tagName === 'OPTGROUP' ? option.parentElement                        : null;
        if (group && group !== previousGroup) {
          const heading = doc.createElement('div');
          heading.className = 'paper-choice-group';
          heading.setAttribute('role', 'presentation');
          heading.textContent = group.label;
          list.append(heading);
        }
        previousGroup = group;
        const node = doc.createElement('div');
        node.className = 'paper-choice-option';
        node.id = `${list.id}-${index}`;
        node.dataset.optionIndex = String(index);
        node.setAttribute('role', 'option');
        node.setAttribute('aria-selected', String(option.selected));
        node.setAttribute('aria-disabled', String(disabledOption(option)));
        node.textContent = option.textContent;
        node.hidden = option.hidden;
        optionNodes.push(node);
        list.append(node);
      }
      if (!open || activeIndex < 0 || !current[activeIndex] || disabledOption(current[activeIndex] )) activeIndex = select.selectedIndex;
      setActive(activeIndex);
    }
    if (open && (trigger.disabled || wrapper.hidden)) close(false);
  }

  function close(restoreFocus = false)       {
    if (!open) return;
    open = false;
    trigger.setAttribute('aria-expanded', 'false');
    try { if (typeof list.hidePopover === 'function') list.hidePopover(); } catch { /* A closing parent can already remove the popover from the top layer. */ }
    list.hidden = true;
    typeBuffer = '';
    if (restoreFocus && !trigger.disabled) trigger.focus({ preventScroll: true });
  }

  function show()       {
    refresh();
    if (disposed || trigger.disabled || wrapper.hidden) return;
    open = true;
    trigger.setAttribute('aria-expanded', 'true');
    list.hidden = false;
    try { if (typeof list.showPopover === 'function') list.showPopover(); } catch { list.removeAttribute('popover'); }
    position();
    const current = options();
    const selected = current[select.selectedIndex];
    setActive(selected && !disabledOption(selected) ? select.selectedIndex : current.findIndex(option => !disabledOption(option)), true);
    list.focus({ preventScroll: true });
  }

  function commit(index        )       {
    if (disposed || select.disabled) return;
    const option = options()[index];
    if (!option || disabledOption(option)) return;
    const changed = select.selectedIndex !== index;
    select.selectedIndex = index;
    close(true);
    refresh();
    if (changed) {
      const EventConstructor = view?.Event || Event;
      select.dispatchEvent(new EventConstructor('input', { bubbles: true }));
      select.dispatchEvent(new EventConstructor('change', { bubbles: true }));
    }
  }

  function move(direction        , endpoint                   )       {
    const available = options().map((option, index) => disabledOption(option) ? -1 : index).filter(index => index >= 0);
    if (!available.length) return;
    const current = available.indexOf(activeIndex);
    const next = endpoint === 'first' ? 0 : endpoint === 'last' ? available.length - 1 : Math.min(available.length - 1, Math.max(0, current + direction));
    setActive(available[next] , true);
  }

  function keydown(event       )       {
    const key = event                 ;
    if (key.ctrlKey || key.metaKey || key.altKey) return;
    if (key.key === 'Escape' && open) {
      key.preventDefault(); key.stopPropagation(); close(true); return;
    }
    if (key.key === 'Tab' && open) { close(true); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(key.key)) {
      key.preventDefault(); key.stopPropagation();
      if (!open) { show(); return; }
      if (key.key === 'Enter' || key.key === ' ') commit(activeIndex);
      else move(key.key === 'ArrowUp' ? -1 : 1, key.key === 'Home' ? 'first' : key.key === 'End' ? 'last' : undefined);
      return;
    }
    if (key.key.length === 1 && !key.isComposing) {
      key.preventDefault(); key.stopPropagation();
      if (!open) show();
      const now = Date.now();
      typeBuffer = now - typeTime > 700 ? key.key : typeBuffer + key.key;
      typeTime = now;
      const query = typeBuffer.toLocaleLowerCase();
      const current = options();
      let match = current.findIndex(option => !disabledOption(option) && (option.textContent || '').toLocaleLowerCase().startsWith(query));
      if (match < 0 && query.length > 1) {
        typeBuffer = key.key;
        match = current.findIndex(option => !disabledOption(option) && (option.textContent || '').toLocaleLowerCase().startsWith(key.key.toLocaleLowerCase()));
      }
      if (match >= 0) setActive(match, true);
    }
  }

  listen(trigger, 'click', () => { if (open) close(true); else show(); });
  listen(trigger, 'keydown', keydown);
  listen(list, 'keydown', keydown);
  listen(list, 'click', event => {
    const target = targetNode(event);
    const option = target && target.nodeType === 1 ? (target           ).closest             ('[data-option-index]') : null;
    if (option && list.contains(option)) commit(Number(option.dataset.optionIndex));
  });
  listen(select, 'change', refresh);
  listen(select, 'input', refresh);
  listen(select, 'focus', () => trigger.focus({ preventScroll: true }));
  listen(wrapper, 'focusout', event => {
    const next = (event              ).relatedTarget;
    if (open && (!next || !('nodeType' in next) || !wrapper.contains(next        ))) close(false);
  });
  listen(doc, 'pointerdown', event => { const node = targetNode(event); if (open && node && !wrapper.contains(node)) close(false); }, true);
  listen(doc, 'scroll', event => { if (open && targetNode(event) !== list) position(); }, true);
  if (view) listen(view, 'resize', position);
  const Observer = view?.MutationObserver;
  const observer = Observer ? new Observer(refresh) : null;
  observer?.observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'selected', 'label'] });

  const api              = Object.freeze({
    refresh,
    focus() {
      if (disposed) return false;
      refresh();
      if (trigger.disabled || wrapper.hidden) return false;
      close(false);
      trigger.focus({ preventScroll: true });
      return true;
    },
    close,
    dispose() {
      if (disposed) return;
      close(false);
      disposed = true;
      observer?.disconnect();
      for (const remove of removals) remove();
      select.classList.remove('paper-choice-source');
      if (originalTabIndex === null) select.removeAttribute('tabindex'); else select.setAttribute('tabindex', originalTabIndex);
      if (originalAriaHidden === null) select.removeAttribute('aria-hidden'); else select.setAttribute('aria-hidden', originalAriaHidden);
      wrapper.parentNode?.insertBefore(select, wrapper);
      wrapper.remove();
      choices.delete(select);
    }
  });
  choices.set(select, api);
  refresh();
  return api;
}

export function mountPaperControls(root             )                {
  const prior = roots.get(root);
  if (prior) return prior;
  const owned = new Map                                ();
  let disposed = false;
  function refresh()       {
    if (disposed) return;
    for (const [select, controller] of owned) {
      if (!root.contains(select)) { controller.dispose(); owned.delete(select); }
    }
    for (const select of root.querySelectorAll                   ('select')) {
      const controller = enhancePaperSelect(select);
      if (controller) { owned.set(select, controller); controller.refresh(); }
    }
  }
  const Observer = root.ownerDocument.defaultView?.MutationObserver;
  const observer = Observer ? new Observer(records => {
    if (records.some(record => Array.from(record.addedNodes).some(node => node.nodeType === 1 && ((node           ).tagName === 'SELECT' || (node           ).querySelector('select'))) || Array.from(record.removedNodes).some(node => node.nodeType === 1 && ((node           ).tagName === 'SELECT' || (node           ).querySelector('select'))))) refresh();
  }) : null;
  const api                = Object.freeze({
    refresh,
    close() { for (const controller of owned.values()) controller.close(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      for (const controller of owned.values()) controller.dispose();
      owned.clear(); roots.delete(root);
    }
  });
  roots.set(root, api);
  refresh();
  observer?.observe(root, { childList: true, subtree: true });
  return api;
}


//# sourceURL=../typed/paper-controls.mts