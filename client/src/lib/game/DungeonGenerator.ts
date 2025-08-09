import { Dungeon, Room, Tile, Position } from './entities';
import { generateRandomItem } from './items';

export class DungeonGenerator {
  private width: number;
  private height: number;
  private minRoomSize: number = 4;
  private maxRoomSize: number = 12;
  private maxRooms: number = 15;

  constructor(width: number = 80, height: number = 50) {
    this.width = width;
    this.height = height;
  }

  generate(): Dungeon {
    console.log("Generating dungeon...");
    
    const tiles: Tile[] = [];
    const rooms: Room[] = [];

    // Initialize all tiles as walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tiles.push({
          type: 'wall',
          x,
          y,
          symbol: '#',
          color: '#444444'
        });
      }
    }

    // Generate rooms
    for (let i = 0; i < this.maxRooms; i++) {
      const room = this.generateRoom();
      if (this.canPlaceRoom(room, rooms)) {
        this.carveRoom(room, tiles);
        rooms.push(room);
      }
    }

    // Connect rooms with corridors
    this.connectRooms(rooms, tiles);

    // Place stairs in the last room
    const stairsRoom = rooms[rooms.length - 1];
    const stairs: Position = {
      x: stairsRoom.centerX,
      y: stairsRoom.centerY
    };

    // Set stairs tile
    const stairsIndex = stairs.y * this.width + stairs.x;
    tiles[stairsIndex] = {
      type: 'stairs',
      x: stairs.x,
      y: stairs.y,
      symbol: '>',
      color: '#ffff00'
    };

    // Generate items
    const items = this.generateItems(rooms);

    console.log(`Generated dungeon with ${rooms.length} rooms`);

    return {
      width: this.width,
      height: this.height,
      tiles,
      rooms,
      stairs,
      items
    };
  }

  private generateRoom(): Room {
    const width = Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
    const height = Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
    const x = Math.floor(Math.random() * (this.width - width - 1)) + 1;
    const y = Math.floor(Math.random() * (this.height - height - 1)) + 1;

    return {
      x,
      y,
      width,
      height,
      centerX: x + Math.floor(width / 2),
      centerY: y + Math.floor(height / 2),
      connected: false
    };
  }

  private canPlaceRoom(newRoom: Room, existingRooms: Room[]): boolean {
    for (const room of existingRooms) {
      if (newRoom.x < room.x + room.width + 1 &&
          newRoom.x + newRoom.width + 1 > room.x &&
          newRoom.y < room.y + room.height + 1 &&
          newRoom.y + newRoom.height + 1 > room.y) {
        return false;
      }
    }
    return true;
  }

  private carveRoom(room: Room, tiles: Tile[]): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        const index = y * this.width + x;
        tiles[index] = {
          type: 'floor',
          x,
          y,
          symbol: '.',
          color: '#666666'
        };
      }
    }
  }

  private connectRooms(rooms: Room[], tiles: Tile[]): void {
    for (let i = 1; i < rooms.length; i++) {
      const roomA = rooms[i - 1];
      const roomB = rooms[i];
      
      this.createCorridor(roomA.centerX, roomA.centerY, roomB.centerX, roomB.centerY, tiles);
    }
  }

  private createCorridor(x1: number, y1: number, x2: number, y2: number, tiles: Tile[]): void {
    // Create L-shaped corridor
    let currentX = x1;
    let currentY = y1;

    // Move horizontally first
    while (currentX !== x2) {
      const index = currentY * this.width + currentX;
      if (tiles[index].type === 'wall') {
        tiles[index] = {
          type: 'floor',
          x: currentX,
          y: currentY,
          symbol: '.',
          color: '#666666'
        };
      }
      currentX += currentX < x2 ? 1 : -1;
    }

    // Then move vertically
    while (currentY !== y2) {
      const index = currentY * this.width + currentX;
      if (tiles[index].type === 'wall') {
        tiles[index] = {
          type: 'floor',
          x: currentX,
          y: currentY,
          symbol: '.',
          color: '#666666'
        };
      }
      currentY += currentY < y2 ? 1 : -1;
    }
  }

  private generateItems(rooms: Room[]): Array<{ x: number; y: number } & any> {
    const items: Array<{ x: number; y: number } & any> = [];
    
    // Generate 1-3 items per room (excluding first room which is for player spawn)
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      const itemCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < itemCount; j++) {
        const item = generateRandomItem();
        const x = room.x + Math.floor(Math.random() * (room.width - 2)) + 1;
        const y = room.y + Math.floor(Math.random() * (room.height - 2)) + 1;
        
        items.push({
          ...item,
          x,
          y
        });
      }
    }
    
    return items;
  }
}
