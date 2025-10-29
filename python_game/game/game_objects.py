from dataclasses import dataclass, field
from typing import List, Literal, Optional
import time

@dataclass
class Position:
    x: int
    y: int

@dataclass
class Tile:
    type: Literal['wall', 'floor', 'stairs']
    x: int
    y: int
    symbol: str
    color: tuple

@dataclass
class Item:
    id: str
    name: str
    description: str
    type: Literal['weapon', 'armor', 'aura', 'consumable']
    symbol: str
    color: tuple
    rarity: Literal['common', 'uncommon', 'rare', 'legendary', 'mythic']
    damage: Optional[int] = None
    defense: Optional[int] = None
    healing_power: Optional[int] = None
    mana_power: Optional[int] = None
    health_bonus: Optional[int] = None
    mana_bonus: Optional[int] = None
    experience_bonus: Optional[int] = None
    x: int = 0
    y: int = 0

@dataclass
class Entity:
    id: str
    x: int
    y: int
    symbol: str
    color: tuple
    health: int
    max_health: int
    attack_power: int
    defense: int
    speed: int
    last_move_time: float = 0

@dataclass
class Player(Entity):
    level: int = 1
    experience: int = 0
    experience_to_next: int = 100
    mana: int = 50
    max_mana: int = 50
    inventory: List[Item] = field(default_factory=list)
    inventory_size: int = 20
    weapon: Optional[Item] = None
    armor: Optional[Item] = None
    aura: Optional[Item] = None
    is_attacking: bool = False
    attack_target: Optional[Position] = None

@dataclass
class Enemy(Entity):
    type: Literal['goblin', 'orc', 'skeleton', 'dragon'] = 'goblin'
    ai: Literal['passive', 'aggressive', 'guard'] = 'aggressive'
    experience_value: int = 0
    loot_table: List[Item] = field(default_factory=list)

@dataclass
class Room:
    x: int
    y: int
    width: int
    height: int
    center_x: int
    center_y: int
    connected: bool = False

@dataclass
class Dungeon:
    width: int
    height: int
    tiles: List[Tile]
    rooms: List[Room]
    stairs: Position
    items: List[Item]

@dataclass
class Message:
    text: str
    type: Literal['info', 'damage', 'success']
    timestamp: float

GamePhase = Literal['ready', 'playing', 'game_over']

@dataclass
class GameState:
    game_phase: GamePhase
    level: int
    score: int
    player: Player
    enemies: List[Enemy]
    dungeon: Dungeon
    visible_tiles: List[Position]
    explored_tiles: List[Position]
    messages: List[Message]
    show_inventory: bool = False
    popup_message: Optional[dict] = None
