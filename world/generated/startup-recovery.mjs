                                  
                              
                          
                                
                                
 

export function mountStartupRecovery({ document: doc, reason, onExport, onManage }                        ) {
  const root = doc.createElement('section');
  root.className = 'journey-start-error';
  root.id = 'startupRecovery';
  root.setAttribute('aria-labelledby', 'startupRecoveryTitle');
  const title = doc.createElement('h2');
  title.id = 'startupRecoveryTitle';
  title.textContent = '先保留这次旅程';
  const message = doc.createElement('p');
  message.textContent = reason;
  const original = doc.createElement('button');
  original.type = 'button';
  original.textContent = '导出原始旅程数据';
  original.addEventListener('click', onExport);
  const manage = doc.createElement('button');
  manage.type = 'button';
  manage.textContent = '打开恢复面板';
  manage.addEventListener('click', onManage);
  root.append(title, message, original, manage);
  doc.body.append(root);
  return { dispose() { original.removeEventListener('click', onExport); manage.removeEventListener('click', onManage); root.remove(); } };
}


//# sourceURL=../typed/startup-recovery.mts