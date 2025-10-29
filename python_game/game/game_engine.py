import time
import random
import math
from typing import List, Optional
from copy import deepcopy
from game.game_objects import (
    GameState, Player, Enemy, Position, Message, Tile, Item
)
from game.dungeon_generator import DungeonGenerator
from game.pathfinding import find_path, get_simple_direction
from game.combat import perform_attack, gain_experience, get_enemy_name
from game.items import generate_random_item

class GameEngine:
    def __init__(self):
        self.game_state: Optional[GameState] = None
    
    def initialize(self) -> GameState:
        print("Initializing game engine")
        
        dungeon_generator = DungeonGenerator(80, 50)
        dungeon = dungeon_generator.generate()
        
        start_room = dungeon.rooms[0]
        player = Player(
            id='player',
            x=start_room.center_x,
            y=start_room.center_y,
            symbol='👾',
            color=(0, 170, 255),
            health=100,
            max_health=100,
            attack_power=10,
            defense=2,
            speed=1,
            last_move_time=0,
            level=1,
            experience=0,
            experience_to_next=100,
            mana=50,
            max_mana=50,
            inventory=[],
            inventory_size=20,
            weapon=None,
            armor=None,
            aura=None
        )
        
        enemies = self.generate_enemies(dungeon, 1)
        
        visible_tiles = self.calculate_visibility(player, dungeon.tiles, dungeon.width, dungeon.height)
        explored_tiles = visible_tiles.copy()
        
        self.game_state = GameState(
            game_phase='ready',
            level=1,
            score=0,
            player=player,
            enemies=enemies,
            dungeon=dungeon,
            visible_tiles=visible_tiles,
            explored_tiles=explored_tiles,
            messages=[
                Message(text="Welcome to the dungeon! Find the stairs to descend deeper.", type='info', timestamp=time.time())
            ],
            show_inventory=False
        )
        
        return self.game_state
    
    def start_game(self) -> GameState:
        if not self.game_state:
            raise Exception("Game not initialized")
        
        self.game_state.game_phase = 'playing'
        self.add_message("Your adventure begins! Use WASD to move, Space to attack, C for inventory.")
        
        return self.game_state
    
    def move_player(self, dx: int, dy: int) -> GameState:
        if not self.game_state or self.game_state.game_phase != 'playing':
            return self.game_state
        
        new_x = self.game_state.player.x + dx
        new_y = self.game_state.player.y + dy
        
        if (new_x < 0 or new_x >= self.game_state.dungeon.width or
            new_y < 0 or new_y >= self.game_state.dungeon.height):
            return self.game_state
        
        tile_index = new_y * self.game_state.dungeon.width + new_x
        tile = self.game_state.dungeon.tiles[tile_index]
        if tile.type == 'wall':
            return self.game_state
        
        enemy_at_position = None
        for enemy in self.game_state.enemies:
            if enemy.x == new_x and enemy.y == new_y:
                enemy_at_position = enemy
                break
        
        if enemy_at_position:
            return self.attack_enemy(enemy_at_position)
        
        self.game_state.player.x = new_x
        self.game_state.player.y = new_y
        
        self.check_item_pickup()
        self.update_visibility()
        
        return self.game_state
    
    def player_attack(self) -> GameState:
        if not self.game_state or self.game_state.game_phase != 'playing':
            return self.game_state
        
        adjacent_enemies = []
        for enemy in self.game_state.enemies:
            dx = abs(enemy.x - self.game_state.player.x)
            dy = abs(enemy.y - self.game_state.player.y)
            if (dx == 1 and dy == 0) or (dx == 0 and dy == 1):
                adjacent_enemies.append(enemy)
        
        if not adjacent_enemies:
            self.add_message("There's nothing to attack here.")
            return self.game_state
        
        return self.attack_enemy(adjacent_enemies[0])
    
    def use_stairs(self) -> GameState:
        if not self.game_state or self.game_state.game_phase != 'playing':
            return self.game_state
        
        player = self.game_state.player
        dungeon = self.game_state.dungeon
        
        if player.x == dungeon.stairs.x and player.y == dungeon.stairs.y:
            if self.game_state.enemies:
                self.add_message(f"You must defeat all {len(self.game_state.enemies)} remaining enemies before proceeding to the next floor!", 'info')
                return self.game_state
            return self.descend_level()
        else:
            self.add_message("You need to find the stairs first! Look for '>' symbol.")
            return self.game_state
    
    def attack_enemy(self, enemy: Enemy) -> GameState:
        if not self.game_state:
            return self.game_state
        
        result = perform_attack(self.game_state.player, enemy)
        self.add_message(result['message'], 'damage')
        
        if result['killed']:
            exp_result = gain_experience(self.game_state.player, enemy.experience_value)
            self.add_message(exp_result['message'], 'success')
            
            self.game_state.enemies = [e for e in self.game_state.enemies if e.id != enemy.id]
            
            for item in enemy.loot_table:
                item.x = enemy.x
                item.y = enemy.y
                self.game_state.dungeon.items.append(item)
        else:
            enemy_result = perform_attack(enemy, self.game_state.player)
            self.add_message(enemy_result['message'], 'damage')
            
            if enemy_result['killed']:
                self.game_state.game_phase = 'game_over'
                self.add_message("You have died! Game Over.", 'damage')
        
        return self.game_state
    
    def descend_level(self) -> GameState:
        if not self.game_state:
            return self.game_state
        
        self.game_state.level += 1
        self.game_state.score += 100 * self.game_state.level
        
        self.add_message(f"You descend to level {self.game_state.level}!", 'success')
        
        dungeon_generator = DungeonGenerator(80, 50)
        dungeon = dungeon_generator.generate()
        
        start_room = dungeon.rooms[0]
        self.game_state.player.x = start_room.center_x
        self.game_state.player.y = start_room.center_y
        
        self.game_state.dungeon = dungeon
        self.game_state.enemies = self.generate_enemies(dungeon, self.game_state.level)
        
        self.update_visibility()
        
        return self.game_state
    
    def check_item_pickup(self):
        if not self.game_state:
            return
        
        player = self.game_state.player
        items = self.game_state.dungeon.items
        
        items_at_position = [item for item in items if item.x == player.x and item.y == player.y]
        
        for item in items_at_position:
            if len(player.inventory) < player.inventory_size:
                player.inventory.append(item)
                self.game_state.dungeon.items = [i for i in items if i.id != item.id]
                self.add_message(f"You picked up {item.name}.", 'success')
            else:
                self.add_message("Your inventory is full!")
    
    def update_visibility(self):
        if not self.game_state:
            return
        
        self.game_state.visible_tiles = self.calculate_visibility(
            self.game_state.player,
            self.game_state.dungeon.tiles,
            self.game_state.dungeon.width,
            self.game_state.dungeon.height
        )
        
        for tile in self.game_state.visible_tiles:
            if not any(t.x == tile.x and t.y == tile.y for t in self.game_state.explored_tiles):
                self.game_state.explored_tiles.append(tile)
    
    def calculate_visibility(self, player: Player, tiles: List[Tile], width: int, height: int) -> List[Position]:
        visible = []
        radius = 8
        
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                x = player.x + dx
                y = player.y + dy
                
                if x < 0 or x >= width or y < 0 or y >= height:
                    continue
                
                distance = math.sqrt(dx * dx + dy * dy)
                if distance <= radius:
                    if self.has_line_of_sight(player.x, player.y, x, y, tiles, width):
                        visible.append(Position(x=x, y=y))
        
        return visible
    
    def has_line_of_sight(self, x1: int, y1: int, x2: int, y2: int, tiles: List[Tile], width: int) -> bool:
        dx = abs(x2 - x1)
        dy = abs(y2 - y1)
        sx = 1 if x1 < x2 else -1
        sy = 1 if y1 < y2 else -1
        err = dx - dy
        
        x, y = x1, y1
        
        while True:
            if x == x2 and y == y2:
                return True
            
            index = y * width + x
            if tiles[index].type == 'wall':
                return False
            
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x += sx
            if e2 < dx:
                err += dx
                y += sy
    
    def generate_enemies(self, dungeon, current_floor: int) -> List[Enemy]:
        enemies = []
        enemy_types = [
            {'type': 'goblin', 'symbol': '👽', 'color': (0, 170, 0), 'health': 40, 'attack': 8, 'defense': 2, 'exp': 15},
            {'type': 'orc', 'symbol': '👹', 'color': (170, 0, 0), 'health': 70, 'attack': 12, 'defense': 4, 'exp': 25},
            {'type': 'skeleton', 'symbol': '💀', 'color': (204, 204, 204), 'health': 30, 'attack': 10, 'defense': 1, 'exp': 20}
        ]
        
        floor_multiplier = pow(2, current_floor - 1)
        
        for i in range(1, len(dungeon.rooms)):
            room = dungeon.rooms[i]
            enemy_count = random.randint(2, 4)
            
            for j in range(enemy_count):
                enemy_type = random.choice(enemy_types)
                x = room.x + random.randint(1, room.width - 2)
                y = room.y + random.randint(1, room.height - 2)
                
                scaled_health = int(enemy_type['health'] * floor_multiplier)
                scaled_attack = int(enemy_type['attack'] * floor_multiplier)
                scaled_defense = int(enemy_type['defense'] * floor_multiplier)
                scaled_exp = int(enemy_type['exp'] * floor_multiplier)
                
                enemies.append(Enemy(
                    id=f"{enemy_type['type']}_{i}_{j}",
                    x=x,
                    y=y,
                    symbol=enemy_type['symbol'],
                    color=enemy_type['color'],
                    health=scaled_health,
                    max_health=scaled_health,
                    attack_power=scaled_attack,
                    defense=scaled_defense,
                    speed=1,
                    last_move_time=0,
                    type=enemy_type['type'],
                    ai='aggressive',
                    experience_value=scaled_exp,
                    loot_table=[]
                ))
        
        return enemies
    
    def update_enemies(self):
        if not self.game_state:
            return
        
        for enemy in self.game_state.enemies:
            dx = abs(enemy.x - self.game_state.player.x)
            dy = abs(enemy.y - self.game_state.player.y)
            distance = dx + dy
            
            if distance <= 10:
                path = find_path(
                    Position(x=enemy.x, y=enemy.y),
                    Position(x=self.game_state.player.x, y=self.game_state.player.y),
                    self.game_state.dungeon.tiles,
                    self.game_state.dungeon.width,
                    self.game_state.dungeon.height
                )
                
                if path and len(path) > 0:
                    next_pos = path[0]
                    
                    tile_index = next_pos.y * self.game_state.dungeon.width + next_pos.x
                    tile = self.game_state.dungeon.tiles[tile_index]
                    
                    if tile.type != 'wall':
                        other_enemy = None
                        for other in self.game_state.enemies:
                            if other.id != enemy.id and other.x == next_pos.x and other.y == next_pos.y:
                                other_enemy = other
                                break
                        
                        if not other_enemy:
                            enemy.x = next_pos.x
                            enemy.y = next_pos.y
    
    def use_item(self, index: int) -> GameState:
        if not self.game_state or index >= len(self.game_state.player.inventory):
            return self.game_state
        
        item = self.game_state.player.inventory[index]
        
        if item.type != 'consumable':
            self.add_message("This item cannot be consumed.")
            return self.game_state
        
        new_health = self.game_state.player.health
        new_mana = self.game_state.player.mana
        health_gained = 0
        mana_gained = 0
        
        if item.healing_power:
            health_before = new_health
            new_health = min(self.game_state.player.max_health, new_health + item.healing_power)
            health_gained = new_health - health_before
        
        if item.mana_power:
            mana_before = new_mana
            new_mana = min(self.game_state.player.max_mana, new_mana + item.mana_power)
            mana_gained = new_mana - mana_before
        
        self.game_state.player.inventory.pop(index)
        self.game_state.player.health = new_health
        self.game_state.player.mana = new_mana
        self.game_state.show_inventory = True
        
        message = f"You use {item.name}."
        if health_gained > 0:
            message += f" +{health_gained} health."
        if mana_gained > 0:
            message += f" +{mana_gained} mana."
        
        self.add_message(message, 'success')
        
        return self.game_state
    
    def equip_item(self, index: int) -> GameState:
        if not self.game_state or index >= len(self.game_state.player.inventory):
            return self.game_state
        
        item = self.game_state.player.inventory[index]
        player = self.game_state.player
        
        if item.type == 'weapon':
            if player.weapon:
                player.inventory.append(player.weapon)
                player.attack_power -= player.weapon.damage or 0
            
            player.weapon = item
            player.attack_power += item.damage or 0
            self.add_message(f"You equip {item.name}.", 'success')
            
        elif item.type == 'armor':
            if player.armor:
                player.inventory.append(player.armor)
                player.defense -= player.armor.defense or 0
            
            player.armor = item
            player.defense += item.defense or 0
            self.add_message(f"You equip {item.name}.", 'success')
            
        elif item.type == 'aura':
            if player.aura:
                player.inventory.append(player.aura)
                if player.aura.health_bonus:
                    player.max_health -= player.aura.health_bonus
                    player.health = min(player.health, player.max_health)
                if player.aura.mana_bonus:
                    player.max_mana -= player.aura.mana_bonus
                    player.mana = min(player.mana, player.max_mana)
            
            player.aura = item
            if item.health_bonus:
                player.max_health += item.health_bonus
                player.health += item.health_bonus
            if item.mana_bonus:
                player.max_mana += item.mana_bonus
                player.mana += item.mana_bonus
            
            self.add_message(f"You equip {item.name}.", 'success')
        else:
            self.add_message("This item cannot be equipped.")
            return self.game_state
        
        player.inventory.pop(index)
        self.game_state.show_inventory = True
        
        return self.game_state
    
    def add_message(self, text: str, msg_type: str = 'info'):
        if self.game_state:
            message = Message(text=text, type=msg_type, timestamp=time.time())
            self.game_state.messages.append(message)
            if len(self.game_state.messages) > 50:
                self.game_state.messages = self.game_state.messages[-50:]
