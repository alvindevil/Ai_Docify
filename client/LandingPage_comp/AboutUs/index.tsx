'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Inter } from 'next/font/google';
import { 
  ArrowRight, 
  Users, 
  Target, 
  Lightbulb, 
  Award, 
  Heart,
  BookOpen,
  Zap,
  Globe,
  Mail,
  Linkedin,
  Twitter,
  Github,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Instagram,
  MessageCircle,
  
} from 'lucide-react';
import { title } from 'process';
import { MessageCircleMore } from 'lucide-react'; 


const inter = Inter({ subsets: ['latin'] });

interface AboutUsProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onGetStarted: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ darkMode, toggleDarkMode, onGetStarted }) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('story');

  // Handle URL parameters to set the active tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['story', 'mission', 'team'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const teamMembers = [
    {
      name: "Shivam Yadav",
      role: "Backend Developer & Integrator",
      bio: "I'm Shivam Yadav, a B.Tech CSE student with a strong foundation in programming, web development, and UI/UX design. I specialize in JavaScript, C++, and the MERN stack, and I'm passionate about integrating AI into modern web applications. I'm actively learning full-stack development and DSA, and I enjoy building practical, user-focused solutions through both academic and hands-on project experience.",
      image: "👩‍💼",
      social: { 
        linkedin: "https://www.linkedin.com/in/shivam-yadav-2666ba253?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        mail: "https://mail.google.com/mail/?view=cm&fs=1&to=yadavs47334@gmail.com",
        github: "https://github.com/alvindevil",
        instagram: "https://www.instagram.com/shivam_yadav3690?igsh=MTRvcm1qdnZkdzdkZA==", // used Instagram here for lack of Twitter
        whatsapp: "https://wa.me/919519512078"
       }
    },
    {
      name: "Somesh Pratap Singh",
      role: "Frontend Developer & Designer", 
       bio: "I'm Somesh Pratap Singh, a B.Tech student at the University of Lucknow passionate about frontend development and design. I have experience with HTML, CSS, JavaScript, React, NextJs and UI/UX principles. I enjoy building clean, responsive user interfaces and continually enhance my skills through practical projects and creative exploration.",
      image: "👨‍💻",
      social: { 
        whatsapp: "https://wa.me/919026406277",
        linkedin: "https://linkedin.com/in/somesh-pratap-singh-6668b525a",
        github: "https://github.com/sammy0318",
        instagram: "https://www.instagram.com/sammy._._.03/",
        mail: "https://mail.google.com/mail/?view=cm&fs=1&to=somesh180309@gmail.com"
       }
    },
  
  ];

  const values = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Education First",
      description: "Every feature we build is designed with learners in mind, making education more accessible and effective."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovation",
      description: "We leverage cutting-edge AI technology to solve real problems in education, always pushing the boundaries."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Student Success",
      description: "Your academic success is our mission. We measure our success by the hours we save you and the grades we help you achieve."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy & Security",
      description: "Your documents and data are sacred. We use industry-leading security measures to protect your academic work."
    }
  ];

  const stats = [
    { number: "500K+", label: "PDFs Processed", icon: <BookOpen className="w-6 h-6" /> },
    { number: "150K+", label: "Happy Students", icon: <Users className="w-6 h-6" /> },
    { number: "2M+", label: "Hours Saved", icon: <Clock className="w-6 h-6" /> },
    { number: "95%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> }
  ];

  const milestones = [
    {
      year: "2025",
      title: "The Idea",
      description: "Founded by frustrated grad students who were spending more time summarizing papers than actually learning from them."
    },
    {
      year: "2025",
      title: "First Prototype",
      description: "Built our first AI-powered PDF summarizer that could process academic papers in seconds instead of hours."
    },
    {
      year: "2025",
      title: "Beta Launch",
      description: "Launched beta version with 100 universities. Students reported saving 4+ hours per week on document processing."
    },
    {
      year: "2025",
      title: "Public Launch",
      description: "Officially launched AiDocify with features like smart note-taking, document chat, and AI-powered summaries.",
    },
     {
      year: "2025",
      title: "Major Features",
      description: "Added smart note generation, assignment creation, and multi-language support based on user feedback."
    },
    {
      year: "2025",
      title: "Scale & Growth",
      description: "Reached 150K+ active students across 500+ institutions worldwide. Secured Series A funding to accelerate growth."
    }
  ];

  return (
    <div className={`${inter.className} ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-5.5xl font-bold mb-5">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                About AiDocify
              </span>
            </h1>
            <p className="text-xl sm:text-1.5xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're on a mission to revolutionize how students learn by making AI-powered document processing accessible to everyone.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </button>
              <button
  onClick={() => {
    setActiveTab('team'); // ensure the section exists
    setTimeout(() => {
      document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // small delay to allow rendering
  }}
  className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg text-lg transition-all duration-200"
>
  Meet Our Team
  <Users className="ml-1.5 w-4 h-4" />
</button>

            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${darkMode ? 'bg-purple-600' : 'bg-purple-100'} group-hover:scale-110 transition-transform duration-200`}>
                  <div className={darkMode ? 'text-white' : 'text-purple-600'}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-12">
          <div className={`inline-flex p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {[
              { id: 'story', label: 'Our Story', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'mission', label: 'Mission & Values', icon: <Target className="w-4 h-4" /> },
              { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Our Story Tab */}
        {activeTab === 'story' && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Journey</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                From frustrated grad students to a team revolutionizing how millions learn. Here's how AiDocify came to be.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-2`}>
                  <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                    index % 2 === 0 ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {milestone.year}
                  </div>
                  <div className="pt-6">
                    <h3 className="text-2xl font-bold mb-4">{milestone.title}</h3>
                    <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission & Values Tab */}
        {activeTab === 'mission' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Mission & Values</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We believe that every student deserves access to powerful AI tools that make learning more efficient and enjoyable.
              </p>
            </div>

            <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-12`}>
              <div className="flex items-center justify-center mb-6">
                <Target className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-center mb-6">Our Mission</h3>
              <p className="text-lg text-center max-w-4xl mx-auto leading-relaxed">
                To democratize education by providing AI-powered tools that help students learn more effectively, 
                save time on document processing, and focus on what matters most - understanding and applying knowledge. 
                We envision a world where every student has access to personalized AI tutoring and document assistance, 
                regardless of their background or resources.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-2`}>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-6 text-white">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="max-w-6xl mx-auto" id="team">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                A diverse group of educators, engineers, and researchers united by our passion for transforming education through AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {teamMembers.map((member, index) => (
                <div key={index} className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-2`}>
                  <div className="flex items-center mb-6">
                    <div className="text-6xl mr-6">{member.image}</div>
                    <div>
                      <h3 className="text-2xl font-bold">{member.name}</h3>
                      <p className="text-purple-600 font-semibold">{member.role}</p>
                    </div>
                  </div>
                  <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {member.bio}
                  </p>
                  <div className="flex space-x-4">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title={`LinkedIn profile of ${member.name}`}
                        aria-label={`LinkedIn profile of ${member.name}`}
                      >
                        <Linkedin className="w-6 h-6" />
                      </a>
                    )}

                    {member.social.mail && (
                            <a
                            href={member.social.mail}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title={`Email ${member.name}`}
                             aria-label={`Email ${member.name}`}
                            >
                        <Mail className="w-6 h-6" />
                          </a>
            )}

              
                   
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        className={`${darkMode ? 'text-white' : 'text-gray-900'} hover:text-gray-600 transition-colors`}
                        aria-label={`GitHub profile of ${member.name}`}
                        title={`GitHub profile of ${member.name}`}
                      >
                        <Github className="w-6 h-6" />
                      </a>
                    )}

                            {member.social.instagram && (
              <a
                  href={member.social.instagram}
                  className="text-pink-500 hover:text-pink-600 transition-colors"
                  title={`Instagram profile of ${member.name}`}
                  aria-label={`Instagram profile of ${member.name}`}
              >
             <Instagram className="w-6 h-6" />
            </a>
         )}
                    {member.social.whatsapp && (
                    <a
                         href={member.social.whatsapp}
                         className="text-green-500 hover:text-green-600 transition-colors"
                         title={`WhatsApp ${member.name}`}
                         aria-label={`WhatsApp ${member.name}`}
                      >
                     <MessageCircleMore className="w-6 h-6" />
                     </a>
      )}  

                  </div>
                </div>
              ))}
            </div>

            {/* Join Our Team */}
            <div className={`p-8 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-900 to-blue-900' : 'bg-gradient-to-r from-purple-100 to-blue-100'} text-center`}>
              <h3 className="text-3xl font-bold mb-4">Want to Join Our Mission?</h3>
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                We're always looking for passionate individuals who want to make a difference in education.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button
                className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-all duration-200"
                onClick={() => {
                const section = document.getElementById("team");
                if (section) {
                section.scrollIntoView({ behavior: "smooth" });
                 }
                }}
                    >
                 Contact Us
                   <Mail className="ml-2 w-5 h-5" />
               </button>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of students who are already saving hours every week with AiDocify's AI-powered document processing.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg text-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Start Your Free Ai Learning Journey
            <ArrowRight className="ml-3 w-6 h-6" />
          </button>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No credit card required • Just Sign Up and Start Learning

          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;