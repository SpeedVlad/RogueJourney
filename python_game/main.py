import pygame
import sys
from game.game_engine import GameEngine
from game.renderer import GameRenderer

class RoguelikeGame:
    def __init__(self):
        pygame.init()
        
        self.width = 960
        self.height = 560
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("Roguelike Dungeon - Python")
        
        self.clock = pygame.time.Clock()
        self.fps = 60
        
        self.engine = GameEngine()
        self.renderer = GameRenderer(self.screen)
        self.game_state = None
        
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 32)
        self.font_small = pygame.font.Font(None, 24)
        
        try:
            pygame.mixer.init()
            self.background_music = pygame.mixer.Sound("sounds/background.mp3")
            self.hit_sound = pygame.mixer.Sound("sounds/hit.mp3")
            self.success_sound = pygame.mixer.Sound("sounds/success.mp3")
            self.sounds_enabled = True
        except:
            print("Could not load audio files")
            self.sounds_enabled = False
    
    def run(self):
        self.game_state = self.engine.initialize()
        
        running = True
        while running:
            dt = self.clock.tick(self.fps) / 1000.0
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    self.handle_input(event.key)
            
            self.update()
            self.render()
            
            pygame.display.flip()
        
        pygame.quit()
        sys.exit()
    
    def handle_input(self, key):
        if self.game_state.game_phase == 'ready':
            if key == pygame.K_RETURN or key == pygame.K_SPACE:
                self.game_state = self.engine.start_game()
                if self.sounds_enabled:
                    self.background_music.play(loops=-1)
        
        elif self.game_state.game_phase == 'playing':
            if key == pygame.K_w or key == pygame.K_UP:
                self.game_state = self.engine.move_player(0, -1)
                self.engine.update_enemies()
            elif key == pygame.K_s or key == pygame.K_DOWN:
                self.game_state = self.engine.move_player(0, 1)
                self.engine.update_enemies()
            elif key == pygame.K_a or key == pygame.K_LEFT:
                self.game_state = self.engine.move_player(-1, 0)
                self.engine.update_enemies()
            elif key == pygame.K_d or key == pygame.K_RIGHT:
                self.game_state = self.engine.move_player(1, 0)
                self.engine.update_enemies()
            elif key == pygame.K_SPACE:
                self.game_state = self.engine.player_attack()
                self.engine.update_enemies()
            elif key == pygame.K_e:
                self.game_state = self.engine.use_stairs()
            elif key == pygame.K_c:
                self.game_state.show_inventory = not self.game_state.show_inventory
            elif key == pygame.K_r:
                self.game_state = self.engine.initialize()
        
        elif self.game_state.game_phase == 'game_over':
            if key == pygame.K_r:
                self.game_state = self.engine.initialize()
                if self.sounds_enabled:
                    self.background_music.stop()
    
    def update(self):
        pass
    
    def render(self):
        self.screen.fill((0, 0, 0))
        
        if self.game_state.game_phase == 'playing':
            self.renderer.render(self.game_state)
            self.render_ui()
            
            if self.game_state.show_inventory:
                self.render_inventory()
        
        elif self.game_state.game_phase == 'ready':
            self.render_start_screen()
        
        elif self.game_state.game_phase == 'game_over':
            self.render_game_over()
    
    def render_start_screen(self):
        overlay = pygame.Surface((self.width, self.height))
        overlay.set_alpha(200)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        title = self.font_large.render("Roguelike Dungeon", True, (255, 255, 255))
        title_rect = title.get_rect(center=(self.width // 2, self.height // 3))
        self.screen.blit(title, title_rect)
        
        instructions = [
            "WASD/Arrow Keys: Move",
            "Space: Attack",
            "C: Toggle Inventory",
            "E: Use Stairs",
            "R: Restart Game"
        ]
        
        y = self.height // 2
        for instruction in instructions:
            text = self.font_small.render(instruction, True, (255, 255, 100))
            text_rect = text.get_rect(center=(self.width // 2, y))
            self.screen.blit(text, text_rect)
            y += 30
        
        start_text = self.font_medium.render("Press ENTER to Start", True, (0, 255, 0))
        start_rect = start_text.get_rect(center=(self.width // 2, self.height * 3 // 4))
        self.screen.blit(start_text, start_rect)
    
    def render_game_over(self):
        overlay = pygame.Surface((self.width, self.height))
        overlay.set_alpha(200)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        game_over_text = self.font_large.render("Game Over", True, (255, 0, 0))
        game_over_rect = game_over_text.get_rect(center=(self.width // 2, self.height // 3))
        self.screen.blit(game_over_text, game_over_rect)
        
        level_text = self.font_medium.render(f"Level Reached: {self.game_state.level}", True, (255, 255, 255))
        level_rect = level_text.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(level_text, level_rect)
        
        score_text = self.font_medium.render(f"Score: {self.game_state.score}", True, (255, 255, 255))
        score_rect = score_text.get_rect(center=(self.width // 2, self.height // 2 + 40))
        self.screen.blit(score_text, score_rect)
        
        restart_text = self.font_small.render("Press R to Restart", True, (255, 255, 100))
        restart_rect = restart_text.get_rect(center=(self.width // 2, self.height * 3 // 4))
        self.screen.blit(restart_text, restart_rect)
    
    def render_ui(self):
        player = self.game_state.player
        
        ui_bg = pygame.Surface((250, 150))
        ui_bg.set_alpha(200)
        ui_bg.fill((0, 0, 0))
        self.screen.blit(ui_bg, (10, 10))
        
        y = 20
        health_text = self.font_small.render(f"❤ Health: {player.health}/{player.max_health}", True, (255, 100, 100))
        self.screen.blit(health_text, (20, y))
        
        y += 30
        attack_text = self.font_small.render(f"🔥 Attack: {player.attack_power}", True, (255, 150, 0))
        self.screen.blit(attack_text, (20, y))
        
        y += 30
        defense_text = self.font_small.render(f"🛡️ Defense: {player.defense}", True, (100, 150, 255))
        self.screen.blit(defense_text, (20, y))
        
        y += 30
        level_text = self.font_small.render(f"Level: {self.game_state.level}", True, (255, 255, 255))
        self.screen.blit(level_text, (20, y))
        
        y += 25
        xp_text = self.font_small.render(f"XP: {player.experience}", True, (255, 255, 255))
        self.screen.blit(xp_text, (20, y))
        
        msg_bg = pygame.Surface((self.width - 20, 100))
        msg_bg.set_alpha(200)
        msg_bg.fill((0, 0, 0))
        self.screen.blit(msg_bg, (10, self.height - 110))
        
        y = self.height - 100
        for message in self.game_state.messages[-3:]:
            color = (255, 100, 100) if message.type == 'damage' else (100, 255, 100) if message.type == 'success' else (200, 200, 200)
            msg_text = self.font_small.render(message.text[:80], True, color)
            self.screen.blit(msg_text, (20, y))
            y += 30
    
    def render_inventory(self):
        overlay = pygame.Surface((self.width, self.height))
        overlay.set_alpha(200)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        inv_width = 700
        inv_height = 500
        inv_x = (self.width - inv_width) // 2
        inv_y = (self.height - inv_height) // 2
        
        inv_bg = pygame.Surface((inv_width, inv_height))
        inv_bg.fill((30, 30, 30))
        self.screen.blit(inv_bg, (inv_x, inv_y))
        
        title = self.font_large.render("Inventory", True, (255, 255, 255))
        title_rect = title.get_rect(center=(self.width // 2, inv_y + 30))
        self.screen.blit(title, title_rect)
        
        player = self.game_state.player
        
        y = inv_y + 80
        weapon_text = self.font_small.render(f"Weapon: {player.weapon.name if player.weapon else 'None'}", True, (255, 200, 100))
        self.screen.blit(weapon_text, (inv_x + 20, y))
        
        y += 30
        armor_text = self.font_small.render(f"Armor: {player.armor.name if player.armor else 'None'}", True, (150, 200, 255))
        self.screen.blit(armor_text, (inv_x + 20, y))
        
        y += 30
        aura_text = self.font_small.render(f"Aura: {player.aura.name if player.aura else 'None'}", True, (200, 150, 255))
        self.screen.blit(aura_text, (inv_x + 20, y))
        
        y += 50
        items_title = self.font_medium.render(f"Items ({len(player.inventory)}/{player.inventory_size})", True, (255, 255, 255))
        self.screen.blit(items_title, (inv_x + 20, y))
        
        y += 40
        for i, item in enumerate(player.inventory[:10]):
            item_text = self.font_small.render(f"{i+1}. {item.symbol} {item.name}", True, item.color)
            self.screen.blit(item_text, (inv_x + 20, y))
            y += 25
        
        close_text = self.font_small.render("Press C to close", True, (200, 200, 200))
        close_rect = close_text.get_rect(center=(self.width // 2, inv_y + inv_height - 30))
        self.screen.blit(close_text, close_rect)

if __name__ == "__main__":
    game = RoguelikeGame()
    game.run()
