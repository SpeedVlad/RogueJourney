# Python Roguelike Dungeon Game

This is a complete Python conversion of the TypeScript roguelike game. All features have been preserved and converted to Python using Pygame.

## Features

- **Procedural Dungeon Generation**: Randomly generated dungeons with rooms and corridors
- **Turn-Based Combat**: Fight enemies with a combat system featuring damage calculation and experience gain
- **Inventory System**: Collect weapons, armor, auras, and consumables
- **A* Pathfinding**: Intelligent enemy AI that tracks the player
- **Level Progression**: Descend through increasingly difficult dungeon levels
- **Audio**: Background music and sound effects
- **Item Rarity System**: Common, Uncommon, Rare, Legendary, and Mythic items
- **Equipment System**: Equip weapons, armor, and auras to boost your stats

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the Game

To run the Pygame roguelike:
```bash
python main.py
```

To run the Flask backend server (optional):
```bash
python server.py
```

## Controls

- **WASD** or **Arrow Keys**: Move your character
- **Space**: Attack adjacent enemies
- **C**: Toggle inventory
- **E**: Use stairs (when on stairs and all enemies defeated)
- **R**: Restart game
- **Enter**: Start game (from main menu)

## Game Structure

### Core Modules

- `game/game_objects.py` - Data classes for all game entities (Player, Enemy, Item, Tile, etc.)
- `game/game_engine.py` - Main game logic engine handling all game state and mechanics
- `game/dungeon_generator.py` - Procedural dungeon generation with rooms and corridors
- `game/combat.py` - Combat system with damage calculation and experience gain
- `game/items.py` - Item generation with rarity system
- `game/pathfinding.py` - A* pathfinding algorithm for enemy AI
- `game/renderer.py` - Pygame rendering for ASCII-style display
- `main.py` - Main game loop and UI rendering
- `server.py` - Flask backend server (optional)

## Differences from TypeScript Version

The Python version maintains all the functionality of the TypeScript version:

- **TypeScript React Frontend** → **Pygame Desktop Application**
- **Express Backend** → **Flask Backend**
- **Canvas Rendering** → **Pygame Rendering**
- **Zustand State Management** → **Direct State Management in GameEngine**
- **TypeScript Interfaces** → **Python Dataclasses**

All game mechanics, combat formulas, dungeon generation, and item systems have been preserved exactly as in the TypeScript version.

## Requirements

- Python 3.11+
- Pygame 2.5.2+
- Flask 3.0.0+ (optional, for backend server)

## Audio Files

The game includes audio files in the `sounds/` directory:
- `background.mp3` - Background music
- `hit.mp3` - Combat sound effect
- `success.mp3` - Success/level up sound effect

If audio files are not found, the game will run without sound.
