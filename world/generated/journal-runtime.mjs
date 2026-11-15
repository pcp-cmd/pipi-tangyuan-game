export function createRuntimeLoader   (load                  )                   {
  let pending                        ;
  return () => pending ??= load().catch((error         ) => { pending = undefined; throw error; });
}

export const loadPaperRuntime = createRuntimeLoader(async () => {
  const [interactions, controls] = await Promise.all([
    import('./journal-interactions.mjs'),
    import('./paper-controls.mjs'),
  ]);
  return { ...interactions, ...controls };
});

export const loadJournalRuntime = createRuntimeLoader(async () => {
  const [explorer, pages, external, graduation] = await Promise.all([
    import('../journal-explorer.mjs'),
    import('../journal-pages.mjs'),
    import('../external-work-panel.mjs'),
    import('../classroom-graduation.mjs'),
  ]);
  return { ...explorer, ...pages, ...external, ...graduation };
});


//# sourceURL=../typed/journal-runtime.mts