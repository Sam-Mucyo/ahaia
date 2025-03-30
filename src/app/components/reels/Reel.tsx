import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaThumbsUp, FaThumbsDown, FaRobot, FaShare, FaBookmark } from 'react-icons/fa';
import { useReelStore, Reel as ReelType } from '@/app/store/useReelStore';

interface ReelProps {
  reel: ReelType;
  isActive: boolean;
}

const Reel: React.FC<ReelProps> = ({ reel, isActive }) => {
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const { isPlaying, nextReel } = useReelStore();
  
  // Reset progress when reel changes
  useEffect(() => {
    setProgress(0);
  }, [reel.id]);
  
  // Progress bar animation
  useEffect(() => {
    if (!isActive || !isPlaying) return;
    
    const interval = 100; // Update every 100ms
    const totalSteps = reel.duration * 10; // 10 steps per second
    const increment = 100 / totalSteps;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => nextReel(), 300); // Small delay before next reel
          return 100;
        }
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isActive, isPlaying, reel.duration, nextReel, reel.id]);
  
  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  if (!isActive) return null;
  
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-2 left-2 right-2 h-1 bg-gray-800 rounded-full overflow-hidden z-10">
        <motion.div 
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={reel.id}
          className="px-6 py-4 max-w-[85%] text-center"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <h2 
            style={{
              fontWeight: reel.style.fontWeight,
              fontStyle: reel.style.fontStyle,
              textAlign: reel.style.textAlign,
              color: reel.style.color,
              fontSize: reel.style.fontSize,
            }}
            className="mb-4 tracking-wide leading-relaxed"
          >
            {reel.content}
          </h2>
        </motion.div>
      </AnimatePresence>
      
      {/* AI Feedback and Interaction buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col space-y-6">
        {/* Like/Dislike buttons for AI feedback */}
        <div className="flex flex-col items-center space-y-2">
          <button 
            onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors"
            aria-label="Like this content"
          >
            <FaThumbsUp 
              className={`text-xl ${feedback === 'like' ? 'text-green-500' : 'text-white/70'} transition-colors`} 
            />
          </button>
          
          <button 
            onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors"
            aria-label="Dislike this content"
          >
            <FaThumbsDown 
              className={`text-xl ${feedback === 'dislike' ? 'text-red-500' : 'text-white/70'} transition-colors`} 
            />
          </button>
          
          <span className="text-xs text-center text-white/70">
            AI Feedback
          </span>
        </div>
        
        {/* AI Conversation button */}
        <button 
          className="flex flex-col items-center"
          aria-label="Start AI conversation"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/50 to-purple-500/50 hover:from-blue-600/70 hover:to-purple-600/70 transition-colors">
            <FaRobot className="text-xl text-white/80" />
          </div>
          <span className="text-xs mt-1 text-center text-white/70">
            Ask AI
          </span>
        </button>
        
        <button className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors">
            <FaShare className="text-xl text-white/70" />
          </div>
          <span className="text-xs mt-1 text-white/70">Share</span>
        </button>
        
        <button 
          onClick={() => setBookmarked(!bookmarked)}
          className="flex flex-col items-center"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors">
            <FaBookmark 
              className={`text-xl ${bookmarked ? 'text-yellow-400' : 'text-white/70'} transition-colors`} 
            />
          </div>
          <span className="text-xs mt-1 text-white/70">Save</span>
        </button>
      </div>
      
      {/* User info (simulated) */}
      <div className="absolute left-4 bottom-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/60 to-pink-500/60 flex items-center justify-center text-white font-bold">
          IL
        </div>
        <div className="ml-2">
          <p className="font-bold text-sm text-white/90">InstaLearn</p>
          <p className="text-xs text-white/60">Learning made engaging</p>
        </div>
      </div>
    </div>
  );
};

export default Reel;
