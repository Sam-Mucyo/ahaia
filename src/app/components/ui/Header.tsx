import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-black border-b border-gray-800 py-4 px-6"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaGraduationCap className="text-2xl text-[#ff3040]" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#ff3040] to-[#833ab4] text-transparent bg-clip-text">
            Ahaia
          </h1>
        </div>
        <div className="text-sm text-gray-400">
          Transform content into engaging lessons
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
