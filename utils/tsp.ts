import { Coordinates, haversineDistance } from './distance';

export function nearestNeighborTSP(coords: Coordinates[]): number[] {
  if (coords.length === 0) return [];

  const n = coords.length;
  const visited = new Array(n).fill(false);
  const path: number[] = [];

  let current = 0;
  visited[current] = true;
  path.push(current);

  for (let step = 1; step < n; step++) {
    let nearest = -1;
    let minDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const dist = haversineDistance(coords[current], coords[i]);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
    }
    if (nearest !== -1) {
      visited[nearest] = true;
      path.push(nearest);
      current = nearest;
    }
  }
  return path;
}
