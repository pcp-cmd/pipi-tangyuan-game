// Return from a successful run without bypassing the host's save/navigation gate.
export async function returnToIsland({ closePanel, interior, focusWorld, focusTarget }) {
  if (!await closePanel()) return false;
  if (interior.isVisible()) interior.hide({ restoreFocus: false });
  focusWorld();
  // closePanel may have focused a workbench which is now hidden.
  focusTarget()?.focus({ preventScroll: true });
  return true;
}

export const panelCloseLabel = inWorkshop => inWorkshop ? '关闭面板，回到工坊' : '关闭面板，回到小岛';
