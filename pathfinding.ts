import { Position, Tile } from './entities';

export interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost
  parent: PathNode | null;
}

export function findPath(
  start: Position,
  end: Position,
  tiles: Tile[],
  width: number,
  height: number,
  maxDistance: number = 15
): Position[] {
  // Simple A* pathfinding implementation
  const openList: PathNode[] = [];
  const closedList: Set<string> = new Set();
  
  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  
  openList.push(startNode);
  
  while (openList.length > 0) {
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const currentNode = openList[currentIndex];
    openList.splice(currentIndex, 1);
    closedList.add(`${currentNode.x},${currentNode.y}`);
    
    // Check if we reached the target
    if (currentNode.x === end.x && currentNode.y === end.y) {
      const path: Position[] = [];
      let node: PathNode | null = currentNode;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path.slice(1); // Remove the starting position
    }
    
    // Check neighbors
    const neighbors = [
      { x: currentNode.x + 1, y: currentNode.y },
      { x: currentNode.x - 1, y: currentNode.y },
      { x: currentNode.x, y: currentNode.y + 1 },
      { x: currentNode.x, y: currentNode.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      
      // Check bounds
      if (neighbor.x < 0 || neighbor.x >= width || neighbor.y < 0 || neighbor.y >= height) {
        continue;
      }
      
      // Check if already processed
      if (closedList.has(key)) {
        continue;
      }
      
      // Check if walkable
      const tileIndex = neighbor.y * width + neighbor.x;
      const tile = tiles[tileIndex];
      if (tile.type === 'wall') {
        continue;
      }
      
      // Check distance limit
      if (heuristic(start, neighbor) > maxDistance) {
        continue;
      }
      
      const g = currentNode.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;
      
      // Check if this path to neighbor is better
      const existingNodeIndex = openList.findIndex(node => node.x === neighbor.x && node.y === neighbor.y);
      if (existingNodeIndex >= 0) {
        if (g < openList[existingNodeIndex].g) {
          openList[existingNodeIndex].g = g;
          openList[existingNodeIndex].f = f;
          openList[existingNodeIndex].parent = currentNode;
        }
      } else {
        const neighborNode: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: currentNode
        };
        openList.push(neighborNode);
      }
    }
  }
  
  return []; // No path found
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getSimpleDirection(from: Position, to: Position): Position {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Normalize to -1, 0, or 1
  const moveX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
  const moveY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
  
  // Prefer moving in the direction of the larger difference
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: moveX, y: 0 };
  } else {
    return { x: 0, y: moveY };
  }
}
