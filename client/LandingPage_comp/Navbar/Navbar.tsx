'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ArrowRight,
  ChevronDown,
  User
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useUser();

  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = (dropdown: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // FIXED UPLOAD CLICK HANDLER
  const handleUploadClick = () => {
    if (!isLoaded) return; // wait until user state is ready

    if (!isSignedIn) {
      // User is not signed in, redirect to auth page
      router.push('/auth');
      return;
    }

    // User is signed in - simply redirect to home page
    // Your main page component will automatically show the dashboard view
    // because isSignedIn is true
    router.push('/');
  };

  // FIXED Handle About section navigation - with proper error handling
  const handleAboutNavigation = (tab: string, sectionId?: string) => {
    setMobileMenuOpen(false); // Close mobile menu if open
    setActiveDropdown(null); // Close dropdown
    
    try {
      // Check if /about route exists, otherwise navigate to home with section
      const aboutPath = `/about?tab=${tab}`;
      router.push(aboutPath);
      
      // If there's a specific section to scroll to, do it after navigation
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home page
      router.push('/');
    }
  };

  // FIXED Handle regular navigation with error handling
  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Optionally show a user-friendly message or fallback
      router.push('/');
    }
  };

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // UPDATED menu items with better error handling and fallback routes
  const menuItems = [
    {
      title: 'Use Cases',
      id: 'useCases',
      items: [
        { label: 'For Students', action: () => handleAboutNavigation('mission') },
        { label: 'For Working Professionals', action: () => handleAboutNavigation('mission') }, 
        { label: 'For Scholars & Researchers', action: () => handleAboutNavigation('mission') }, 
        { label: 'For Educators', action: () => handleAboutNavigation('mission') }, 
        { label: 'For Self-Learners', action: () => handleAboutNavigation('mission') }
      ]
    },
    {
      title: 'Product',
      id: 'product',
      items: [
        { label: 'Features', path: '/#features' }, // Changed to anchor link if page doesn't exist
        { label: 'Pricing', path: '/#pricing' }, // Changed to anchor link if page doesn't exist
        { label: 'Documentation', path: '/docs' }, 
        { label: 'API', path: '/api' }
      ]
    },
    {
      title: 'About',
      id: 'about',
      items: [
        { label: 'Our Story', action: () => handleAboutNavigation('story') },
        { label: 'Mission & Values', action: () => handleAboutNavigation('mission') },
        { label: 'Team', action: () => handleAboutNavigation('team', 'team') }, 
        { label: 'Contact Us', action: () => handleAboutNavigation('contact', 'contact') } // Fixed to use contact tab
      ]
    },
    {
      title: 'Resources',
      id: 'resources',
      items: [
        { label: 'Blog', path: '/blog' },
        { label: 'Tutorials', path: '/tutorials' }, 
        { label: 'Guides', path: '/guides' }, 
        { label: 'Webinars', path: '/webinars' }, 
        { label: 'Case Studies', path: '/case-studies' }
      ]
    }
  ];

  function scrollToUploadSection(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    handleUploadClick();
  }

  return (
    <>
      {/* Add the missing CSS styles for static rays */}
      <style jsx>{`
        .navbar-sunray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2.5px;
          height: 7px;
          background-color: #facc15; /* yellow-400 */
          transform-origin: center center;
          margin-left: -1.75px;
          margin-top: -3px;
        }

        .navbar-sunray[data-rotate="0"]   { transform: rotate(0deg)   translateY(-18px); }
        .navbar-sunray[data-rotate="45"]  { transform: rotate(45deg)  translateY(-18px); }
        .navbar-sunray[data-rotate="90"]  { transform: rotate(90deg)  translateY(-18px); }
        .navbar-sunray[data-rotate="135"] { transform: rotate(135deg) translateY(-18px); }
        .navbar-sunray[data-rotate="180"] { transform: rotate(180deg) translateY(-18px); }
        .navbar-sunray[data-rotate="225"] { transform: rotate(225deg) translateY(-18px); }
        .navbar-sunray[data-rotate="270"] { transform: rotate(270deg) translateY(-18px); }
        .navbar-sunray[data-rotate="315"] { transform: rotate(315deg) translateY(-18px); }
      `}</style>

      <div className={`w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 no-underline cursor-pointer">
              <div className="flex items-center space-x-3">
                <img src={"/favicon.png"} className='w-12 h-14'  ></img>
                <span className="text-xl font-bold">AiDocify</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-8 ">
                {menuItems.map((menu) => (
                  <div 
                    key={menu.id}
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter(menu.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className="flex items-center space-x-1 py-2 text-sm font-medium hover:text-purple-600 transition-colors duration-200 relative">
                      <span>{menu.title}</span>
                      <ChevronDown className="w-4 h-4" />
                      <div 
                        className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                          activeDropdown === menu.id ? 'w-full' : 'w-0'
                        }`}
                      ></div>
                    </button>
                    
                    {activeDropdown === menu.id && (
                      <div 
                        className={`absolute top-full left-0 mt-2 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-2 z-50`}
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        {menu.items.map((item, index) => (
                          <div key={index}>
                            {'path' in item && typeof item.path === 'string' ? (
                              <button
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} hover:text-purple-600 transition-colors duration-200`}
                              >
                                {item.label}
                              </button>
                            ) : (
                              <button
                                onClick={'action' in item && typeof item.action === 'function' ? item.action : undefined}
                                className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} hover:text-purple-600 transition-colors duration-200`}
                              >
                                {item.label}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4">
             <button
  onClick={toggleDarkMode}
  className={`p-2 rounded-xl transition-colors shadow-md cursor-pointer ${
    darkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }`}
  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
>
  {darkMode ? (
    <Sun className="w-5 h-5" />
  ) : (
    <Moon className="w-5 h-5" />
  )}
</button>


              {/* Authentication */}
              <SignedOut>
                <button
                  onClick={() => handleNavigation('/auth')}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 border border-purple-600 hover:border-purple-700 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
                >
                  <User className="w-4 h-4 cursor-pointer" />
                  <span>Sign In</span>
                </button>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              <button 
                onClick={scrollToUploadSection}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                <span>Upload PDF</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isMobile && (
                <button 
                  onClick={toggleMobileMenu}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200 md:hidden`}
                  title="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Divider */}
        <div className={`h-px ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && isMobile && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
            <div className={`fixed right-0 top-0 h-full w-80 max-w-[80vw] ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
              {/* Mobile Menu Header */}
              <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <h2 className="text-lg font-semibold">Menu</h2>
                <button 
                  onClick={toggleMobileMenu}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200`}
                  title='Close Menu'
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="overflow-y-auto h-full pb-20">
                {menuItems.map((menu) => (
                  <div key={menu.id} className="py-2">
                    <div className={`px-4 py-3 text-sm font-medium text-purple-600 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                      {menu.title}
                    </div>
                    <div className="py-1">
                      {menu.items.map((item, index) => (
                        <div key={index}>
                          {('path' in item && typeof item.path === 'string') ? (
                            <button
                              onClick={() => handleNavigation(item.path)}
                              className={`w-full text-left px-6 py-3 text-sm ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200`}
                            >
                              {item.label}
                            </button>
                          ) : (
                            <button
                              onClick={
                                'action' in item && typeof item.action === 'function'
                                  ? item.action
                                  : undefined
                              }
                              className={`w-full text-left px-6 py-3 text-sm ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200`}
                            >
                              {item.label}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-4 mt-4 space-y-3">
                  <SignedOut>
                    <button
                      onClick={() => handleNavigation('/auth')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex justify-center">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>

                  <button 
                    onClick={handleUploadClick}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <span>{isSignedIn ? 'Upload PDF' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;