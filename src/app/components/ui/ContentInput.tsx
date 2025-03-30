import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { motion } from 'framer-motion';
import { useReelStore } from '@/app/store/useReelStore';

const ContentInput: React.FC = () => {
  const { inputContent, setInputContent, generateReels, reels } = useReelStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateReels();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="content" className="block text-lg font-medium">
            Paste your content
          </label>
          <TextareaAutosize
            id="content"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Paste your lesson content here..."
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white min-h-[150px] focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            minRows={5}
            maxRows={15}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!inputContent.trim()}
          className={`w-full py-3 px-4 rounded-full font-medium text-white 
            ${!inputContent.trim() 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#ff3040] to-[#833ab4] hover:from-[#ff3040] hover:to-[#5851DB]'
            } transition-all duration-300 ease-in-out`}
        >
          {reels.length > 0 ? 'Regenerate Reels' : 'Create Reels'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContentInput;
