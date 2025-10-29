import random
from typing import List
from game.game_objects import Dungeon, Room, Tile, Position
from game.items import generate_random_item

class DungeonGenerator:
    def __init__(self, width: int = 80, height: int = 50):
        self.width = width
        self.height = height
        self.min_room_size = 4
        self.max_room_size = 12
        self.max_rooms = 15
    
    def generate(self) -> Dungeon:
        print("Generating dungeon...")
        
        tiles = []
        rooms = []
        
        for y in range(self.height):
            for x in range(self.width):
                tiles.append(Tile(
                    type='wall',
                    x=x,
                    y=y,
                    symbol='#',
                    color=(68, 68, 68)
                ))
        
        for i in range(self.max_rooms):
            room = self.generate_room()
            if self.can_place_room(room, rooms):
                self.carve_room(room, tiles)
                rooms.append(room)
        
        self.connect_rooms(rooms, tiles)
        
        stairs_room = rooms[-1]
        stairs = Position(x=stairs_room.center_x, y=stairs_room.center_y)
        
        stairs_index = stairs.y * self.width + stairs.x
        tiles[stairs_index] = Tile(
            type='stairs',
            x=stairs.x,
            y=stairs.y,
            symbol='>',
            color=(255, 255, 0)
        )
        
        items = self.generate_items(rooms)
        
        print(f"Generated dungeon with {len(rooms)} rooms")
        
        return Dungeon(
            width=self.width,
            height=self.height,
            tiles=tiles,
            rooms=rooms,
            stairs=stairs,
            items=items
        )
    
    def generate_room(self) -> Room:
        width = random.randint(self.min_room_size, self.max_room_size)
        height = random.randint(self.min_room_size, self.max_room_size)
        x = random.randint(1, self.width - width - 1)
        y = random.randint(1, self.height - height - 1)
        
        return Room(
            x=x,
            y=y,
            width=width,
            height=height,
            center_x=x + width // 2,
            center_y=y + height // 2,
            connected=False
        )
    
    def can_place_room(self, new_room: Room, existing_rooms: List[Room]) -> bool:
        for room in existing_rooms:
            if (new_room.x < room.x + room.width + 1 and
                new_room.x + new_room.width + 1 > room.x and
                new_room.y < room.y + room.height + 1 and
                new_room.y + new_room.height + 1 > room.y):
                return False
        return True
    
    def carve_room(self, room: Room, tiles: List[Tile]) -> None:
        for y in range(room.y, room.y + room.height):
            for x in range(room.x, room.x + room.width):
                index = y * self.width + x
                tiles[index] = Tile(
                    type='floor',
                    x=x,
                    y=y,
                    symbol='.',
                    color=(102, 102, 102)
                )
    
    def connect_rooms(self, rooms: List[Room], tiles: List[Tile]) -> None:
        for i in range(1, len(rooms)):
            room_a = rooms[i - 1]
            room_b = rooms[i]
            self.create_corridor(room_a.center_x, room_a.center_y, room_b.center_x, room_b.center_y, tiles)
    
    def create_corridor(self, x1: int, y1: int, x2: int, y2: int, tiles: List[Tile]) -> None:
        current_x = x1
        current_y = y1
        
        while current_x != x2:
            index = current_y * self.width + current_x
            if tiles[index].type == 'wall':
                tiles[index] = Tile(
                    type='floor',
                    x=current_x,
                    y=current_y,
                    symbol='.',
                    color=(102, 102, 102)
                )
            current_x += 1 if current_x < x2 else -1
        
        while current_y != y2:
            index = current_y * self.width + current_x
            if tiles[index].type == 'wall':
                tiles[index] = Tile(
                    type='floor',
                    x=current_x,
                    y=current_y,
                    symbol='.',
                    color=(102, 102, 102)
                )
            current_y += 1 if current_y < y2 else -1
    
    def generate_items(self, rooms: List[Room]) -> List:
        items = []
        
        for i in range(1, len(rooms)):
            room = rooms[i]
            item_count = random.randint(1, 3)
            
            for j in range(item_count):
                item = generate_random_item()
                x = room.x + random.randint(1, room.width - 2)
                y = room.y + random.randint(1, room.height - 2)
                
                item.x = x
                item.y = y
                items.append(item)
        
        return items
