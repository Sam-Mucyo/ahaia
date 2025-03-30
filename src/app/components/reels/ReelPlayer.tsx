import React from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
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
      
      {/* Reel Container */}
      <div className="relative w-full h-full max-w-md mx-auto bg-gradient-to-b from-gray-900 to-black overflow-hidden">
        {reels.map((reel, index) => (
          <Reel key={reel.id} reel={reel} isActive={index === currentReelIndex} />
        ))}
        
        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-8 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={prevReel}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="text-white" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayback}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff3040] to-[#833ab4] hover:from-[#ff3040] hover:to-[#5851DB] transition-colors"
          >
            {isPlaying ? (
              <FaPause className="text-white" />
            ) : (
              <FaPlay className="text-white ml-1" />
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={nextReel}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <FaChevronRight className="text-white" />
          </motion.button>
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
