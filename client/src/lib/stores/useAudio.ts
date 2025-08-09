import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  initializeAudio: () => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false, // Start unmuted
  
  initializeAudio: () => {
    try {
      const backgroundMusic = new Audio('/sounds/background.mp3');
      const hitSound = new Audio('/sounds/hit.mp3');
      const successSound = new Audio('/sounds/success.mp3');
      
      // Preload audio files
      backgroundMusic.preload = 'auto';
      hitSound.preload = 'auto';
      successSound.preload = 'auto';
      
      set({
        backgroundMusic,
        hitSound,
        successSound
      });
      
      console.log("Audio initialized");
    } catch (error) {
      console.log("Audio initialization failed:", error);
    }
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(console.log);
      }
    }
    
    set({ isMuted: newMutedState });
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.4;
      soundClone.play().catch(console.log);
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.volume = 0.3;
      successSound.play().catch(console.log);
    }
  }
}));
