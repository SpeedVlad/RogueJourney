import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameEngine } from "../game/game-engine";
import { GameState, Player, Entity, Tile, Message } from "../game/game-objects";
import { useAudio } from "./useAudio";

interface RoguelikeState {
  gameState: GameState | null;
  gameEngine: GameEngine | null;
  
  // Actions
  initializeGame: () => void;
  startGame: () => void;
  handleInput: (key: string) => void;
  updateGame: () => void;
  addMessage: (text: string, type?: 'info' | 'damage' | 'success') => void;
  
  // Inventory actions
  toggleInventory: () => void;
  closeInventory: () => void;
  useItem: (index: number) => void;
  equipItem: (index: number) => void;
  deleteItem: (index: number) => void;
  mergeItems: (index1: number, index2: number) => void;
  unequipItem: (type: 'weapon' | 'armor' | 'aura') => void;
  useBestHealingPotion: () => void;
}

export const useRoguelike = create<RoguelikeState>()(
  subscribeWithSelector((set, get) => ({
    gameState: null,
    gameEngine: null,

    initializeGame: () => {
      console.log("Initializing Roguelike Game");
      const engine = new GameEngine();
      const initialState = engine.initialize();
      
      set({
        gameEngine: engine,
        gameState: initialState
      });
    },

    startGame: () => {
      const { gameEngine } = get();
      if (gameEngine) {
        const newState = gameEngine.startGame();
        set({ gameState: newState });
        
        // Start background music
        const audio = useAudio.getState();
        if (audio.backgroundMusic && !audio.isMuted) {
          audio.backgroundMusic.loop = true;
          audio.backgroundMusic.volume = 0.3;
          audio.backgroundMusic.play().catch(console.log);
        }
      }
    },

    handleInput: (key: string) => {
      const { gameEngine, gameState } = get();
      if (!gameEngine || !gameState || gameState.gamePhase !== 'playing') return;

      let newState = gameState;
      
      // Handle movement
      if (['w', 'W', 'ArrowUp', 's', 'S', 'ArrowDown', 'a', 'A', 'ArrowLeft', 'd', 'D', 'ArrowRight'].includes(key)) {
        // If inventory is open and we press a movement key, close it but don't move
        if (gameState.showInventory) {
          get().closeInventory();
          return;
        }
        
        let dx = 0, dy = 0;
        
        switch (key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            dy = -1;
            break;
          case 's':
          case 'arrowdown':
            dy = 1;
            break;
          case 'a':
          case 'arrowleft':
            dx = -1;
            break;
          case 'd':
          case 'arrowright':
            dx = 1;
            break;
        }
        
        newState = gameEngine.movePlayer(dx, dy);
        
        // Ensure inventory stays closed after movement
        if (newState.showInventory) {
          newState = { ...newState, showInventory: false };
        }
      }
      
      // Handle other actions (but not if inventory is open)
      if (!gameState.showInventory) {
        switch (key.toLowerCase()) {
          case ' ':  // Attack
            newState = gameEngine.playerAttack();
            break;
          case 'e':  // Use stairs or interact
            newState = gameEngine.useStairs();
            break;
          case 'r':  // Restart
            get().initializeGame();
            return;
        }
      }
      
      // Handle inventory actions (always available)
      switch (key.toLowerCase()) {
        case 'c':  // Toggle inventory
          get().toggleInventory();
          return;
        case 'shift':  // Use best healing potion
          get().useBestHealingPotion();
          return;
        case 'escape':
          get().closeInventory();
          return;
      }
      
      if (newState !== gameState) {
        // Preserve the current inventory state
        const currentInventoryState = get().gameState?.showInventory || false;
        const finalState = { ...newState, showInventory: currentInventoryState };
        
        set({ gameState: finalState });
        
        // Update game loop (enemy turns, etc.)
        setTimeout(() => {
          const currentState = get().gameState;
          if (currentState && currentState.gamePhase === 'playing') {
            const updatedState = gameEngine.updateGame();
            // Preserve inventory state during game updates
            const preservedState = { 
              ...updatedState, 
              showInventory: currentState.showInventory 
            };
            set({ gameState: preservedState });
          }
        }, 100);
      }
    },

    updateGame: () => {
      const { gameEngine } = get();
      if (gameEngine) {
        const newState = gameEngine.updateGame();
        set({ gameState: newState });
      }
    },

    addMessage: (text: string, type: 'info' | 'damage' | 'success' = 'info') => {
      set(state => {
        if (!state.gameState) return state;
        
        const newMessage: Message = { text, type, timestamp: Date.now() };
        const messages = [...state.gameState.messages, newMessage];
        
        // Keep only last 50 messages
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100);
        }
        
        return {
          gameState: {
            ...state.gameState,
            messages
          }
        };
      });
    },

    toggleInventory: () => {
      set(state => {
        if (!state.gameState) return state;
        return {
          gameState: {
            ...state.gameState,
            showInventory: !state.gameState.showInventory
          }
        };
      });
    },

    closeInventory: () => {
      set(state => {
        if (!state.gameState) return state;
        return {
          gameState: {
            ...state.gameState,
            showInventory: false
          }
        };
      });
    },

    useItem: (index: number) => {
      const { gameEngine } = get();
      if (gameEngine) {
        const newState = gameEngine.useItem(index);
        set({ gameState: newState });
        
        // Play success sound
        const audio = useAudio.getState();
        audio.playSuccess();
        
        // Keep inventory open
      }
    },

    equipItem: (index: number) => {
      const { gameEngine } = get();
      if (gameEngine) {
        const newState = gameEngine.equipItem(index);
        set({ gameState: newState });
        
        // Play success sound
        const audio = useAudio.getState();
        audio.playSuccess();
        
        // Keep inventory open
      }
    },

    deleteItem: (index: number) => {
      const { gameEngine } = get();
      if (gameEngine) {
        const newState = gameEngine.deleteItem(index);
        set({ gameState: newState });
      }
    },

    mergeItems: (index1: number, index2: number) => {
      const { gameEngine, gameState } = get();
      if (!gameEngine || !gameState) return;

      const item1 = gameState.player.inventory[index1];
      const item2 = gameState.player.inventory[index2];

      if (!item1 || !item2 || item1.type !== item2.type || item1.rarity !== item2.rarity) {
        console.log('Cannot merge items of different types or rarities');
        return;
      }

      // Remove the restrictive 3-item requirement - allow merging any 2 matching items
      const newState = gameEngine.mergeItems(index1, index2);
      set({ gameState: newState });
      
      // Play success sound
      const audio = useAudio.getState();
      audio.playSuccess();
    },

    unequipItem: (type: 'weapon' | 'armor' | 'aura') => {
      const { gameEngine } = get();
      if (gameEngine) {
        const newState = gameEngine.unequipItem(type);
        set({ gameState: newState });
        
        // Play success sound
        const audio = useAudio.getState();
        audio.playSuccess();
      }
    },

    useBestHealingPotion: () => {
      const { gameEngine, gameState } = get();
      if (!gameEngine || !gameState) return;

      // Find all healing potions
      const healingPotions = gameState.player.inventory
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.type === 'consumable' && item.healingPower && item.healingPower > 0);

      if (healingPotions.length === 0) {
        // Show popup message for 3 seconds
        gameEngine.addMessage("No healing potions in inventory!", 'info');
        return;
      }

      // Find the best healing potion (highest healing power)
      const bestPotion = healingPotions.reduce((best, current) => 
        (current.item.healingPower || 0) > (best.item.healingPower || 0) ? current : best
      );

      // Use the best healing potion
      const newState = gameEngine.useItem(bestPotion.index);
      set({ gameState: newState });
    }
  }))
);

// Initialize audio when store is created
useRoguelike.subscribe(
  state => state.gameState,
  (gameState) => {
    if (gameState?.gamePhase === 'gameOver') {
      // Stop background music on game over
      const audio = useAudio.getState();
      if (audio.backgroundMusic) {
        audio.backgroundMusic.pause();
        audio.backgroundMusic.currentTime = 0;
      }
    }
  }
);
