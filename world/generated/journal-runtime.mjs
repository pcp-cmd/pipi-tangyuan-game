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
  const [explorer, pages, rows, graduation] = await Promise.all([
    import('../journal-explorer.mjs'),
    import('./journal-pages.mjs'),
    import('./journal-course-row.mjs'),
    import('../classroom-graduation.mjs'),
  ]);
  return { ...explorer, ...pages, ...rows, ...graduation };
});

export const loadExternalWorkRuntime = createRuntimeLoader(() => import('../external-work-panel.mjs'));


//# sourceURL=../typed/journal-runtime.mts