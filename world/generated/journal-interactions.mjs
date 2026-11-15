                                                 
                                                                                                                          

                                
                      
                         
                              
                           
 

                                 
                      
                         
 

                              
                                             
                                               
                                   
                                    
                            
 

                                  
                              
                                
                              
                                           
 

                                    
                                  
                
                  
 

function icon(doc          , name        , className = '')                   {
  const image = doc.createElement('img');
  image.className = className;
  image.src = `./assets/icons/${name}.svg`;
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.draggable = false;
  return image;
}

export function mountMailboxNote({ panel, content, intro, returnButton }                 )                    {
  const doc = content.ownerDocument;
  const originalReturn = Array.from(returnButton.childNodes);
  const originalIntro = intro.textContent;
  let generation = 0;
  let active = false;
  let disposed = false;
  let pending = false;
  let cleanups                    = [];

  function clearListeners()       {
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
  }

  function reset()       {
    generation++;
    pending = false;
    clearListeners();
    if (!active) return;
    active = false;
    if (panel.dataset.inspectionKind === 'mailbox') delete panel.dataset.inspectionKind;
    content.classList.remove('mailbox-contents');
    content.removeAttribute('aria-busy');
    intro.classList.remove('mailbox-intro');
    intro.textContent = originalIntro;
    returnButton.classList.remove('mailbox-return');
    returnButton.replaceChildren(...originalReturn);
    content.replaceChildren();
  }

  function render(view             )       {
    if (disposed) return;
    reset();
    active = true;
    const token = generation;
    panel.dataset.inspectionKind = 'mailbox';
    content.classList.add('mailbox-contents');
    intro.classList.add('mailbox-intro');
    intro.textContent = view.message ?? '先分清对方要什么，再决定下一步。';
    returnButton.classList.add('mailbox-return');
    const returnCopy = doc.createElement('span');
    returnCopy.textContent = '回手账';
    returnButton.replaceChildren(icon(doc, 'book-open'), returnCopy);

    const courses = doc.createElement('div');
    courses.className = 'mailbox-course-tags';
    courses.setAttribute('role', 'group');
    courses.setAttribute('aria-label', '信箱里的课程');
    const projects = doc.createElement('div');
    projects.className = 'mailbox-projects';
    projects.setAttribute('role', 'group');
    projects.setAttribute('aria-label', '封蜡委托');
    const status = doc.createElement('p');
    status.className = 'mailbox-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.hidden = true;
    const actions                      = [];

    function bind(button                   , id        , action               )       {
      actions.push(button);
      const activate = async ()                => {
        if (disposed || !active || pending || token !== generation) return;
        pending = true;
        content.setAttribute('aria-busy', 'true');
        status.hidden = true;
        for (const item of actions) item.disabled = true;
        try {
          const result = await action(id, button);
          if (result === false && token === generation && active) {
            status.textContent = '这次没有打开。请查看提示，再试一次。';
            status.hidden = false;
          }
        } catch {
          if (token === generation && active) {
            status.textContent = '暂时没有打开，便笺仍在这里。可以重试或回手账。';
            status.hidden = false;
          }
        } finally {
          if (token === generation && active && !disposed) {
            pending = false;
            content.removeAttribute('aria-busy');
            for (const item of actions) item.disabled = false;
          }
        }
      };
      button.addEventListener('click', activate);
      cleanups.push(() => button.removeEventListener('click', activate));
    }

    for (const [index, course] of view.courses.entries()) {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'mailbox-course-tag';
      button.dataset.lessonId = course.id;
      button.dataset.availability = course.available ? 'ready' : 'preview';
      button.dataset.tint = index % 2 === 0 ? 'sea' : 'coral';
      const title = doc.createElement('strong');
      title.textContent = course.title;
      const stamp = doc.createElement('span');
      stamp.className = 'mailbox-course-state';
      stamp.textContent = course.available ? '翻开练习' : '先看课程';
      button.append(icon(doc, index % 2 === 0 ? 'notebook' : 'book-open', 'mailbox-tag-icon'), title, stamp);
      if (!course.available) {
        button.setAttribute('aria-label', `${course.title}，查看课程${course.reason ? `：${course.reason}` : '与学习顺序'}`);
        if (course.reason) button.title = course.reason;
      }
      courses.append(button);
      bind(button, course.id, view.onCourse);
    }
    for (const project of view.projects) {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'mailbox-envelope';
      button.dataset.taskId = project.id;
      const flap = doc.createElement('span');
      flap.className = 'mailbox-envelope-flap';
      flap.setAttribute('aria-hidden', 'true');
      const title = doc.createElement('strong');
      title.className = 'mailbox-envelope-title';
      title.textContent = project.title;
      const seal = doc.createElement('span');
      seal.className = 'mailbox-wax';
      seal.setAttribute('aria-hidden', 'true');
      seal.append(icon(doc, 'compass'));
      const action = doc.createElement('span');
      action.className = 'mailbox-envelope-action';
      action.textContent = '拆开委托';
      button.append(flap, title, seal, action);
      button.setAttribute('aria-label', `${project.title}，拆开委托`);
      projects.append(button);
      bind(button, project.id, view.onProject);
    }
    content.replaceChildren(courses, projects, status);
  }

  return Object.freeze({ render, reset, dispose() { if (!disposed) { reset(); disposed = true; } } });
}

                                    
                                
                                
                                     
                                      
                              
                                  
                                 
                               
                               
                                  
                                
                                
                              
 

