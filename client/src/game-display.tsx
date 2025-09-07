import { useRef, useEffect } from "react";
import { useRoguelike } from "./lib/stores/useRoguelike";
import { GameRenderer } from "./lib/game/renderer";

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const { gameState } = useRoguelike();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Initialize renderer
    rendererRef.current = new GameRenderer(context);

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!rendererRef.current) return;

    let animationId: number;
    
    // Continuous animation loop for aura effects
    const animate = () => {
      if (rendererRef.current && gameState) {
        rendererRef.current.render(gameState);
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;
