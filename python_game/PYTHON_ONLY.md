# ✅ 100% Pure Python Roguelike

## No TypeScript. No JavaScript. Pure Python!

This roguelike game is built **entirely in Python** with no TypeScript or JavaScript dependencies.

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Language** | Python 3.11 |
| **Graphics** | Pygame 2.5.2 |
| **Backend** | Flask 3.0.0 (optional) |
| **Data Structures** | Python Dataclasses |
| **Package Manager** | pip/uv |

## What Makes This Pure Python?

### ✅ All Python Files
```
python_game/
├── game/
│   ├── game_objects.py      # 100% Python dataclasses
│   ├── game_engine.py       # 100% Python game logic
│   ├── dungeon_generator.py # 100% Python algorithms
│   ├── combat.py            # 100% Python calculations
│   ├── items.py             # 100% Python generation
│   ├── pathfinding.py       # 100% Python A* algorithm
│   └── renderer.py          # 100% Python Pygame rendering
├── main.py                   # 100% Python game loop
├── play.py                   # 100% Python launcher
└── server.py                 # 100% Python Flask (optional)
```

### ✅ No TypeScript Required
- **No** `node_modules/`
- **No** `package.json`
- **No** `tsconfig.json`
- **No** `.ts` or `.tsx` files needed
- **No** npm or Node.js required

### ✅ Pure Python Dependencies
```txt
pygame==2.5.2  # For graphics, input, audio
flask==3.0.0   # For optional backend
```

That's it! Just 2 Python packages.

## Quick Start

### Installation
```bash
cd python_game
pip install -r requirements.txt
```

### Run the Game
```bash
python main.py
```

Or use the launcher:
```bash
python play.py
```

## How It Works

### 1. Python Game Engine
Pure Python class that manages all game logic:
```python
from game.game_engine import GameEngine

engine = GameEngine()
state = engine.initialize()  # Create dungeon, enemies, items
state = engine.move_player(dx, dy)  # Move player
state = engine.update_enemies()  # AI pathfinding
```

### 2. Python Dataclasses
All game objects are Python dataclasses:
```python
@dataclass
class Player(Entity):
    level: int = 1
    experience: int = 0
    inventory: List[Item] = field(default_factory=list)
    weapon: Optional[Item] = None
    armor: Optional[Item] = None
```

### 3. Pygame Rendering
Pure Python rendering using Pygame:
```python
import pygame

pygame.init()
screen = pygame.display.set_mode((960, 560))
renderer = GameRenderer(screen)
renderer.render(game_state)
```

### 4. Python Algorithms
All algorithms implemented in pure Python:
- **Dungeon Generation**: Room-based with L-shaped corridors
- **A* Pathfinding**: For enemy AI navigation
- **Combat Formulas**: Damage calculation with variance
- **Line of Sight**: Bresenham's algorithm for fog of war

## Features (All Python)

✅ Procedural dungeon generation  
✅ Turn-based combat system  
✅ A* pathfinding enemy AI  
✅ Item generation with rarity tiers  
✅ Inventory and equipment management  
✅ Level progression and scaling  
✅ Fog of war and visibility  
✅ ASCII-style graphics  
✅ Audio system (music & SFX)  

## Why Pure Python?

### Advantages
1. **Simple Setup**: Just `pip install` and run
2. **No Build Process**: No webpack, no transpiling
3. **Native Performance**: Python is fast enough for roguelikes
4. **Easy Debugging**: Standard Python debugging tools
5. **Portable**: Runs anywhere Python runs
6. **Standalone**: No browser required

### Perfect For
- Desktop games
- Learning game development
- Prototyping game mechanics
- Offline/local gaming
- Python-only environments

## Code Examples

### Game Loop (Pure Python)
```python
class RoguelikeGame:
    def __init__(self):
        pygame.init()
        self.engine = GameEngine()
        self.renderer = GameRenderer(screen)
    
    def run(self):
        self.game_state = self.engine.initialize()
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    self.handle_input(event.key)
            
            self.update()
            self.render()
            pygame.display.flip()
```

### Combat System (Pure Python)
```python
def calculate_damage(attacker: Entity, defender: Entity) -> int:
    base_damage = attacker.attack_power - defender.defense
    damage = max(1, base_damage)
    
    if not isinstance(attacker, Player):
        damage = damage * 3  # Enemies hit harder
    
    variance = 0.25
    random_factor = 1 + (random.random() - 0.5) * variance * 2
    return int(damage * random_factor)
```

### Dungeon Generation (Pure Python)
```python
class DungeonGenerator:
    def generate(self, width: int, height: int) -> Dungeon:
        # Pure Python procedural generation
        rooms = self.create_rooms(width, height)
        tiles = self.carve_rooms(rooms)
        tiles = self.create_corridors(rooms, tiles)
        return Dungeon(width, height, tiles, rooms, stairs, items)
```

## Verification

To verify this is pure Python, run:

```bash
cd python_game
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"
```

**Result**: No files found (because there are none!)

```bash
ls -la | grep -E "node_modules|package.json|tsconfig"
```

**Result**: Nothing (because it's pure Python!)

## System Requirements

- **Python**: 3.11 or higher
- **Operating System**: Windows, macOS, or Linux
- **Display**: 960x560 minimum resolution
- **Audio**: Optional (game works without sound)

## Testing

Test the pure Python game:

```bash
cd python_game
python -c "
from game.game_engine import GameEngine
engine = GameEngine()
state = engine.initialize()
print(f'✅ Pure Python game working!')
print(f'Dungeon: {state.dungeon.width}x{state.dungeon.height}')
print(f'Enemies: {len(state.enemies)}')
print(f'No TypeScript required!')
"
```

## Summary

This is a **complete, fully-functional roguelike game** written entirely in Python:

- ✅ **No TypeScript** files
- ✅ **No JavaScript** code
- ✅ **No Node.js** required
- ✅ **No npm** needed
- ✅ **Just Python** and Pygame

Run it with one command: `python main.py`

---

**🐍 Made with 100% Python - Zero TypeScript! 🐍**
