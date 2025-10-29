from dataclasses import dataclass
from typing import List, Optional, Set
from game.game_objects import Position, Tile

@dataclass
class PathNode:
    x: int
    y: int
    g: int
    h: int
    f: int
    parent: Optional['PathNode'] = None

def find_path(start: Position, end: Position, tiles: List[Tile], width: int, height: int, max_distance: int = 15) -> List[Position]:
    open_list: List[PathNode] = []
    closed_list: Set[str] = set()
    
    start_node = PathNode(
        x=start.x,
        y=start.y,
        g=0,
        h=heuristic(start, end),
        f=0
    )
    start_node.f = start_node.g + start_node.h
    
    open_list.append(start_node)
    
    while open_list:
        current_index = 0
        for i in range(1, len(open_list)):
            if open_list[i].f < open_list[current_index].f:
                current_index = i
        
        current_node = open_list.pop(current_index)
        closed_list.add(f"{current_node.x},{current_node.y}")
        
        if current_node.x == end.x and current_node.y == end.y:
            path = []
            node = current_node
            while node:
                path.insert(0, Position(x=node.x, y=node.y))
                node = node.parent
            return path[1:]
        
        neighbors = [
            {'x': current_node.x + 1, 'y': current_node.y},
            {'x': current_node.x - 1, 'y': current_node.y},
            {'x': current_node.x, 'y': current_node.y + 1},
            {'x': current_node.x, 'y': current_node.y - 1}
        ]
        
        for neighbor in neighbors:
            key = f"{neighbor['x']},{neighbor['y']}"
            
            if neighbor['x'] < 0 or neighbor['x'] >= width or neighbor['y'] < 0 or neighbor['y'] >= height:
                continue
            
            if key in closed_list:
                continue
            
            tile_index = neighbor['y'] * width + neighbor['x']
            tile = tiles[tile_index]
            if tile.type == 'wall':
                continue
            
            if heuristic(Position(x=start.x, y=start.y), Position(x=neighbor['x'], y=neighbor['y'])) > max_distance:
                continue
            
            g = current_node.g + 1
            h = heuristic(Position(x=neighbor['x'], y=neighbor['y']), end)
            f = g + h
            
            existing_node_index = None
            for i, node in enumerate(open_list):
                if node.x == neighbor['x'] and node.y == neighbor['y']:
                    existing_node_index = i
                    break
            
            if existing_node_index is not None:
                if g < open_list[existing_node_index].g:
                    open_list[existing_node_index].g = g
                    open_list[existing_node_index].f = f
                    open_list[existing_node_index].parent = current_node
            else:
                neighbor_node = PathNode(
                    x=neighbor['x'],
                    y=neighbor['y'],
                    g=g,
                    h=h,
                    f=f,
                    parent=current_node
                )
                open_list.append(neighbor_node)
    
    return []

def heuristic(a: Position, b: Position) -> int:
    return abs(a.x - b.x) + abs(a.y - b.y)

def get_simple_direction(from_pos: Position, to_pos: Position) -> Position:
    dx = to_pos.x - from_pos.x
    dy = to_pos.y - from_pos.y
    
    move_x = 0 if dx == 0 else (1 if dx > 0 else -1)
    move_y = 0 if dy == 0 else (1 if dy > 0 else -1)
    
    if abs(dx) > abs(dy):
        return Position(x=move_x, y=0)
    else:
        return Position(x=0, y=move_y)
