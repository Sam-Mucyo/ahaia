"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import Navigation from '../../components/ui/Navigation';
import { FaPlus, FaTrash, FaCheck, FaArrowLeft, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Topic {
  id: number;
  name: string;
}

interface Option {
  text: string;
  is_correct: boolean;
  explanation: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { text: '', is_correct: true, explanation: '' },
    { text: '', is_correct: false, explanation: '' },
  ]);
  const [lectureReference, setLectureReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState<string>('');

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

  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTopic }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopics([...topics, data]);
        setNewTopic('');
        setSelectedTopic(data.id);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to add topic');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding topic:', error);
      setErrorMessage('Failed to add topic');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options];
    
    if (field === 'is_correct') {
      // If setting this option to correct, set all others to false
      newOptions.forEach((opt, i) => {
        if (i === index) {
          opt.is_correct = true;
        } else {
          opt.is_correct = false;
        }
      });
    } else {
      // @ts-ignore - We know the field exists
      newOptions[index][field] = value;
    }
    
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', is_correct: false, explanation: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setErrorMessage('A question must have at least 2 options');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    // If removing the correct option, make the first remaining option correct
    const isRemovingCorrect = options[index].is_correct;
    
    const newOptions = options.filter((_, i) => i !== index);
    
    if (isRemovingCorrect && newOptions.length > 0) {
      newOptions[0].is_correct = true;
    }
    
    setOptions(newOptions);
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image (JPEG, PNG, or GIF)');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the image to the server
    const uploadImage = async () => {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          // Ensure the path is properly formatted
          setImagePath(data.path);
          console.log('Image uploaded successfully, path:', data.path);
          setIsUploading(false);
        } else {
          const error = await response.json();
          setErrorMessage(error.error || 'Failed to upload image');
          setIsUploading(false);
          setTimeout(() => setErrorMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrorMessage('Failed to upload image');
        setIsUploading(false);
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };
    
    uploadImage();
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setImagePath(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!questionText.trim()) {
      setErrorMessage('Question text is required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    const hasEmptyOption = options.some(opt => !opt.text.trim());
    if (hasEmptyOption) {
      setErrorMessage('All options must have text');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    const hasCorrectOption = options.some(opt => opt.is_correct);
    if (!hasCorrectOption) {
      setErrorMessage('At least one option must be correct');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    // If external URL is provided, use it instead of uploaded image
    const finalImagePath = externalImageUrl || imagePath;
    
    try {
      const response = await fetch('http://localhost:5000/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: questionText,
          topic_id: selectedTopic,
          image_path: finalImagePath,
          lecture_reference: lectureReference || null,
          options: options,
        }),
      });
      
      if (response.ok) {
        setSuccessMessage('Question added successfully!');
        
        // Reset form
        setQuestionText('');
        setOptions([
          { text: '', is_correct: true, explanation: '' },
          { text: '', is_correct: false, explanation: '' },
        ]);
        setLectureReference('');
        setImage(null);
        setImagePreview(null);
        setImagePath(null);
        setExternalImageUrl('');
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to add question');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      setErrorMessage('Failed to add question');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black pb-16">
      <Header />
      
      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Link 
              href="/quizzes"
              className="mr-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Back to quizzes"
            >
              <FaArrowLeft className="text-gray-400" />
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff3040] via-[#fcaf45] to-[#833ab4] text-transparent bg-clip-text">
              Create New Quiz Question
            </h1>
          </div>
          
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-400"
            >
              {successMessage}
            </motion.div>
          )}
          
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400"
            >
              {errorMessage}
            </motion.div>
          )}
          
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800">
            <form onSubmit={handleSubmit}>
              {/* Topic Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">Topic</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      type="button"
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
                
                <div className="flex">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Add new topic..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-[#ff3040] text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-4 py-2 bg-[#ff3040] text-white rounded-r-lg hover:bg-[#e02030] transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              
              {/* Question Text */}
              <div className="mb-6">
                <label htmlFor="questionText" className="block text-gray-300 mb-2 font-medium">
                  Question
                </label>
                <textarea
                  id="questionText"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3040] text-white"
                  required
                />
              </div>
              
              {/* Options */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  Answer Options
                </label>
                
                {options.map((option, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center mb-3">
                      <button
                        type="button"
                        onClick={() => handleOptionChange(index, 'is_correct', true)}
                        className={`mr-3 w-6 h-6 rounded-full flex items-center justify-center ${
                          option.is_correct 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {option.is_correct && <FaCheck className="text-xs" />}
                      </button>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-[#ff3040] text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-3 p-2 text-gray-400 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <textarea
                      value={option.explanation}
                      onChange={(e) => handleOptionChange(index, 'explanation', e.target.value)}
                      placeholder="Explanation (optional)"
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-[#ff3040] text-white text-sm"
                    />
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full py-2 bg-gray-800 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FaPlus className="inline mr-2" /> Add Another Option
                </button>
              </div>
              
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  Question Image (Optional)
                </label>
                
                <div className="space-y-4">
                  {/* External Image URL Input */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Enter an image URL:
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={externalImageUrl}
                        onChange={(e) => {
                          setExternalImageUrl(e.target.value);
                          // Clear uploaded image if URL is entered
                          if (e.target.value && imagePreview) {
                            handleRemoveImage();
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3040] text-white"
                        disabled={!!imagePreview}
                      />
                      {externalImageUrl && (
                        <button
                          type="button"
                          onClick={() => setExternalImageUrl('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                        >
                          <FaTimes size={16} />
                        </button>
                      )}
                    </div>
                    {externalImageUrl && (
                      <p className="mt-1 text-sm text-gray-400">
                        External image will be used
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                  </div>
                  
                  {/* File Upload */}
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploading || !!externalImageUrl}
                      />
                      <label 
                        htmlFor="image-upload"
                        className={`cursor-pointer inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors ${(isUploading || !!externalImageUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? 'Uploading...' : 'Choose Image'}
                      </label>
                      <p className="mt-2 text-sm text-gray-500">PNG, JPG, or GIF (max 5MB)</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative w-full h-64">
                        <Image 
                          src={imagePreview} 
                          alt="Preview" 
                          className="rounded-lg object-contain"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                        aria-label="Remove image"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lecture Reference */}
              <div className="mb-6">
                <label htmlFor="lectureReference" className="block text-gray-300 mb-2 font-medium">
                  Lecture Reference (Optional)
                </label>
                <input
                  id="lectureReference"
                  type="text"
                  value={lectureReference}
                  onChange={(e) => setLectureReference(e.target.value)}
                  placeholder="e.g., Chapter 3, Section 2.1"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3040] text-white"
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-[#ff3040] text-white rounded-lg font-medium hover:bg-[#e02030] transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}
