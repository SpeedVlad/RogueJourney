import { useEffect, useRef } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useRoguelike } from "./lib/stores/useRoguelike";
import GameCanvas from "./game-display";
import GameUI from "./game-interface";
import Inventory from "./player-inventory";
import "@fontsource/inter";
import "./index.css";

function App() {
  const { initializeAudio } = useAudio();
  const { gameState, initializeGame, handleInput } = useRoguelike();
  const gameInitialized = useRef(false);

  // Initialize game and audio
  useEffect(() => {
    if (!gameInitialized.current) {
      initializeAudio();
      initializeGame();
      gameInitialized.current = true;
    }
  }, [initializeAudio, initializeGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState?.gamePhase === 'playing') {
        handleInput(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState?.gamePhase, handleInput]);

  if (!gameState) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div>Initializing Roguelike...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      <GameCanvas />
      <GameUI />
      {gameState.showInventory && <Inventory />}
      
      {/* Game Over Screen */}
      {gameState.gamePhase === 'gameOver' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Game Over</h1>
            <p className="text-xl mb-4">Level Reached: {gameState.level}</p>
            <p className="text-lg mb-6">Score: {gameState.score}</p>
            <button
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameState.gamePhase === 'ready' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center text-white max-w-md">
            <h1 className="text-4xl font-bold mb-6">Roguelike Dungeon</h1>
            <div className="text-left space-y-2 mb-6">
              <p><span className="text-yellow-400">WASD/Arrow Keys:</span> Move</p>
              <p><span className="text-yellow-400">Space:</span> Attack</p>
              <p><span className="text-yellow-400">C:</span> Toggle Inventory</p>
              <p><span className="text-yellow-400">E:</span> Use Stairs</p>
              <p><span className="text-yellow-400">R:</span> Restart Game</p>
              <p><span className="text-yellow-400">Shift:</span> Use healing posion</p>
            </div>
            <button
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              onClick={() => useRoguelike.getState().startGame()}
            >
              Start Adventure
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
