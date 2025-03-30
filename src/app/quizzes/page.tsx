"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/ui/Header';
import Navigation from '../components/ui/Navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaCheck, FaTimes, FaArrowRight, FaPlus } from 'react-icons/fa';

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
  explanation: string | null;
}

interface Question {
  id: number;
  text: string;
  topic_id: number;
  topic_name: string;
  image_path: string | null;
  lecture_reference: string | null;
  options: Option[];
}

export default function QuizzesPage() {
  const [topics, setTopics] = useState<{ id: number; name: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  interface Stat {
    id: number;
    question_id: number;
    correct_attempts: number;
    incorrect_attempts: number;
    last_attempt_date: string;
    question_text: string;
    topic_name: string | null;
    success_rate: number;
  }
  
  const [stats, setStats] = useState<Stat[] | null>(null);
  
  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:5000/topics');
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    
    fetchTopics();
  }, []);
  
  // Fetch random quiz questions when a topic is selected
  useEffect(() => {
    if (selectedTopic !== null) {
      fetchQuizQuestions();
    }
  }, [selectedTopic]);
  
  const fetchQuizQuestions = async () => {
    setIsLoading(true);
    try {
      const url = selectedTopic 
        ? `http://localhost:5000/quiz/random?count=10&topic_id=${selectedTopic}`
        : 'http://localhost:5000/quiz/random?count=10';
      
      const response = await fetch(url);
      const data = await response.json();
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptionSelect = (optionId: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionId);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOpt = currentQuestion.options.find(opt => opt.id === optionId);
    
    if (selectedOpt) {
      setIsCorrect(selectedOpt.is_correct);
      
      // Update stats
      updateStats(currentQuestion.id, selectedOpt.is_correct);
    }
  };
  
  const updateStats = async (questionId: number, isCorrect: boolean) => {
    try {
      await fetch('http://localhost:5000/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          is_correct: isCorrect,
        }),
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz completed
      fetchStats();
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const resetQuiz = () => {
    setStats(null);
    fetchQuizQuestions();
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Determine if a quiz is in progress - when questions are loaded and stats aren't showing yet
  const quizInProgress = questions.length > 0 && !stats && !isLoading;
  
  return (
    <div className="flex flex-col min-h-screen bg-black pb-16">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className={`w-full max-w-3xl mx-auto ${quizInProgress ? 'max-w-2xl' : ''}`}>
          {!quizInProgress && (
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-[#ff3040] via-[#fcaf45] to-[#833ab4] text-transparent bg-clip-text">
                  Interactive Quizzes
                </h1>
                <p className="text-gray-400 max-w-lg">
                  Test your knowledge with our interactive quizzes.
                </p>
              </div>
              
              <Link 
                href="/quizzes/create"
                className="flex items-center px-4 py-2 bg-[#ff3040] text-white rounded-lg hover:bg-[#e02030] transition-colors"
              >
                <FaPlus className="mr-2" />
                Create Quiz
              </Link>
            </div>
          )}
          
          <div className={`bg-gray-900 rounded-xl ${quizInProgress ? 'p-4' : 'p-6'} shadow-lg border border-gray-800`}>
            {/* Topic Selection - Only show when not in a quiz */}
            {!quizInProgress && (
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Select a Topic:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedTopic === null 
                        ? 'bg-[#ff3040] text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All Topics
                  </button>
                  
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        selectedTopic === topic.id 
                          ? 'bg-[#ff3040] text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="text-[#ff3040] text-3xl animate-spin" />
              </div>
            ) : stats ? (
              // Quiz Results
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
                <p className="text-lg mb-6">
                  Check out your performance statistics below:
                </p>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  {stats.filter((s: Stat) => questions.some(q => q.id === s.question_id)).map((stat: Stat, index: number) => (
                    <div key={index} className="mb-4 last:mb-0 p-3 bg-gray-900 rounded">
                      <p className="font-medium">{stat.question_text}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-400">
                          {stat.correct_attempts} correct / {stat.incorrect_attempts} incorrect
                        </span>
                        <span className={`text-sm font-bold ${
                          stat.success_rate > 70 ? 'text-green-500' : 
                          stat.success_rate > 40 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {Math.round(stat.success_rate)}% success
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-[#ff3040] text-white rounded-lg font-medium hover:bg-[#e02030] transition-colors"
                >
                  Start New Quiz
                </button>
              </div>
            ) : questions.length > 0 ? (
              // Quiz Questions
              <div>
                {quizInProgress && (
                  <button 
                    onClick={() => {
                      setQuestions([]);
                      setCurrentQuestionIndex(0);
                      setSelectedOption(null);
                      setIsAnswered(false);
                    }}
                    className="mb-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center text-gray-400 hover:text-white"
                    aria-label="Back to quiz selection"
                  >
                    <FaArrowRight className="transform rotate-180 mr-2" />
                    <span>Exit Quiz</span>
                  </button>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium text-[#ff3040]">
                    {currentQuestion.topic_name || 'General'}
                  </span>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-medium mb-2">{currentQuestion.text}</h3>
                      {currentQuestion.image_path && (
                        <div className="mb-4 relative w-full h-64 rounded-lg overflow-hidden">
                          <Image 
                            src={currentQuestion.image_path.startsWith('http') 
                              ? currentQuestion.image_path 
                              : `http://localhost:5000${currentQuestion.image_path.startsWith('/') ? '' : '/'}${currentQuestion.image_path}`
                            } 
                            alt="Question image" 
                            className="rounded-lg object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {currentQuestion.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          className={`w-full text-left p-4 rounded-lg flex items-center justify-between transition-colors ${
                            selectedOption === option.id
                              ? option.is_correct
                                ? 'bg-green-600/20 border border-green-500'
                                : 'bg-red-600/20 border border-red-500'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                          disabled={isAnswered}
                        >
                          <span>{option.text}</span>
                          {isAnswered && selectedOption === option.id && (
                            option.is_correct ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <FaTimes className="text-red-500" />
                            )
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {isAnswered && (
                      <div className="mb-6">
                        <div className={`p-4 rounded-lg ${
                          isCorrect ? 'bg-green-600/20 border border-green-500' : 'bg-red-600/20 border border-red-500'
                        }`}>
                          <p className="font-medium mb-2">
                            {isCorrect ? 'Correct!' : 'Incorrect!'}
                          </p>
                          {currentQuestion.options.find(opt => opt.is_correct)?.explanation && (
                            <p className="text-sm text-gray-300">
                              {currentQuestion.options.find(opt => opt.is_correct)?.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {isAnswered && (
                      <div className="flex justify-end">
                        <button
                          onClick={nextQuestion}
                          className="flex items-center px-4 py-2 bg-[#ff3040] text-white rounded-lg hover:bg-[#e02030] transition-colors"
                        >
                          {currentQuestionIndex < questions.length - 1 ? (
                            <>Next Question <FaArrowRight className="ml-2" /></>
                          ) : (
                            <>Finish Quiz <FaArrowRight className="ml-2" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              // No questions yet
              <div className="text-center py-12">
                <p className="text-gray-400 mb-6">
                  Select a topic to start a quiz or click the button below to get questions from all topics.
                </p>
                <button
                  onClick={() => fetchQuizQuestions()}
                  className="px-6 py-3 bg-[#ff3040] text-white rounded-lg font-medium hover:bg-[#e02030] transition-colors"
                >
                  Start Random Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}
