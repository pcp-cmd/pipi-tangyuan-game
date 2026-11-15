                                                                                                       
                                                                                                                 
                                                                                                                                                
export class AssetLoadError extends Error {
           code                  ;
           url        ;
  constructor(code                  , url        ) { super(`${code}: ${url}`); this.name = 'AssetLoadError'; this.code = code; this.url = url; }
}
                             
                   
                       
                     
                       
                                       
                                           
                                          
                                
  

export async function loadVerifiedImage(asset            , options                = {})                       {
  const sourceUrl = new URL(asset.src, options.baseUrl ?? import.meta.url).href;
  const request = options.fetch ?? fetch;
  const createImage = options.createImage ?? (() => new Image());
  const createUrl = options.createObjectURL ?? URL.createObjectURL.bind(URL);
  const revokeUrl = options.revokeObjectURL ?? URL.revokeObjectURL.bind(URL);
  const controller = new AbortController();
  let objectUrl                    ;
  let image                              ;
  let timedOut = false;
  let disposed = false;
  const abortParent = () => controller.abort();
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 20000);
  options.signal?.addEventListener('abort', abortParent, { once: true });
  if (options.signal?.aborted) controller.abort();
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (image) image.src = '';
    if (objectUrl) revokeUrl(objectUrl);
  };
  let rejectAbort                          ;
  const aborted = new Promise       ((_, reject) => {
    rejectAbort = () => reject(new AssetLoadError(timedOut ? 'asset-timeout' : 'asset-aborted', sourceUrl));
    controller.signal.addEventListener('abort', rejectAbort, { once: true });
  });
  const work = async ()                       => {
    if (controller.signal.aborted) throw new AssetLoadError('asset-aborted', sourceUrl);
    const response = await request(sourceUrl, { signal: controller.signal });
    if (!response.ok) throw new AssetLoadError('asset-unavailable', sourceUrl);
    const bytes = await response.arrayBuffer();
    if (controller.signal.aborted) throw new AssetLoadError(timedOut ? 'asset-timeout' : 'asset-aborted', sourceUrl);
    if (asset.sha256) {
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      if (hash !== asset.sha256) throw new AssetLoadError('asset-identity', sourceUrl);
    }
    if (controller.signal.aborted) throw new AssetLoadError(timedOut ? 'asset-timeout' : 'asset-aborted', sourceUrl);
    if (!options.decodeFromSourceUrl) objectUrl = createUrl(new Blob([bytes], { type: response.headers.get('content-type') ?? 'application/octet-stream' }));
    image = createImage();
    image.decoding = 'async';
    image.src = objectUrl ?? sourceUrl;
    try { await image.decode(); } catch { throw new AssetLoadError('asset-decode', sourceUrl); }
    if (controller.signal.aborted) throw new AssetLoadError(timedOut ? 'asset-timeout' : 'asset-aborted', sourceUrl);
    if (image.naturalWidth !== asset.naturalWidth || image.naturalHeight !== asset.naturalHeight) throw new AssetLoadError('asset-dimensions', sourceUrl);
    return { image, sourceUrl, objectUrl: objectUrl ?? sourceUrl, dispose };
  };
  try { return await Promise.race([work(), aborted]); }
  catch (error) {
    dispose();
    if (error instanceof AssetLoadError) throw error;
    throw new AssetLoadError(controller.signal.aborted ? timedOut ? 'asset-timeout' : 'asset-aborted' : 'asset-unavailable', sourceUrl);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortParent);
    if (rejectAbort) controller.signal.removeEventListener('abort', rejectAbort);
  }
}

                           
                     
                       
                
                 
                                                  
  

export async function loadSceneAssets(scene             , baseUrl        , signal              )                                             {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const assets               = [{ src: scene.background, sha256: scene.assetSha256, naturalWidth: scene.width, naturalHeight: scene.height }, ...scene.hotspots.flatMap(hotspot => hotspot.asset ? [hotspot.asset] : [])];
  try {
    await Promise.all(assets.map(async asset => {
      const loaded = await loadVerifiedImage(asset, { baseUrl, signal: controller.signal, decodeFromSourceUrl: true });
      loaded.dispose();
    }));
    return { width: scene.width, height: scene.height };
  } catch (error) { controller.abort(); throw error; }
  finally { signal?.removeEventListener('abort', abort); }
}


//# sourceURL=../typed/asset-loader.mts