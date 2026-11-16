import { COURSE_ARTICLES } from './course-article-index.mjs';
import { renderKnowledgeText } from '../knowledge-reader.mjs';

                          
                            
                            
                          
 
                                                                   

export function createArticleLoader({ fetcher = fetch, timeoutMs = 15000 }   
                                             
  = {})                {
  const pending = new Map                          ();
  return lessonId => {
    if (!Object.hasOwn(COURSE_ARTICLES, lessonId)) return Promise.reject(new Error('未找到这节课的文章。'));
    const cached = pending.get(lessonId);
    if (cached) return cached;
    const source = COURSE_ARTICLES[lessonId];
    const request = (async ()                   => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetcher(new URL(source.path, import.meta.url), { signal: controller.signal, cache: 'no-cache' });
        if (!response.ok) throw new Error(`文章读取失败（${response.status}）。`);
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== source.bytes) throw new Error('文章不完整，请重新读取。');
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
        if (hash !== source.sha256) throw new Error('文章校验未通过，请重新读取。');
        return Object.freeze({ lessonId, markdown: new TextDecoder('utf-8', { fatal: true }).decode(bytes), sha256: hash });
      } finally { clearTimeout(timer); }
    })().catch((error         ) => { pending.delete(lessonId); throw error; });
    pending.set(lessonId, request);
    return request;
  };
}

const loadArticle = createArticleLoader();
// These six documents already ship with the six engineering assignments. The
// general knowledge renderer deliberately keeps arbitrary Markdown links inert.
const engineeringDocuments = new Set([
  '../integration/external-stockledger/README.md',
  '../integration/engineering-labs/evidence-research/learner/README.md',
  '../integration/engineering-labs/repo-repair/learner/README.md',
  '../integration/engineering-labs/durable-dispatch/learner/README.md',
  '../integration/engineering-labs/tool-bridge/learner/README.md',
  '../integration/engineering-labs/field-practice/learner/README.md',
]);

function connectEngineeringDocuments(root             )       {
  const doc = root.ownerDocument;
  function visit(parent      )       {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType !== 3) {
        if (node.nodeType !== 1 || !['PRE', 'CODE'].includes((node           ).tagName.toUpperCase())) visit(node);
        continue;
      }
      const text = node.textContent ?? '';
      const matches = [...text.matchAll(/\[([^\]\n]+)\]\(([^\s)]+)\)/g)].filter(match => engineeringDocuments.has(match[2]));
      if (!matches.length) continue;
      let cursor = 0;
      for (const match of matches) {
        parent.insertBefore(doc.createTextNode(text.slice(cursor, match.index)), node);
        const link = doc.createElement('a'); link.textContent = match[1]; link.href = match[2];
        const parts = match[2].split('/');
        link.download = `${parts.at(-2) === 'learner' ? parts.at(-3) : parts.at(-2)}-README.md`;
        link.className = 'article-engineering-document';
        link.setAttribute('aria-label', `${match[1]}：下载工程说明`);
        parent.insertBefore(link, node); cursor = match.index  + match[0].length;
      }
      parent.insertBefore(doc.createTextNode(text.slice(cursor)), node); parent.removeChild(node);
    }
  }
  visit(root);
}
                                                                       
const mounted = new WeakMap                          ();

export function mountCourseArticle({ root, lessonId, disclosure, loader = loadArticle }   
                                                                                                      
 )              {
  mounted.get(root)?.dispose();
  const doc = root.ownerDocument;
  let disposed = false, loaded = false, loading                       = null;
  const status = doc.createElement('p'); status.setAttribute('role', 'status');
  const retry = doc.createElement('button'); retry.type = 'button'; retry.className = 'text-button'; retry.textContent = '重新读取文章';
  root.replaceChildren(); root.dataset.articleLesson = lessonId; root.dataset.articleState = 'unopened';
  root.removeAttribute('aria-busy');
  delete root.dataset.articleSha256;
  function load()                {
    if (disposed || loaded) return Promise.resolve();
    if (loading) return loading;
    root.dataset.articleState = 'loading'; root.setAttribute('aria-busy', 'true');
    status.textContent = '正在翻开文章…'; root.replaceChildren(status);
    loading = loader(lessonId).then(article => {
      if (disposed) return;
      renderKnowledgeText(root, article.markdown);
      connectEngineeringDocuments(root);
      root.dataset.articleState = 'ready'; root.dataset.articleSha256 = article.sha256;
      loaded = true;
    }).catch((error         ) => {
      if (disposed) return;
      root.dataset.articleState = 'failed';
      status.textContent = error instanceof Error && error.name !== 'AbortError' ? error.message : '文章暂未读到，可以重试。';
      root.replaceChildren(status, retry);
    }).finally(() => {
      loading = null;
      if (!disposed) root.removeAttribute('aria-busy');
    });
    return loading;
  }
  const toggle = ()       => { if (disclosure?.open) void load(); };
  const retryLoad = ()       => { void load(); };
  retry.addEventListener('click', retryLoad);
  disclosure?.addEventListener('toggle', toggle);
  const view = Object.freeze({ load, dispose()       {
    if (disposed) return;
    disposed = true;
    disclosure?.removeEventListener('toggle', toggle);
    retry.removeEventListener('click', retryLoad);
    if (mounted.get(root) === view) mounted.delete(root);
  } });
  mounted.set(root, view);
  if (!disclosure || disclosure.open) void load();
  return view;
}


//# sourceURL=../typed/course-article.mts