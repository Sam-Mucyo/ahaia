import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEllipsisH, FaShare, FaBookmark } from 'react-icons/fa';
import { useReelStore, Reel as ReelType } from '@/app/store/useReelStore';

interface ReelProps {
  reel: ReelType;
  isActive: boolean;
}

const Reel: React.FC<ReelProps> = ({ reel, isActive }) => {
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const { isPlaying, nextReel } = useReelStore();
  
  // Toggle more options menu and handle outside clicks
  const toggleMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setMoreOptionsOpen(prev => !prev);
  };
  
  // Close more options when clicking outside
  useEffect(() => {
    // Only add the listener when the menu is open
    if (!moreOptionsOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
        setMoreOptionsOpen(false);
      }
    };
    
    // Use capture phase to ensure we get the event first
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [moreOptionsOpen]);
  
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
      
      {/* Simplified interaction buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col space-y-6">
        {/* Like button for AI feedback */}
        <button 
          onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors"
          aria-label="Like this content"
        >
          <FaThumbsUp 
            className={`text-xl ${feedback === 'like' ? 'text-green-500' : 'text-white/70'} transition-colors`} 
          />
        </button>
        
        {/* Dislike button for AI feedback */}
        <button 
          onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors"
          aria-label="Dislike this content"
        >
          <FaThumbsDown 
            className={`text-xl ${feedback === 'dislike' ? 'text-red-500' : 'text-white/70'} transition-colors`} 
          />
        </button>
        
        {/* AI Conversation button with familiar comment icon */}
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors"
          aria-label="Chat with AI about this content"
        >
          <FaComment className="text-xl text-white/70" />
        </button>
        
        {/* More options button with expandable menu */}
        <div className="relative" ref={moreOptionsRef}>
          <button 
            onClick={toggleMoreOptions}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/40 hover:bg-gray-700/60 transition-colors"
            aria-label="More options"
            aria-expanded={moreOptionsOpen}
          >
            <FaEllipsisH className="text-xl text-white/70" />
          </button>
          
          {/* Expandable options menu */}
          {moreOptionsOpen && (
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMoreOptionsOpen(false)}
              style={{ backgroundColor: 'transparent' }}
            />
          )}
          
          <AnimatePresence>
            {moreOptionsOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 bottom-12 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 w-40 shadow-lg z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="flex items-center w-full p-2 rounded hover:bg-gray-700/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality would go here
                    setMoreOptionsOpen(false);
                  }}
                >
                  <FaShare className="text-white/70 mr-3" />
                  <span className="text-sm text-white/90">Share</span>
                </button>
                
                <button 
                  className="flex items-center w-full p-2 rounded hover:bg-gray-700/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookmarked(!bookmarked);
                    setMoreOptionsOpen(false);
                  }}
                >
                  <FaBookmark 
                    className={`mr-3 ${bookmarked ? 'text-yellow-400' : 'text-white/70'}`} 
                  />
                  <span className="text-sm text-white/90">Save</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
