# 🐍 Pure Python Roguelike Game

A classic ASCII-style roguelike dungeon crawler written **100% in Python**.

**No TypeScript. No JavaScript. Pure Python!**

## 🎮 Features

- **Procedural Dungeon Generation**: Unique dungeons every playthrough
- **Turn-Based Combat**: Strategic tactical combat system
- **Item System**: 5 rarity tiers (Common to Mythic)
- **Character Progression**: Level up, gain stats, equip better gear
- **Enemy AI**: Intelligent pathfinding with A* algorithm
- **Inventory Management**: Collect and manage up to 20 items
- **Multi-Floor Dungeons**: Descend deeper with scaling difficulty
- **ASCII Graphics**: Classic roguelike aesthetic using Pygame
- **Audio System**: Background music and sound effects

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd python_game
pip install -r requirements.txt
```

### 2. Run the Game

```bash
python play.py
```

Or directly:

```bash
python main.py
```

## 🎯 How to Play

### Controls

- **WASD** or **Arrow Keys**: Move your character
- **I**: Toggle inventory
- **E**: Use/equip items in inventory
- **M**: Toggle music/sound
- **ESC**: Quit game
- **SPACE**: Start game (from main menu)

### Gameplay

1. **Explore the dungeon** - Navigate through procedurally generated rooms
2. **Fight enemies** - Tactical turn-based combat
3. **Collect items** - Weapons, armor, potions, and auras
4. **Level up** - Gain experience and increase your stats
5. **Descend floors** - Find the stairs to go deeper
6. **Survive** - Don't let your health reach zero!

### Items

- **Weapons** ⚔️ - Increase attack power
- **Armor** 🛡️ - Increase defense
- **Auras** ✨ - Provide passive bonuses
- **Potions** 🧪 - Restore health

### Rarity Tiers

- **Common** (Gray): 1x stats
- **Uncommon** (Green): 2x stats
- **Rare** (Blue): 5x stats
- **Legendary** (Purple): 10x stats
- **Mythic** (Orange): 15x stats

## 📁 Project Structure

```
python_game/
├── game/
│   ├── __init__.py
│   ├── game_objects.py      # Data models (Player, Enemy, Items, etc.)
│   ├── game_engine.py       # Core game logic
│   ├── dungeon_generator.py # Procedural dungeon creation
│   ├── combat.py            # Combat system
│   ├── items.py             # Item generation system
│   ├── pathfinding.py       # A* pathfinding for enemy AI
│   └── renderer.py          # Pygame ASCII renderer
├── sounds/
│   ├── background.mp3       # Background music
│   ├── hit.mp3             # Combat sound effect
│   └── success.mp3         # Success sound effect
├── main.py                  # Main game loop
├── play.py                  # Game launcher (recommended)
├── server.py               # Optional Flask backend
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔧 Technical Details

### Built With

- **Python 3.11+**
- **Pygame 2.5.2** - Graphics, input, and audio
- **Flask 3.0.0** - Optional backend server

### Game Systems

- **Dungeon Generation**: Room-based algorithm with L-shaped corridors
- **Combat**: Damage = max(1, attack - defense) with 25% variance
- **Enemy AI**: A* pathfinding with 8-tile vision radius
- **Fog of War**: Bresenham's line-of-sight algorithm
- **Floor Scaling**: Enemy stats scale 2x per floor

## 🎨 Game Mechanics

### Combat Formula

```python
base_damage = attacker.attack_power - defender.defense
damage = max(1, base_damage)
if enemy_attacking_player:
    damage *= 3  # Enemies hit harder!
variance = ±25% random factor
```

### Experience System

```python
experience_to_next_level = current_requirement * 1.3
level_up_bonuses:
  - Health: +20
  - Attack: +5
  - Defense: +3
  - Speed: +1
```

### Floor Progression

```python
floor_multiplier = 2 ^ (floor - 1)
enemy_stats *= floor_multiplier
```

## 🐛 Troubleshooting

### "No module named pygame"
```bash
pip install pygame==2.5.2
```

### "No audio device found"
The game will still run, but audio will be disabled. This is normal in some environments.

### Game won't start
Make sure you're in the `python_game` directory:
```bash
cd python_game
python play.py
```

## 📝 Game Tips

1. **Explore carefully** - Enemies can be dangerous!
2. **Equip the best gear** - Always check your inventory after battles
3. **Use potions wisely** - Health restoration can save your life
4. **Higher floors = better loot** - Risk vs reward
5. **Enemy damage is 3x** - Defense is important!

## 🎯 Development

This is a pure Python implementation featuring:

- Object-oriented design with dataclasses
- Procedural generation algorithms
- A* pathfinding implementation
- Event-driven game loop
- Pygame rendering system

---

**Made with 🐍 Python - No TypeScript Required!**
