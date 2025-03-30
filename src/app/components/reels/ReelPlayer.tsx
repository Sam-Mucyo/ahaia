import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useReelStore } from '@/app/store/useReelStore';
import Reel from './Reel';

const ReelPlayer: React.FC = () => {
  const { 
    reels, 
    currentReelIndex, 
    isPlaying, 
    nextReel, 
    prevReel, 
    togglePlayback,
    resetReels
  } = useReelStore();
  
  if (reels.length === 0) {
    return null;
  }
  
  const currentReel = reels[currentReelIndex];
  
  // Handle click/touch based on position
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const position = (clientX - left) / width;
    
    // Left third of the screen - previous reel
    if (position < 0.3) {
      prevReel();
    }
    // Right third of the screen - next reel
    else if (position > 0.7) {
      nextReel();
    }
    // Middle third of the screen - toggle play/pause
    else {
      togglePlayback();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-10">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#ff3040] to-[#833ab4] text-transparent bg-clip-text">
            InstaLearn
          </h1>
        </div>
        <button
          onClick={resetReels}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <FaTimes className="text-white" />
        </button>
      </div>
      
      {/* Reel Container with click/touch interaction */}
      <div 
        className="relative w-full h-full max-w-md mx-auto bg-gradient-to-b from-gray-900 to-black overflow-hidden"
        onClick={handleInteraction}
      >
        {reels.map((reel, index) => (
          <Reel key={reel.id} reel={reel} isActive={index === currentReelIndex} />
        ))}
        
        {/* Subtle visual indicators for interaction areas (only visible on hover) */}
        <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none flex">
          <div className="w-1/3 h-full bg-gradient-to-r from-white to-transparent" />
          <div className="w-1/3 h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-white opacity-50" />
          </div>
          <div className="w-1/3 h-full bg-gradient-to-l from-white to-transparent" />
        </div>
        
        {/* Progress indicators */}
        <div className="absolute top-16 left-0 right-0 flex justify-center space-x-1 px-4 py-2">
          {reels.map((reel, index) => (
            <div 
              key={reel.id}
              className={`h-1 rounded-full flex-1 max-w-8 ${
                index === currentReelIndex 
                  ? 'bg-white' 
                  : index < currentReelIndex 
                    ? 'bg-gray-400' 
                    : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReelPlayer;
