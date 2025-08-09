import { useRoguelike } from "../../lib/stores/useRoguelike";
import { useAudio } from "../../lib/stores/useAudio";
import ProgressBar from "../ui/ProgressBar";
import { Volume2, VolumeX } from "lucide-react";

const GameUI = () => {
  const { gameState } = useRoguelike();
  const { isMuted, toggleMute } = useAudio();

  if (!gameState || gameState.gamePhase !== 'playing') {
    return null;
  }

  const { player } = gameState;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Player Stats */}
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg border border-gray-600">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-400">❤</span>
              <ProgressBar 
                current={player.health} 
                max={player.maxHealth} 
                color="bg-red-500" 
                width="120px"
              />
              <span className="text-sm">{player.health}/{player.maxHealth}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-orange-400">🔥</span>
              <span className="text-sm font-bold">{player.attackPower}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🛡️</span>
              <span className="text-sm font-bold">{player.defense}</span>
            </div>
            
            <div className="text-sm space-y-1">
              <div>Level: {gameState.level}</div>
              <div>XP: {player.experience}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={toggleMute}
            className="bg-black bg-opacity-80 text-white p-2 rounded-lg border border-gray-600 hover:bg-opacity-100 transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>



      {/* Bottom Message Log */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg border border-gray-600 pointer-events-auto max-h-32 overflow-y-auto">
        <div className="space-y-1 text-sm">
          {gameState.messages.slice(-5).map((message, index) => (
            <div key={index} className={`${message.type === 'damage' ? 'text-red-400' : message.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
              {message.text}
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default GameUI;
