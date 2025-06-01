'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPageProps {
  darkMode?: boolean;
  onGetStarted?: () => void;
}

const VideoPage: React.FC<VideoPageProps> = ({ darkMode = false, onGetStarted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const features = [
    {
      title: 'PDF to Summary',
      description: 'Transform PDFs into concise summaries'
    },
    {
      title: 'Study Notes',
      description: 'Generate comprehensive study notes'
    },
    {
      title: 'Practice Questions',
      description: 'Create practice questions from materials'
    },
    {
      title: 'Save Time',
      description: 'Reduce study prep time by 75%'
    }
  ];

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={`h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'} flex items-center`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 h-full py-4">
          {/* Left side: Video */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            <div className="relative">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-xl overflow-hidden border`}>
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
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                    <button 
                      className="flex items-center justify-center w-10 h-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                      className="flex items-center justify-center w-10 h-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                      onClick={() => setIsMuted(!isMuted)}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Play button overlay for initial state */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                      <button 
                        className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-90 hover:bg-opacity-100 text-purple-600 rounded-full transition-all duration-200 shadow-lg hover:scale-110"
                        onClick={() => setIsPlaying(true)}
                        aria-label="Play video"
                      >
                        <Play className="w-6 h-6 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Description + Features */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4 lg:space-y-6">
            <div className="text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 lg:mb-4`}>
                See AiDocify in{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Action
                </span>
              </h2>

              <p className={`text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Watch how AiDocify transforms dense academic papers into clear,
                actionable study materials with AI-powered analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 p-3 lg:p-4 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  } shadow-md border hover:shadow-lg hover:scale-105 transform transition-transform duration-200`}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm lg:text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {feature.title}
                    </h3>
                    <p className={`text-xs lg:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 lg:pt-4 flex justify-center">
              <button 
                onClick={onGetStarted}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
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