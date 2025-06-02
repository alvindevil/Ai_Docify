'use client';

import { useRef } from 'react';
import { Inter } from 'next/font/google';
import Navbar from '../Navbar/Navbar';
import VideoPage from '../VideoPage/index';
import AboutUs from '../AboutUs/index';
import styles from './index.module.css'; 

const inter = Inter({ subsets: ['latin'] });

interface LandingPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ darkMode, toggleDarkMode, onGetStarted }) => {
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);

  const scrollToUploadSection = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAboutSection = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`${inter.className} ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen`}>
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {/* Section 1: Hero */}
        <div className="snap-start h-screen flex flex-col">
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AiDocify
                </span>
                <br />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-normal">
                  Upload PDFs to instantly get AI-Powered Summaries, Notes, and Assignments
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl mb-8 text-gray-600 dark:text-gray-300">
                See how you can save 4+ hours on your next study session below.
              </p>
              
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                GET STARTED
                <span className="ml-2 text-xl">→</span>
              </button>

              <p className="mt-6 text-lg text-gray-700 dark:text-gray-400">
                Meet AiDocify - Your Study sidekick just leveled up!
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button
                  onClick={scrollToUploadSection}
                  className="inline-flex items-center px-6 py-2 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Watch Demo
                  <span className="ml-2">↓</span>
                </button>
                
                <button
                  onClick={scrollToAboutSection}
                  className="inline-flex items-center px-6 py-2 bg-transparent border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Learn More
                  <span className="ml-2">↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Video Page */}
        <div className="snap-start h-screen" ref={uploadSectionRef}>
          <VideoPage darkMode={darkMode} onGetStarted={onGetStarted} />
        </div>

        {/* Section 3: About Us */}
        <div className="snap-start min-h-screen" ref={aboutSectionRef}>
          <AboutUs darkMode={darkMode} toggleDarkMode={toggleDarkMode} onGetStarted={onGetStarted} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;