import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaQuestionCircle } from 'react-icons/fa';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 z-30">
      <div className="max-w-md mx-auto flex justify-around py-3">
        <Link 
          href="/"
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
            pathname === '/' ? 'text-[#ff3040]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaHome className="text-xl mb-1" />
          <span className="text-xs">Reels</span>
        </Link>
        
        <Link 
          href="/quizzes"
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
            pathname.includes('/quizzes') ? 'text-[#ff3040]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaQuestionCircle className="text-xl mb-1" />
          <span className="text-xs">Quizzes</span>
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