export function arrangeProjectSheet(root             , parts                   )       {
  const doc = root.ownerDocument;
  const brief = doc.createElement('details');
  brief.className = 'project-brief';
  const briefTitle = doc.createElement('summary');
  briefTitle.textContent = '委托要求与学习顺序';
  brief.append(briefTitle, parts.summary, parts.requirements, parts.prerequisites, parts.readings);
  const packet = doc.createElement('section');
  packet.className = 'project-packet';
  const packetTitle = doc.createElement('h4');
  packetTitle.textContent = '带上材料';
  parts.links.className = 'project-downloads';
  packet.append(packetTitle, parts.links, parts.localHelp);
  parts.materials.className = 'project-submission';
  parts.history.className = 'project-history';
  root.className = 'project-sheet';
  root.replaceChildren(parts.heading, parts.accept, parts.status, brief, packet, parts.materials, parts.history, parts.receipt, parts.retry);
}

export function revealJournalSection(section             , focus            )          {
  for (let ancestor                     = section; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hidden) return false;
  }
  const leaf = section.closest             ('.journal-leaf-body');
  if (!leaf) { focus(); return false; }
  const pair = leaf.closest             ('.journal-page-pair');
  const view = section.ownerDocument.defaultView;
  const pane = [leaf, pair].find(candidate => candidate
    && /^(auto|scroll|overlay)$/.test(view?.getComputedStyle?.(candidate).overflowY ?? '')
    && candidate.scrollHeight > candidate.clientHeight);
  if (!pane) { focus(); return false; }
  if (pane.clientHeight <= 0) return false;
  const sectionRect = section.getBoundingClientRect();
  const paneRect = pane.getBoundingClientRect();
  if (sectionRect.height <= 0 || paneRect.height <= 0) return false;
  const scale = pane.offsetHeight > 0 ? paneRect.height / pane.offsetHeight : 1;
  const desiredTop = pane.scrollTop + (sectionRect.top - paneRect.top) / scale - pane.clientTop - 16;
  const maximumTop = Math.max(0, pane.scrollHeight - pane.clientHeight);
  pane.scrollTop = Math.max(0, Math.min(maximumTop, desiredTop));
  focus();
  return true;
}

                                
                         
                           
                             
                                  
 

export function pythonDisplayState(input               )                                                                       {
  if (input.running || input.phase === 'running') return 'running';
  if (input.phase === 'failed') return 'failed';
  if (input.phase === 'stopped' || input.phase === 'disposed') return 'stopped';
  if (input.phase !== 'ready') return 'preparing';
  return input.canRun ? 'ready' : 'blocked';
}

export function mountPythonStatus({ row, status, editor }                                                                                           ) {
  row.classList.add('python-state-row');
  const body = editor.querySelector('.editor-body');
  editor.insertBefore(row, body);
  return Object.freeze({
    render(input               )       {
      const state = pythonDisplayState(input);
      row.dataset.pythonState = state;
      if (state === 'blocked') status.textContent = input.blockedReason || '这节课暂不能运行 · 先查看课程要求';
      else if (state === 'ready') status.textContent = 'Python 已就绪 · 可以运行';
      else if (state === 'running') status.textContent = 'Python 正在运行';
      else if (state === 'preparing') status.textContent = 'Python 正在准备…';
    }
  });
}


//# sourceURL=../typed/journal-interactions.mts