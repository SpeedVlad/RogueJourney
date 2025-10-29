# Overview

This project contains a roguelike dungeon crawler game available in TWO implementations:

1. **TypeScript Version** (original): Browser-based with React frontend and Express backend
2. **Python Version** (NEW): Pure Python desktop game using Pygame - **NO TypeScript or JavaScript required!**

Both versions feature identical game mechanics: dungeon exploration, turn-based combat, inventory management, item collection in classic ASCII-style presentation, procedurally generated dungeons, enemy AI, and multi-floor progression.

## Current Status

**✅ Pure Python Version Available**: Complete standalone implementation in `python_game/` directory
- 100% Python code
- No TypeScript, JavaScript, or Node.js required
- Uses Pygame for graphics and input
- Fully functional with all game features

# User Preferences

Preferred communication style: Simple, everyday language.
User wants: Pure Python game without TypeScript or other languages.

# System Architecture

## Python Version (Pure Python Implementation)

### Python Game Architecture
- **Language**: Python 3.11 with type hints
- **Graphics & Input**: Pygame 2.5.2 for rendering, keyboard input, and audio
- **Backend**: Flask 3.0.0 (optional, for potential web features)
- **Data Models**: Python dataclasses for type-safe game objects
- **Package Management**: pip/uv for Python dependencies only

### Python Game Engine
- **Core Engine**: GameEngine class in pure Python managing all game state and logic
- **Dungeon Generation**: Procedural generation with room-based layout and L-shaped corridors
- **Entity System**: Player, Enemy, Item classes using Python dataclasses
- **Combat System**: Turn-based combat with damage formulas and experience gain
- **Pathfinding**: A* algorithm implemented in pure Python
- **Rendering**: Pygame-based ASCII renderer with fog of war

### Python Audio System
- **Audio**: Pygame mixer for background music and sound effects
- **Sound Files**: MP3 files in `sounds/` directory
- **Controls**: Mute toggle functionality

### Python File Structure
```
python_game/
├── game/
│   ├── game_objects.py      # Dataclasses for entities
│   ├── game_engine.py       # Core game logic
│   ├── dungeon_generator.py # Procedural generation
│   ├── combat.py            # Combat calculations
│   ├── items.py             # Item generation
│   ├── pathfinding.py       # A* algorithm
│   └── renderer.py          # Pygame rendering
├── sounds/                   # Audio files
├── main.py                   # Main game loop
├── play.py                   # Launcher script
└── server.py                 # Optional Flask backend
```

## TypeScript Version (Original Browser Implementation)

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS for utility-first styling with custom design system variables
- **State Management**: Zustand stores for game state, audio management, and roguelike mechanics
- **Canvas Rendering**: Custom 2D canvas renderer for ASCII-style game graphics with pixel-perfect rendering
- **UI Components**: Radix UI primitives with custom styling for consistent interface elements

### Backend Architecture  
- **Framework**: Express.js with TypeScript for RESTful API endpoints
- **Module System**: ES modules for modern JavaScript import/export syntax
- **Development**: Vite for hot module replacement and fast development builds
- **Database Schema**: Drizzle ORM with PostgreSQL for data persistence and type-safe queries
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

### Game Engine Design
- **Core Engine**: Custom GameEngine class managing game state, turn processing, and game logic
- **Dungeon Generation**: Procedural dungeon creation with room-based layout and corridor connections
- **Entity System**: Player, enemies, and items as separate entity types with shared interfaces
- **Combat System**: Turn-based combat with damage calculation, experience gain, and equipment effects
- **Pathfinding**: A* algorithm for enemy AI movement and navigation
- **Inventory Management**: Item collection, equipment, and consumable usage systems

### Audio System
- **Audio Manager**: Zustand store for background music, sound effects, and mute controls
- **Sound Assets**: Preloaded audio files for combat, success, and ambient background music
- **Volume Control**: Global mute/unmute functionality with persistent state

# External Dependencies

## Python Version Dependencies
- **pygame**: 2.5.2 - Graphics, input, and audio
- **flask**: 3.0.0 - Optional backend server

## TypeScript Version Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for cloud deployment
- **drizzle-orm**: Type-safe ORM for database operations and schema management
- **express**: Node.js web framework for API server and static file serving
- **vite**: Frontend build tool with hot reload and optimized production builds

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for consistent interface components
- **tailwindcss**: Utility-first CSS framework for responsive design and theming
- **@fontsource/inter**: Self-hosted Inter font for consistent typography

### Game Development
- **@react-three/fiber**: React renderer for Three.js (prepared for potential 3D features)
- **@react-three/drei**: Helper components for Three.js integration
- **@tanstack/react-query**: Data fetching and caching for API interactions

### Development Tools
- **typescript**: Static type checking for enhanced code reliability
- **tsx**: TypeScript execution for Node.js development server
- **esbuild**: Fast JavaScript bundler for production builds

# Running the Game

## Python Version (Recommended)
```bash
cd python_game
python main.py
```

## TypeScript Version
```bash
npm run dev
```

# Recent Changes

- **October 29, 2025**: Created pure Python implementation of the entire game
  - Converted all TypeScript/React code to Python/Pygame
  - Implemented all game systems in pure Python (no JavaScript/TypeScript needed)
  - Full feature parity with TypeScript version
  - Desktop application using Pygame
  - Added comprehensive documentation in `python_game/PYTHON_ONLY.md`
