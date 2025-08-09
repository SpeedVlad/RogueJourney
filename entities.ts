export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  type: 'wall' | 'floor' | 'stairs';
  x: number;
  y: number;
  symbol: string;
  color: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'aura' | 'consumable';
  symbol: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  
  // Weapon properties
  damage?: number;
  
  // Armor properties  
  defense?: number;
  
  // Consumable properties
  healingPower?: number;
  manaPower?: number;
  
  // Aura properties
  healthBonus?: number;
  manaBonus?: number;
  experienceBonus?: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  symbol: string;
  color: string;
  health: number;
  maxHealth: number;
  attackPower: number;
  defense: number;
  speed: number;
  lastMoveTime: number;
}

export interface Player extends Entity {
  level: number;
  experience: number;
  isAttacking?: boolean;
  attackTarget?: Position;
  experienceToNext: number;
  mana: number;
  maxMana: number;
  inventory: Item[];
  inventorySize: number;
  weapon: Item | null;
  armor: Item | null;
  aura: Item | null;
}

export interface Enemy extends Entity {
  type: 'goblin' | 'orc' | 'skeleton' | 'dragon';
  ai: 'passive' | 'aggressive' | 'guard';
  experienceValue: number;
  lootTable: Item[];
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  connected: boolean;
}

export interface Dungeon {
  width: number;
  height: number;
  tiles: Tile[];
  rooms: Room[];
  stairs: Position;
  items: Array<Item & Position>;
}

export interface Message {
  text: string;
  type: 'info' | 'damage' | 'success';
  timestamp: number;
}

export type GamePhase = 'ready' | 'playing' | 'gameOver';

export interface GameState {
  gamePhase: GamePhase;
  level: number;
  score: number;
  player: Player;
  enemies: Enemy[];
  dungeon: Dungeon;
  visibleTiles: Position[];
  exploredTiles: Position[];
  messages: Message[];
  showInventory: boolean;
}
