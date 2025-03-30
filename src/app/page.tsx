"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/ui/Header";
import ContentInput from "./components/ui/ContentInput";
import ReelPlayer from "./components/reels/ReelPlayer";
import Navigation from "./components/ui/Navigation";
import { useReelStore } from "./store/useReelStore";

export default function Home() {
  const { reels } = useReelStore();
  
  return (
    <div className="flex flex-col min-h-screen bg-black pb-16">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff3040] via-[#fcaf45] to-[#833ab4] text-transparent bg-clip-text">
              Transform Content into Engaging Lessons
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Paste your content below and watch it transform into engaging, social media-style learning reels.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800">
            <ContentInput />
          </div>
          
          {reels.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">
                {reels.length} reels created! Swipe through them to learn in bite-sized chunks.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Ahaia. All rights reserved.</p>
        </div>
      </footer>
      
      <AnimatePresence>
        {reels.length > 0 && <ReelPlayer />}
      </AnimatePresence>
      
      <Navigation />
    </div>
  );
}
