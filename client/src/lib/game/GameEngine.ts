import { GameState, Player, Enemy, Position, Message, Item } from './entities';
import { DungeonGenerator } from './DungeonGenerator';
import { findPath, getSimpleDirection } from './pathfinding';
import { performAttack, gainExperience, getEnemyName } from './combat';
import { generateRandomItem } from './items';
// Removed circular import - GameEngine should not import store

export class GameEngine {
  private gameState: GameState | null = null;

  initialize(): GameState {
    console.log("Initializing game engine");
    
    const dungeonGenerator = new DungeonGenerator(80, 50);
    const dungeon = dungeonGenerator.generate();
    
    // Create player
    const startRoom = dungeon.rooms[0];
    const player: Player = {
      id: 'player',
      x: startRoom.centerX,
      y: startRoom.centerY,
      symbol: '👾',
      color: '#00aaff',
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      attackPower: 10,
      defense: 2,
      speed: 1,
      lastMoveTime: 0,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      inventory: [],
      inventorySize: 20,
      weapon: null,
      armor: null,
      aura: null
    };

    // Generate enemies
    const enemies = this.generateEnemies(dungeon);

    // Calculate initial visibility with expanded range
    const visibleTiles = this.calculateVisibility(player, dungeon.tiles, dungeon.width, dungeon.height);
    const exploredTiles = [...visibleTiles];

    this.gameState = {
      gamePhase: 'ready',
      level: 1,
      score: 0,
      player,
      enemies,
      dungeon,
      visibleTiles,
      exploredTiles,
      messages: [
        { text: "Welcome to the dungeon! Find the stairs to descend deeper.", type: 'info', timestamp: Date.now() }
      ],
      showInventory: false
    };

    return this.gameState;
  }

  startGame(): GameState {
    if (!this.gameState) throw new Error("Game not initialized");
    
    this.gameState.gamePhase = 'playing';
    this.addMessage("Your adventure begins! Use WASD to move, Space to attack, I for inventory.");
    
    return this.gameState;
  }

  movePlayer(dx: number, dy: number): GameState {
    if (!this.gameState || this.gameState.gamePhase !== 'playing') {
      return this.gameState!;
    }

    const newX = this.gameState.player.x + dx;
    const newY = this.gameState.player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= this.gameState.dungeon.width || 
        newY < 0 || newY >= this.gameState.dungeon.height) {
      return this.gameState;
    }

    // Check for wall collision
    const tileIndex = newY * this.gameState.dungeon.width + newX;
    const tile = this.gameState.dungeon.tiles[tileIndex];
    if (tile.type === 'wall') {
      return this.gameState;
    }

    // Check for enemy collision
    const enemyAtPosition = this.gameState.enemies.find(e => e.x === newX && e.y === newY);
    if (enemyAtPosition) {
      // Attack enemy instead of moving
      return this.attackEnemy(enemyAtPosition);
    }

    // Create new state with updated player position
    this.gameState = {
      ...this.gameState,
      player: {
        ...this.gameState.player,
        x: newX,
        y: newY
      }
    };

    // Check for item pickup
    this.checkItemPickup();

    // Update visibility
    this.updateVisibility();

