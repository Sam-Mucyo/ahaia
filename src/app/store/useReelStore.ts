import { create } from 'zustand';

export interface Reel {
  id: string;
  content: string;
  style: {
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    color?: string;
    fontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  duration: number; // in seconds
}

interface ReelStore {
  inputContent: string;
  reels: Reel[];
  currentReelIndex: number;
  isPlaying: boolean;
  
  // Actions
  setInputContent: (content: string) => void;
  generateReels: () => void;
  nextReel: () => void;
  prevReel: () => void;
  setCurrentReelIndex: (index: number) => void;
  togglePlayback: () => void;
  resetReels: () => void;
}

// Helper function to split content into reels
const splitContentIntoReels = (content: string): Reel[] => {
  // Split by paragraphs or sentences
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .filter(sentence => sentence.trim().length > 0);
  
  // Create reels with random styling for variety
  return sentences.map((sentence, index) => {
    const fontWeights = ['normal', 'bold'] as const;
    const fontStyles = ['normal', 'italic'] as const;
    const textAligns = ['left', 'center', 'right'] as const;
    const colors = ['#ffffff', '#ff3040', '#fcaf45', '#833ab4', '#5851DB'];
    
    // Apply some styling variation for visual interest
    const style = {
      fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
      fontStyle: index % 5 === 0 ? fontStyles[1] : fontStyles[0],
      textAlign: textAligns[Math.floor(Math.random() * textAligns.length)],
      color: index % 3 === 0 ? colors[Math.floor(Math.random() * colors.length)] : '#ffffff',
      fontSize: index % 4 === 0 ? '1.5rem' : '1.25rem',
    };
    
    // Calculate duration based on content length (longer text = more time to read)
    const wordCount = sentence.split(/\s+/).length;
    const baseDuration = 3; // minimum seconds
    const durationPerWord = 0.5; // additional time per word
    const duration = Math.max(baseDuration, Math.min(8, baseDuration + wordCount * durationPerWord));
    
    return {
      id: `reel-${index}`,
      content: sentence.trim(),
      style,
      duration,
    };
  });
};

export const useReelStore = create<ReelStore>((set, get) => ({
  inputContent: '',
  reels: [],
  currentReelIndex: 0,
  isPlaying: false,
  
  setInputContent: (content) => set({ inputContent: content }),
  
  generateReels: () => {
    const { inputContent } = get();
    if (!inputContent.trim()) return;
    
    const reels = splitContentIntoReels(inputContent);
    set({ 
      reels,
      currentReelIndex: 0,
      isPlaying: true,
    });
  },
  
  nextReel: () => {
    const { currentReelIndex, reels } = get();
    if (currentReelIndex < reels.length - 1) {
      set({ currentReelIndex: currentReelIndex + 1 });
    } else {
      // Loop back to the beginning
      set({ currentReelIndex: 0 });
    }
  },
  
  prevReel: () => {
    const { currentReelIndex, reels } = get();
    if (currentReelIndex > 0) {
      set({ currentReelIndex: currentReelIndex - 1 });
    } else {
      // Loop to the end
      set({ currentReelIndex: reels.length - 1 });
    }
  },
  
  setCurrentReelIndex: (index) => {
    const { reels } = get();
    if (index >= 0 && index < reels.length) {
      set({ currentReelIndex: index });
    }
  },
  
  togglePlayback: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },
  
  resetReels: () => {
    set({
      reels: [],
      currentReelIndex: 0,
      isPlaying: false,
    });
  },
}));
