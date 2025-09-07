import { GameState, Entity, Position } from "./game-objects";

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 16;
  private viewportWidth: number = 60;
  private viewportHeight: number = 35;

  constructor(context: CanvasRenderingContext2D) {
    this.ctx = context;
  }

  render(gameState: GameState): void {
    if (!gameState || gameState.gamePhase !== "playing") return;

    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate viewport offset to center on player
    const player = gameState.player;
    const offsetX = Math.floor(this.viewportWidth / 2) - player.x;
    const offsetY = Math.floor(this.viewportHeight / 2) - player.y;

    // Render tiles
    this.renderTiles(gameState, offsetX, offsetY);

    // Render items
    this.renderItems(gameState, offsetX, offsetY);

    // Render enemies
    this.renderEnemies(gameState, offsetX, offsetY);

    // Render player
    this.renderPlayer(gameState, offsetX, offsetY);
  }

  private renderTiles(
    gameState: GameState,
    offsetX: number,
    offsetY: number,
  ): void {
    const { dungeon, visibleTiles, exploredTiles } = gameState;

    for (let screenY = 0; screenY < this.viewportHeight; screenY++) {
      for (let screenX = 0; screenX < this.viewportWidth; screenX++) {
        const worldX = screenX - offsetX;
        const worldY = screenY - offsetY;

        // Check bounds
        if (
          worldX < 0 ||
          worldX >= dungeon.width ||
          worldY < 0 ||
          worldY >= dungeon.height
        ) {
          this.renderTile(screenX, screenY, { symbol: " ", color: "#000000" });
          continue;
        }

        const tileIndex = worldY * dungeon.width + worldX;
        const tile = dungeon.tiles[tileIndex];

        // Check visibility
        const isVisible = visibleTiles.some(
          (pos) => pos.x === worldX && pos.y === worldY,
        );
        const isExplored = exploredTiles.some(
          (pos) => pos.x === worldX && pos.y === worldY,
        );

        if (isVisible) {
          this.renderTile(screenX, screenY, {
            symbol: tile.symbol,
            color: tile.color,
          });
        } else if (isExplored) {
          // Render explored tiles in darker color
          this.renderTile(screenX, screenY, {
            symbol: tile.symbol,
            color: this.darkenColor(tile.color),
          });
        } else {
          // Unexplored tile
          this.renderTile(screenX, screenY, { symbol: " ", color: "#000000" });
        }
      }
    }
  }

  private renderItems(
    gameState: GameState,
    offsetX: number,
    offsetY: number,
  ): void {
    const { dungeon, visibleTiles } = gameState;

    for (const item of dungeon.items) {
      const screenX = item.x + offsetX;
      const screenY = item.y + offsetY;

      // Check if on screen and visible
      if (
        screenX >= 0 &&
        screenX < this.viewportWidth &&
        screenY >= 0 &&
        screenY < this.viewportHeight &&
        visibleTiles.some((pos) => pos.x === item.x && pos.y === item.y)
      ) {
        this.renderEntity(screenX, screenY, {
          symbol: item.symbol,
          color: item.color,
        });
      }
    }
  }

  private renderEnemies(
    gameState: GameState,
    offsetX: number,
    offsetY: number,
  ): void {
    const { enemies, visibleTiles } = gameState;

    for (const enemy of enemies) {
      const screenX = enemy.x + offsetX;
      const screenY = enemy.y + offsetY;

      // Check if on screen and visible
      if (
        screenX >= 0 &&
        screenX < this.viewportWidth &&
        screenY >= 0 &&
        screenY < this.viewportHeight &&
        visibleTiles.some((pos) => pos.x === enemy.x && pos.y === enemy.y)
      ) {
        this.renderEntity(screenX, screenY, {
          symbol: enemy.symbol,
          color: enemy.color,
        });
      }
    }
  }

  private renderPlayer(
    gameState: GameState,
    offsetX: number,
    offsetY: number,
  ): void {
    const player = gameState.player;
    const screenX = player.x + offsetX;
    const screenY = player.y + offsetY;

    if (
      screenX >= 0 &&
      screenX < this.viewportWidth &&
      screenY >= 0 &&
      screenY < this.viewportHeight
    ) {
      // Draw aura effect first if player has aura equipped
      if (player.aura) {
        this.renderAuraEffect(screenX, screenY, player.aura);
      }

      // Draw attack animation if attacking
      if (player.isAttacking && player.attackTarget) {
        this.renderAttackEffect(
          screenX,
          screenY,
          player.attackTarget,
          offsetX,
          offsetY,
        );
      }

      // Then draw the player (with attack animation if attacking)
      const playerColor = player.isAttacking ? "#ff0000" : player.color;
      this.renderEntity(screenX, screenY, {
        symbol: player.symbol,
        color: playerColor,
      });
    }
  }

  private renderAttackEffect(
    playerScreenX: number,
    playerScreenY: number,
    target: Position,
    offsetX: number,
    offsetY: number,
  ): void {
    const targetScreenX = target.x + offsetX;
    const targetScreenY = target.y + offsetY;

    // Only render if target is on screen
    if (
      targetScreenX >= 0 &&
      targetScreenX < this.viewportWidth &&
      targetScreenY >= 0 &&
      targetScreenY < this.viewportHeight
    ) {
      const time = Date.now() / 1000;
      const playerPixelX = playerScreenX * this.tileSize + this.tileSize / 2;
      const playerPixelY = playerScreenY * this.tileSize + this.tileSize / 2;
      const targetPixelX = targetScreenX * this.tileSize + this.tileSize / 2;
      const targetPixelY = targetScreenY * this.tileSize + this.tileSize / 2;

      this.ctx.save();

      // Attack slash effect
      this.ctx.strokeStyle = "#ff6600";
      this.ctx.lineWidth = 4;
      this.ctx.globalAlpha = 0.8;

      this.ctx.beginPath();
      this.ctx.moveTo(playerPixelX, playerPixelY);
      this.ctx.lineTo(targetPixelX, targetPixelY);
      this.ctx.stroke();

      // Impact sparks at target
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const sparkX = targetPixelX + Math.cos(angle) * 8;
        const sparkY = targetPixelY + Math.sin(angle) * 8;

        this.ctx.fillStyle = "#ffaa00";
        this.ctx.font = `${this.tileSize * 0.5}px monospace`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("💥", sparkX, sparkY);
      }

      this.ctx.restore();
    }
  }

  private renderAuraEffect(screenX: number, screenY: number, aura: any): void {
    const time = Date.now() / 1000;
    const pixelX = screenX * this.tileSize + this.tileSize / 2;
    const pixelY = screenY * this.tileSize + this.tileSize / 2;

    // Get rarity-specific effects
    const isLegendary = aura.rarity === "legendary";
    const isRare = aura.rarity === "rare";
    const isUncommon = aura.rarity === "uncommon";

    // Determine colors and effects based on rarity
    let auraColor = "#aa55ff";
    let sparkleEmojis = ["✨"];
    let effectIntensity = 1;

    if (isLegendary) {
      auraColor = "#ff6b00";
      sparkleEmojis = ["💫", "🌟", "✨", "⭐"];
      effectIntensity = 2;
    } else if (isRare) {
      auraColor = "#aa55ff";
      sparkleEmojis = ["✨", "⭐", "💫"];
      effectIntensity = 1.5;
    } else if (isUncommon) {
      auraColor = "#5599ff";
      sparkleEmojis = ["✨", "⭐"];
      effectIntensity = 1.2;
    }

    this.ctx.save();

    // Legendary gets triple ring system
    const ringCount = isLegendary ? 4 : isRare ? 3 : 2;

    for (let ring = 0; ring < ringCount; ring++) {
      const baseRadius = 8 + ring * 6;
      const radius =
        baseRadius +
        Math.sin(time * (2 + ring) * effectIntensity) * (4 * effectIntensity);
      const alpha =
        (0.4 - ring * 0.1) * effectIntensity +
        Math.sin(time * (3 + ring)) * 0.1;

      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = auraColor;
      this.ctx.lineWidth = isLegendary ? 3 : 2;
      this.ctx.beginPath();
      this.ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Rotating energy particles
    const particleCount = isLegendary ? 12 : isRare ? 8 : 6;
    this.ctx.globalAlpha = 0.9;

    for (let i = 0; i < particleCount; i++) {
      const angle =
        time * 1.5 * effectIntensity + (i * (Math.PI * 2)) / particleCount;
      const particleRadius = 18 + Math.sin(time * 4 + i) * 6;
      const particleX = pixelX + Math.cos(angle) * particleRadius;
      const particleY = pixelY + Math.sin(angle) * particleRadius;

      // Use rarity-specific emojis
      const emojiIndex = isLegendary
        ? i % sparkleEmojis.length
        : Math.floor(i / 2) % sparkleEmojis.length;
      this.ctx.fillStyle = auraColor;
      this.ctx.font = `${this.tileSize * 0.6}px monospace`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(sparkleEmojis[emojiIndex], particleX, particleY);
    }

    // Central power core
    const coreRadius = 6 + Math.sin(time * 3) * 2;
    const coreAlpha = 0.2 + Math.sin(time * 4) * 0.1;
    this.ctx.globalAlpha = coreAlpha * effectIntensity;
    this.ctx.fillStyle = auraColor;
    this.ctx.beginPath();
    this.ctx.arc(pixelX, pixelY, coreRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Legendary gets additional swirling energy streams
    if (isLegendary) {
      this.ctx.globalAlpha = 0.6;
      for (let stream = 0; stream < 3; stream++) {
        const streamAngle = time * 2 + (stream * Math.PI * 2) / 3;
        const streamRadius = 12 + Math.sin(time * 3 + stream) * 4;
        const streamX = pixelX + Math.cos(streamAngle) * streamRadius;
        const streamY = pixelY + Math.sin(streamAngle) * streamRadius;

        this.ctx.strokeStyle = auraColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(streamX, streamY, 3, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  private renderTile(
    x: number,
    y: number,
    tile: { symbol: string; color: string },
  ): void {
    const pixelX = x * this.tileSize;
    const pixelY = y * this.tileSize;

    this.ctx.fillStyle = tile.color;
    this.ctx.font = `${this.tileSize}px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      tile.symbol,
      pixelX + this.tileSize / 2,
      pixelY + this.tileSize / 2,
    );
  }

  private renderEntity(
    x: number,
    y: number,
    entity: { symbol: string; color: string },
  ): void {
    const pixelX = x * this.tileSize;
    const pixelY = y * this.tileSize;

    this.ctx.fillStyle = entity.color;
    this.ctx.font = `bold ${this.tileSize}px monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      entity.symbol,
      pixelX + this.tileSize / 2,
      pixelY + this.tileSize / 2,
    );
  }

  private darkenColor(color: string): string {
    // Simple color darkening - reduce each component by 50%
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = Math.floor(parseInt(hex.substr(0, 2), 16) * 0.5);
      const g = Math.floor(parseInt(hex.substr(2, 2), 16) * 0.5);
      const b = Math.floor(parseInt(hex.substr(4, 2), 16) * 0.5);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
    return color;
  }
}