    return this.gameState;
  }

  playerAttack(): GameState {
    if (!this.gameState || this.gameState.gamePhase !== 'playing') {
      return this.gameState!;
    }

    // Find enemies adjacent to player
    const adjacentEnemies = this.gameState.enemies.filter(enemy => {
      const dx = Math.abs(enemy.x - this.gameState!.player.x);
      const dy = Math.abs(enemy.y - this.gameState!.player.y);
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    });

    if (adjacentEnemies.length === 0) {
      this.addMessage("There's nothing to attack here.");
      return this.gameState;
    }

    // Attack the first adjacent enemy
    return this.attackEnemy(adjacentEnemies[0]);
  }

  useStairs(): GameState {
    if (!this.gameState || this.gameState.gamePhase !== 'playing') {
      return this.gameState!;
    }

    const { player, dungeon } = this.gameState;
    
    // Check if player is on stairs
    if (player.x === dungeon.stairs.x && player.y === dungeon.stairs.y) {
      return this.descendLevel();
    } else {
      this.addMessage("You need to find the stairs first! Look for '>' symbol.");
      return this.gameState;
    }
  }

  deleteItem(index: number): GameState {
    if (!this.gameState || index >= this.gameState.player.inventory.length) {
      return this.gameState!;
    }

    const item = this.gameState.player.inventory[index];
    const newInventory = [...this.gameState.player.inventory];
    newInventory.splice(index, 1);

    this.gameState = {
      ...this.gameState,
      player: {
        ...this.gameState.player,
        inventory: newInventory
      }
    };

    this.addMessage(`You destroy ${item.name}.`, 'info');
    return this.gameState;
  }

  mergeItems(index1: number, index2: number): GameState {
    if (!this.gameState || 
        index1 >= this.gameState.player.inventory.length ||
        index2 >= this.gameState.player.inventory.length ||
        index1 === index2) {
      return this.gameState!;
    }

    const item1 = this.gameState.player.inventory[index1];
    const item2 = this.gameState.player.inventory[index2];

    // Only merge items of same type and rarity
    if (item1.type !== item2.type || item1.rarity !== item2.rarity) {
      this.addMessage("Cannot merge different types or rarities.", 'info');
      return this.gameState;
    }

    // Create merged item with enhanced stats
    const mergedItem = { ...item1 };
    mergedItem.name = `Enhanced ${item1.name}`;
    
    if (item1.damage) mergedItem.damage = Math.floor((item1.damage + (item2.damage || 0)) * 1.2);
    if (item1.defense) mergedItem.defense = Math.floor((item1.defense + (item2.defense || 0)) * 1.2);
    if (item1.healthBonus) mergedItem.healthBonus = Math.floor((item1.healthBonus + (item2.healthBonus || 0)) * 1.2);
    if (item1.manaBonus) mergedItem.manaBonus = Math.floor((item1.manaBonus + (item2.manaBonus || 0)) * 1.2);
    if (item1.healingPower) mergedItem.healingPower = Math.floor((item1.healingPower + (item2.healingPower || 0)) * 1.2);

    // Remove both items and add merged item
    const newInventory = [...this.gameState.player.inventory];
    const higherIndex = Math.max(index1, index2);
    const lowerIndex = Math.min(index1, index2);
    
    newInventory.splice(higherIndex, 1);
    newInventory.splice(lowerIndex, 1);
    newInventory.push(mergedItem);

    this.gameState = {
      ...this.gameState,
      player: {
        ...this.gameState.player,
        inventory: newInventory
      }
    };

    this.addMessage(`You merge the items creating ${mergedItem.name}!`, 'success');
    return this.gameState;
  }

  useItem(index: number): GameState {
    if (!this.gameState || index >= this.gameState.player.inventory.length) {
      return this.gameState!;
    }

    const item = this.gameState.player.inventory[index];
    
    if (item.type !== 'consumable') {
      this.addMessage("This item cannot be consumed.");
      return this.gameState;
    }

    // Calculate effects
    let newHealth = this.gameState.player.health;
    let newMana = this.gameState.player.mana;
    let healthGained = 0;
    let manaGained = 0;

    if (item.healingPower) {
      const healthBefore = newHealth;
      newHealth = Math.min(
        this.gameState.player.maxHealth, 
        newHealth + item.healingPower
      );
      healthGained = newHealth - healthBefore;
    }

    if (item.manaPower) {
      const manaBefore = newMana;
      newMana = Math.min(
        this.gameState.player.maxMana, 
        newMana + item.manaPower
      );
      manaGained = newMana - manaBefore;
    }

    // Remove item from inventory
    const newInventory = [...this.gameState.player.inventory];
    newInventory.splice(index, 1);

    this.gameState = {
      ...this.gameState,
      player: {
        ...this.gameState.player,
        health: newHealth,
        mana: newMana,
        inventory: newInventory
      },
      showInventory: true  // Keep inventory open
    };

    // Add message
    let message = `You use ${item.name}.`;
    if (healthGained > 0) message += ` +${healthGained} health.`;
    if (manaGained > 0) message += ` +${manaGained} mana.`;
    
    this.addMessage(message, 'success');

    return this.gameState;
  }

  equipItem(index: number): GameState {
    if (!this.gameState || index >= this.gameState.player.inventory.length) {
      return this.gameState!;
    }

    const item = this.gameState.player.inventory[index];
    let newInventory = [...this.gameState.player.inventory];
    let newPlayer = { ...this.gameState.player };
    
    if (item.type === 'weapon') {
      // Unequip current weapon
      if (this.gameState.player.weapon) {
        newInventory.push(this.gameState.player.weapon);
        newPlayer.attackPower -= this.gameState.player.weapon.damage || 0;
      }
      
      // Equip new weapon
      newPlayer.weapon = item;
      newPlayer.attackPower += item.damage || 0;
      
      this.addMessage(`You equip ${item.name}.`, 'success');
    } else if (item.type === 'armor') {
      // Unequip current armor
      if (this.gameState.player.armor) {
        newInventory.push(this.gameState.player.armor);
        newPlayer.defense -= this.gameState.player.armor.defense || 0;
      }
      
      // Equip new armor
      newPlayer.armor = item;
      newPlayer.defense += item.defense || 0;
      
      this.addMessage(`You equip ${item.name}.`, 'success');
    } else if (item.type === 'aura') {
      // Unequip current aura
      if (this.gameState.player.aura) {
        newInventory.push(this.gameState.player.aura);
        if (this.gameState.player.aura.healthBonus) {
          newPlayer.maxHealth -= this.gameState.player.aura.healthBonus;
          newPlayer.health = Math.min(newPlayer.health, newPlayer.maxHealth);
        }
        if (this.gameState.player.aura.manaBonus) {
          newPlayer.maxMana -= this.gameState.player.aura.manaBonus;
          newPlayer.mana = Math.min(newPlayer.mana, newPlayer.maxMana);
        }
      }
      
      // Equip new aura
      newPlayer.aura = item;
      if (item.healthBonus) {
        newPlayer.maxHealth += item.healthBonus;
        newPlayer.health += item.healthBonus; // Heal when equipping
      }
      if (item.manaBonus) {
        newPlayer.maxMana += item.manaBonus;
        newPlayer.mana += item.manaBonus; // Restore mana when equipping
      }
      
      this.addMessage(`You equip ${item.name}.`, 'success');
    } else {
      this.addMessage("This item cannot be equipped.");
      return this.gameState;
    }

    // Remove from inventory
    newInventory.splice(index, 1);
    newPlayer.inventory = newInventory;

    this.gameState = {
      ...this.gameState,
      player: newPlayer,
      showInventory: true  // Keep inventory open
    };

    return this.gameState;
  }

  unequipItem(type: 'weapon' | 'armor' | 'aura'): GameState {
    if (!this.gameState) return this.gameState!;

    let newPlayer = { ...this.gameState.player };
    let newInventory = [...this.gameState.player.inventory];

    if (type === 'weapon' && newPlayer.weapon) {
      // Remove weapon stats
      newPlayer.attackPower -= newPlayer.weapon.damage || 0;
      
      // Add to inventory
      newInventory.push(newPlayer.weapon);
      newPlayer.weapon = null;
      
      this.addMessage(`You unequip your weapon.`, 'info');
    } else if (type === 'armor' && newPlayer.armor) {
      // Remove armor stats
      newPlayer.defense -= newPlayer.armor.defense || 0;
      
      // Add to inventory
      newInventory.push(newPlayer.armor);
      newPlayer.armor = null;
      
      this.addMessage(`You unequip your armor.`, 'info');
    } else if (type === 'aura' && newPlayer.aura) {
      // Remove aura stats
      if (newPlayer.aura.healthBonus) {
        newPlayer.maxHealth -= newPlayer.aura.healthBonus;
        newPlayer.health = Math.min(newPlayer.health, newPlayer.maxHealth);
      }
      if (newPlayer.aura.manaBonus) {
        newPlayer.maxMana -= newPlayer.aura.manaBonus;
        newPlayer.mana = Math.min(newPlayer.mana, newPlayer.maxMana);
      }
      
      // Add to inventory
      newInventory.push(newPlayer.aura);
      newPlayer.aura = null;
      
      this.addMessage(`You unequip your aura.`, 'info');
    } else {
      this.addMessage(`No ${type} equipped.`, 'info');
      return this.gameState;
    }

    newPlayer.inventory = newInventory;

    this.gameState = {
      ...this.gameState,
      player: newPlayer,
      showInventory: true  // Keep inventory open
    };

    return this.gameState;
  }

  updateGame(): GameState {
    if (!this.gameState || this.gameState.gamePhase !== 'playing') {
      return this.gameState!;
    }

    // Update enemies
    this.updateEnemies();

    return this.gameState;
  }

  private generateEnemies(dungeon: any): Enemy[] {
    const enemies: Enemy[] = [];
    const enemyTypes = [
      { type: 'goblin', symbol: '👽', color: '#00aa00', health: 20, attack: 5, defense: 1, exp: 15 },
      { type: 'orc', symbol: '👹', color: '#aa0000', health: 35, attack: 8, defense: 2, exp: 25 },
      { type: 'skeleton', symbol: '💀', color: '#cccccc', health: 15, attack: 6, defense: 0, exp: 20 }
    ];

    // Generate 2-4 enemies per room (excluding first room)
    for (let i = 1; i < dungeon.rooms.length; i++) {
      const room = dungeon.rooms[i];
      const enemyCount = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < enemyCount; j++) {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const x = room.x + Math.floor(Math.random() * (room.width - 2)) + 1;
        const y = room.y + Math.floor(Math.random() * (room.height - 2)) + 1;
        
        enemies.push({
          id: `${enemyType.type}_${i}_${j}`,
          x,
          y,
          symbol: enemyType.symbol,
          color: enemyType.color,
          health: enemyType.health,
          maxHealth: enemyType.health,
          attackPower: enemyType.attack,
          defense: enemyType.defense,
          speed: 1,
          lastMoveTime: 0,
          type: enemyType.type as any,
          ai: 'aggressive',
          experienceValue: enemyType.exp,
          lootTable: []
        });
      }
    }

    return enemies;
  }

  private calculateVisibility(player: Player, tiles: any[], width: number, height: number): Position[] {
    const visible: Position[] = [];
    const radius = 8; // Increased vision radius to see corridors immediately

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = player.x + dx;
        const y = player.y + dy;
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          // Simple line-of-sight check
          if (this.hasLineOfSight(player.x, player.y, x, y, tiles, width)) {
            visible.push({ x, y });
          }
        }
      }
    }

    return visible;
  }

  private hasLineOfSight(x1: number, y1: number, x2: number, y2: number, tiles: any[], width: number): boolean {
    // Bresenham's line algorithm for line of sight
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      if (x === x2 && y === y2) break;
      
      // Check if current tile blocks vision (except the target tile)
      if (!(x === x2 && y === y2)) {
        const tileIndex = y * width + x;
        if (tiles[tileIndex] && tiles[tileIndex].type === 'wall') {
          return false;
        }
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return true;
  }

  private updateVisibility(): void {
    if (!this.gameState) return;
    
    const visibleTiles = this.calculateVisibility(
      this.gameState.player, 
      this.gameState.dungeon.tiles, 
      this.gameState.dungeon.width, 
      this.gameState.dungeon.height
    );

    // Add newly visible tiles to explored tiles
    const exploredTiles = [...this.gameState.exploredTiles];
    for (const visible of visibleTiles) {
      if (!exploredTiles.some(explored => explored.x === visible.x && explored.y === visible.y)) {
        exploredTiles.push(visible);
      }
    }

    this.gameState = {
      ...this.gameState,
      visibleTiles,
      exploredTiles
    };
  }

  private checkItemPickup(): void {
    if (!this.gameState) return;

    const player = this.gameState.player;
    const itemsAtPosition = this.gameState.dungeon.items.filter(
      item => item.x === player.x && item.y === player.y
    );

    if (itemsAtPosition.length > 0) {
      let pickedUpItems: any[] = [];
      let remainingItems = [...this.gameState.dungeon.items];
      
      for (const item of itemsAtPosition) {
        if (player.inventory.length + pickedUpItems.length < player.inventorySize) {
          pickedUpItems.push(item);
          const itemIndex = remainingItems.findIndex(i => i.id === item.id);
          if (itemIndex >= 0) {
            remainingItems.splice(itemIndex, 1);
          }
        } else {
          this.addMessage("Your inventory is full!");
          break;
        }
      }
      
      if (pickedUpItems.length > 0) {
        this.gameState = {
          ...this.gameState,
          player: {
            ...this.gameState.player,
            inventory: [...this.gameState.player.inventory, ...pickedUpItems]
          },
          dungeon: {
            ...this.gameState.dungeon,
            items: remainingItems
          }
        };
        
        if (pickedUpItems.length === 1) {
          this.addMessage(`You pick up ${pickedUpItems[0].name}.`, 'success');
        } else {
          this.addMessage(`You pick up ${pickedUpItems.length} items.`, 'success');
        }
      }
    }
  }

  private attackEnemy(enemy: Enemy): GameState {
    if (!this.gameState) return this.gameState!;

    const player = this.gameState.player;
    
    // Add attack animation state
    this.gameState = {
      ...this.gameState,
      player: {
        ...player,
        isAttacking: true,
        attackTarget: { x: enemy.x, y: enemy.y }
      }
    };
    
    // Remove attack animation after delay
    setTimeout(() => {
      if (this.gameState) {
        this.gameState = {
          ...this.gameState,
          player: {
            ...this.gameState.player,
            isAttacking: false,
            attackTarget: undefined
          }
        };
      }
    }, 300);
    
    const result = performAttack(player, enemy);
    
    this.addMessage(result.message, 'damage');

    if (result.killed) {
      // Remove enemy
      const newEnemies = this.gameState.enemies.filter(e => e.id !== enemy.id);
      
      // Grant experience
      const expResult = gainExperience(player, enemy.experienceValue);
      
      // Add score
      const newScore = this.gameState.score + enemy.experienceValue * 10;
      
      // Maybe drop loot
      let newItems = [...this.gameState.dungeon.items];
      if (Math.random() < 0.3) {
        const loot = generateRandomItem();
        newItems.push({
          ...loot,
          x: enemy.x,
          y: enemy.y
        });
        this.addMessage(`${getEnemyName(enemy)} drops ${loot.name}!`);
      }

      this.gameState = {
        ...this.gameState,
        enemies: newEnemies,
        player: expResult.newPlayer,
        score: newScore,
        dungeon: {
          ...this.gameState.dungeon,
          items: newItems
        }
      };
      
      this.addMessage(expResult.message, 'success');
    }

    return this.gameState;
  }

  private updateEnemies(): void {
    if (!this.gameState) return;

    const currentTime = Date.now();
    let playerUpdated = false;
    let gamePhaseChanged = false;
    
    const updatedEnemies = this.gameState.enemies.map(enemy => {
      // Simple AI: move towards player if visible, attack if adjacent
      const distance = Math.abs(enemy.x - this.gameState!.player.x) + 
                     Math.abs(enemy.y - this.gameState!.player.y);
      
      // Only act if player is within reasonable distance and it's time to move
      if (distance <= 10 && currentTime - enemy.lastMoveTime >= 500) {
        const updatedEnemy = { ...enemy, lastMoveTime: currentTime };
        
        // Check if adjacent to player
        if (distance === 1) {
          // Attack player
          const result = performAttack(enemy, this.gameState!.player);
          this.addMessage(result.message, 'damage');
          
          if (result.killed) {
            gamePhaseChanged = true;
            this.addMessage("You have died! Game Over.", 'damage');
          }
          
          return updatedEnemy;
        } else if (distance <= 8) {
          // Move towards player
          const direction = getSimpleDirection(
            { x: enemy.x, y: enemy.y },
            { x: this.gameState!.player.x, y: this.gameState!.player.y }
          );
          
          const newX = enemy.x + direction.x;
          const newY = enemy.y + direction.y;
          
          // Check if move is valid
          if (this.isValidMove(newX, newY)) {
            return { ...updatedEnemy, x: newX, y: newY };
          }
        }
        
        return updatedEnemy;
      }
      
      return enemy;
    });

    this.gameState = {
      ...this.gameState,
      enemies: updatedEnemies,
      gamePhase: gamePhaseChanged ? 'gameOver' : this.gameState.gamePhase
    };
  }

  private isValidMove(x: number, y: number): boolean {
    if (!this.gameState) return false;
    
    // Check bounds
    if (x < 0 || x >= this.gameState.dungeon.width || 
        y < 0 || y >= this.gameState.dungeon.height) {
      return false;
    }
    
    // Check for wall
    const tileIndex = y * this.gameState.dungeon.width + x;
    if (this.gameState.dungeon.tiles[tileIndex].type === 'wall') {
      return false;
    }
    
    // Check for other enemies
    if (this.gameState.enemies.some(e => e.x === x && e.y === y)) {
      return false;
    }
    
    // Check for player
    if (this.gameState.player.x === x && this.gameState.player.y === y) {
      return false;
    }
    
    return true;
  }

  private descendLevel(): GameState {
    if (!this.gameState) return this.gameState!;

    this.addMessage(`You descend to level ${this.gameState.level + 1}!`, 'success');
    this.gameState.level++;
    this.gameState.score += 1000;

    // Generate new dungeon
    const dungeonGenerator = new DungeonGenerator(80, 50);
    const newDungeon = dungeonGenerator.generate();
    
    // Place player at start of new level
    const startRoom = newDungeon.rooms[0];
    this.gameState.player.x = startRoom.centerX;
    this.gameState.player.y = startRoom.centerY;
    
    // Generate stronger enemies based on level
    this.gameState.dungeon = newDungeon;
    this.gameState.enemies = this.generateStrongerEnemies(newDungeon, this.gameState.level);
    
    // Update visibility
    this.updateVisibility();
    this.gameState.exploredTiles = [...this.gameState.visibleTiles];

    return this.gameState;
  }

  private generateStrongerEnemies(dungeon: any, level: number): Enemy[] {
    const enemies = this.generateEnemies(dungeon);
    
    // Scale enemy stats based on dungeon level
    const scaleFactor = 1 + (level - 1) * 0.3;
    
    return enemies.map(enemy => ({
      ...enemy,
      maxHealth: Math.floor(enemy.maxHealth * scaleFactor),
      health: Math.floor(enemy.health * scaleFactor),
      attackPower: Math.floor(enemy.attackPower * scaleFactor),
      defense: Math.floor(enemy.defense * scaleFactor),
      experienceValue: Math.floor(enemy.experienceValue * scaleFactor)
    }));
  }

  private addMessage(text: string, type: 'info' | 'damage' | 'success' = 'info'): void {
    const message: Message = { text, type, timestamp: Date.now() };
    useRoguelike.getState().addMessage(text, type);
  }
}
