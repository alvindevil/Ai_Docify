'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const VideoPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const features = [
    {
      title: 'PDF to Summary',
      description: 'Transform any PDF into concise, easy-to-understand summaries'
    },
    {
      title: 'Study Notes',
      description: 'Generate comprehensive study notes with key concepts highlighted'
    },
    {
      title: 'Practice Questions',
      description: 'Create practice questions and assignments from your materials'
    },
    {
      title: 'Save Time',
      description: 'Reduce study prep time by 75% with AI-powered document analysis'
    }
  ];

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side: Video */}
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="relative aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/ou-litQ9hWQ?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&rel=0&showinfo=0&modestbranding=1`}
                    title="AiDocify Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  {/* Custom video controls overlay */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                    <button 
                      className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 ml-0.5" /> : <Play className="w-5 h-5 ml-1" />}
                    </button>

                    <button
                      className="flex items-center justify-center w-12 h-12 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                      onClick={() => setIsMuted(!isMuted)}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Play button overlay for initial state */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <button 
                        className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 hover:bg-opacity-100 text-purple-600 rounded-full transition-all duration-200 shadow-lg hover:scale-110"
                        onClick={() => setIsPlaying(true)}
                        aria-label="Play video"
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Description + Features */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                See AiDocify in{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Action
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Watch how AiDocify transforms dense academic papers into clear,
                actionable study materials. Our AI-powered platform analyzes your
                PDFs and extracts the most important information.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button 
                onClick={scrollToUpload}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Try It Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPage;