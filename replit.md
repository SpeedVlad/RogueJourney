# Overview

This is a browser-based roguelike game built with a React frontend and Express backend. The game features dungeon exploration, turn-based combat, inventory management, and item collection in a classic ASCII-style presentation. Players navigate through procedurally generated dungeons, fight enemies, collect items, and progress through levels.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS for utility-first styling with custom design system variables
- **State Management**: Zustand stores for game state, audio management, and roguelike mechanics
- **Canvas Rendering**: Custom 2D canvas renderer for ASCII-style game graphics with pixel-perfect rendering
- **UI Components**: Radix UI primitives with custom styling for consistent interface elements

## Backend Architecture  
- **Framework**: Express.js with TypeScript for RESTful API endpoints
- **Module System**: ES modules for modern JavaScript import/export syntax
- **Development**: Vite for hot module replacement and fast development builds
- **Database Schema**: Drizzle ORM with PostgreSQL for data persistence and type-safe queries
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

## Game Engine Design
- **Core Engine**: Custom GameEngine class managing game state, turn processing, and game logic
- **Dungeon Generation**: Procedural dungeon creation with room-based layout and corridor connections
- **Entity System**: Player, enemies, and items as separate entity types with shared interfaces
- **Combat System**: Turn-based combat with damage calculation, experience gain, and equipment effects
- **Pathfinding**: A* algorithm for enemy AI movement and navigation
- **Inventory Management**: Item collection, equipment, and consumable usage systems

## Audio System
- **Audio Manager**: Zustand store for background music, sound effects, and mute controls
- **Sound Assets**: Preloaded audio files for combat, success, and ambient background music
- **Volume Control**: Global mute/unmute functionality with persistent state

## Data Storage Solutions
- **Development**: In-memory storage for rapid iteration and testing
- **Production**: PostgreSQL database with Drizzle ORM for type-safe schema management
- **Schema Design**: User management with username/password authentication structure

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for cloud deployment
- **drizzle-orm**: Type-safe ORM for database operations and schema management
- **express**: Node.js web framework for API server and static file serving
- **vite**: Frontend build tool with hot reload and optimized production builds

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for consistent interface components
- **tailwindcss**: Utility-first CSS framework for responsive design and theming
- **@fontsource/inter**: Self-hosted Inter font for consistent typography

## Game Development
- **@react-three/fiber**: React renderer for Three.js (prepared for potential 3D features)
- **@react-three/drei**: Helper components for Three.js integration
- **@tanstack/react-query**: Data fetching and caching for API interactions

## Development Tools
- **typescript**: Static type checking for enhanced code reliability
- **tsx**: TypeScript execution for Node.js development server
- **esbuild**: Fast JavaScript bundler for production builds