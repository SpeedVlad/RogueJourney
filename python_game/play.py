#!/usr/bin/env python3
"""
Pure Python Roguelike Game Launcher
No TypeScript, No JavaScript - 100% Python!
"""

import sys
import os

def check_dependencies():
    """Check if all required packages are installed."""
    missing = []
    
    try:
        import pygame
        print(f"✓ Pygame {pygame.version.ver} installed")
    except ImportError:
        missing.append("pygame")
    
    try:
        import flask
        print(f"✓ Flask installed")
    except ImportError:
        missing.append("flask")
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("\nInstall with: pip install -r requirements.txt")
        return False
    
    return True

def main():
    """Launch the pure Python roguelike game."""
    print("=" * 50)
    print("🐍 PURE PYTHON ROGUELIKE GAME")
    print("=" * 50)
    print()
    
    if not check_dependencies():
        sys.exit(1)
    
    print("\n✓ All dependencies installed!")
    print("\nStarting game...")
    print("-" * 50)
    print()
    
    # Import and run the game
    from main import RoguelikeGame
    game = RoguelikeGame()
    game.run()

if __name__ == "__main__":
    main()
