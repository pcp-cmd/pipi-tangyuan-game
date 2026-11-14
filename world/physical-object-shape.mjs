export function physicalObjectShape(item) {
  const points = item.highlightPolygon?.map(point => Array.isArray(point) ? point : [point.x, point.y]);
  if (!points || points.length < 3 || points.some(point => point.length !== 2 || point.some(value => !Number.isFinite(value)))) return null;
  const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
  const x = Math.min(...xs), y = Math.min(...ys), width = Math.max(...xs) - x, height = Math.max(...ys) - y;
  if (width <= 0 || height <= 0) return null;
  return Object.freeze({ x, y, width, height, points,
    clip: `polygon(${points.map(([px, py]) => `${(px - x) / width * 100}% ${(py - y) / height * 100}%`).join(',')})` });
}
