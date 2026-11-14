export function routesFromPort(ports, routes, portId) {
  if (!ports[portId]) return [];
  return routes.flatMap(route => {
    const next = route.fromPortId === portId ? route.toPortId : route.toPortId === portId ? route.fromPortId : null;
    return next && ports[next] ? [{ routeId: route.id, destination: ports[next] }] : [];
  });
}

export function planVoyage(ports, routes, fromPortId, toPortId) {
  if (!ports[fromPortId] || !ports[toPortId]) return null;
  const queue = [{ portId: fromPortId, steps: [] }], seen = new Set([fromPortId]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (current.portId === toPortId) return current.steps;
    for (const step of routesFromPort(ports, routes, current.portId)) {
      if (seen.has(step.destination.id)) continue;
      seen.add(step.destination.id);
      queue.push({ portId: step.destination.id, steps: [...current.steps, step] });
    }
  }
  return null;
}
