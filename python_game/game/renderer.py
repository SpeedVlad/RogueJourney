import pygame
import math
from typing import Optional
from game.game_objects import GameState, Position

class GameRenderer:
    def __init__(self, screen: pygame.Surface):
        self.screen = screen
        self.tile_size = 16
        self.viewport_width = 60
        self.viewport_height = 35
        self.font = pygame.font.Font(None, 24)
    
    def render(self, game_state: GameState):
        if not game_state or game_state.game_phase != 'playing':
            return
        
        self.screen.fill((0, 0, 0))
        
        player = game_state.player
        offset_x = self.viewport_width // 2 - player.x
        offset_y = self.viewport_height // 2 - player.y
        
        self.render_tiles(game_state, offset_x, offset_y)
        self.render_items(game_state, offset_x, offset_y)
        self.render_enemies(game_state, offset_x, offset_y)
        self.render_player(game_state, offset_x, offset_y)
    
    def render_tiles(self, game_state: GameState, offset_x: int, offset_y: int):
        dungeon = game_state.dungeon
        visible_tiles = game_state.visible_tiles
        explored_tiles = game_state.explored_tiles
        
        for screen_y in range(self.viewport_height):
            for screen_x in range(self.viewport_width):
                world_x = screen_x - offset_x
                world_y = screen_y - offset_y
                
                if world_x < 0 or world_x >= dungeon.width or world_y < 0 or world_y >= dungeon.height:
                    continue
                
                tile_index = world_y * dungeon.width + world_x
                tile = dungeon.tiles[tile_index]
                
                is_visible = any(pos.x == world_x and pos.y == world_y for pos in visible_tiles)
                is_explored = any(pos.x == world_x and pos.y == world_y for pos in explored_tiles)
                
                if is_visible:
                    self.render_tile(screen_x, screen_y, tile.symbol, tile.color)
                elif is_explored:
                    darkened_color = tuple(int(c * 0.5) for c in tile.color)
                    self.render_tile(screen_x, screen_y, tile.symbol, darkened_color)
    
    def render_items(self, game_state: GameState, offset_x: int, offset_y: int):
        for item in game_state.dungeon.items:
            screen_x = item.x + offset_x
            screen_y = item.y + offset_y
            
            if (0 <= screen_x < self.viewport_width and
                0 <= screen_y < self.viewport_height and
                any(pos.x == item.x and pos.y == item.y for pos in game_state.visible_tiles)):
                self.render_tile(screen_x, screen_y, item.symbol, item.color)
    
    def render_enemies(self, game_state: GameState, offset_x: int, offset_y: int):
        for enemy in game_state.enemies:
            screen_x = enemy.x + offset_x
            screen_y = enemy.y + offset_y
            
            if (0 <= screen_x < self.viewport_width and
                0 <= screen_y < self.viewport_height and
                any(pos.x == enemy.x and pos.y == enemy.y for pos in game_state.visible_tiles)):
                self.render_tile(screen_x, screen_y, enemy.symbol, enemy.color)
    
    def render_player(self, game_state: GameState, offset_x: int, offset_y: int):
        player = game_state.player
        screen_x = player.x + offset_x
        screen_y = player.y + offset_y
        
        if 0 <= screen_x < self.viewport_width and 0 <= screen_y < self.viewport_height:
            self.render_tile(screen_x, screen_y, player.symbol, player.color)
    
    def render_tile(self, screen_x: int, screen_y: int, symbol: str, color: tuple):
        x = screen_x * self.tile_size
        y = screen_y * self.tile_size
        
        text_surface = self.font.render(symbol, True, color)
        text_rect = text_surface.get_rect(center=(x + self.tile_size // 2, y + self.tile_size // 2))
        self.screen.blit(text_surface, text_rect)
