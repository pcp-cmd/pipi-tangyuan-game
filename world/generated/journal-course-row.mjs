/** The explorer constructs each row once and retains ownership of its actions. */
                                 
                                
                              
                                
                                     
                             
                               
                                           
 

                            
                                
                                       
                                
                                
 

export function buildCourseRow({ article, title, ordinal, action, art, badge, detailsContent }                )            {
  const doc = article.ownerDocument;
  const fullTitleText = title.textContent ?? '';
  title.title = fullTitleText;
  const main = doc.createElement('div');
  main.className = 'course-row-main';
  const copy = doc.createElement('div');
  copy.className = 'course-row-copy';
  copy.append(ordinal, title);
  if (badge) copy.append(badge);
  copy.append(action);
  if (art) main.append(art);
  main.append(copy);

  const details = doc.createElement('details');
  details.className = 'course-row-details';
  const summary = doc.createElement('summary');
  summary.textContent = '翻开';
  summary.setAttribute('aria-label', `${fullTitleText}：展开课程内容、学习记录与学习顺序`);
  const body = doc.createElement('div');
  body.className = 'course-row-body';
  const fullTitle = doc.createElement('p');
  fullTitle.className = 'course-full-title';
  fullTitle.textContent = fullTitleText;
  body.append(fullTitle, ...detailsContent);
  details.append(summary, body);
  article.dataset.bookRow = 'true';
  article.append(main, details);
  return Object.freeze({ main, details, body, summary });
}

export function wrapCurrentCompatibilityNote(note             )                     {
  const doc = note.ownerDocument;
  const details = doc.createElement('details');
  details.className = 'journal-current-notes';
  const summary = doc.createElement('summary');
  summary.textContent = '本课记录说明';
  details.append(summary, note);
  return details;
}


//# sourceURL=../typed/journal-course-row.mts