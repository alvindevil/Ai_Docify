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
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
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

  const scrollToUploadSection = () => {
    if (pathname === '/') {
      const uploadSection = document.getElementById('uploadSection');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/?scrollToUpload=true');
    }
    
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Check for scrollToUpload parameter on page load
  useEffect(() => {
    if (pathname === '/' && searchParams?.get('scrollToUpload') === 'true') {
      setTimeout(() => {
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, searchParams]);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const menuItems = [
    {
      title: 'Use Cases',
      id: 'useCases',
      items: [
        { label: 'For Students', path: '/use-cases/students' },
        { label: 'For Working Professionals', path: '/use-cases/professionals' }, 
        { label: 'For Scholars & Researchers', path: '/use-cases/researchers' }, 
        { label: 'For Educators', path: '/use-cases/educators' }, 
        { label: 'For Self-Learners', path: '/use-cases/self-learners' }
      ]
    },
    {
      title: 'Product',
      id: 'product',
      items: [
        { label: 'Features', path: '/features' },
        { label: 'Pricing', path: '/pricing' }, 
        { label: 'Documentation', path: '/docs' }, 
        { label: 'API', path: '/api' }
      ]
    },
    {
      title: 'About',
      id: 'about',
      items: [
        { label: 'Our Story', path: '/about' },
        { label: 'Team', path: '/team' }, 
        { label: 'Careers', path: '/careers' }, 
        { label: 'Contact', path: '/contact' }
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

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 no-underline">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                {darkMode ? (
                  <div className="w-full h-full bg-gray-300 rounded-full relative">
                    <div className="absolute w-2 h-2 bg-gray-600 rounded-full top-1 left-2"></div>
                    <div className="absolute w-1 h-1 bg-gray-600 rounded-full top-3 right-2"></div>
                    <div className="absolute w-1.5 h-1.5 bg-gray-600 rounded-full bottom-2 left-3"></div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-yellow-400 rounded-full relative flex items-center justify-center">
                    <div className="absolute inset-0 animate-spin">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`absolute w-0.5 h-2 bg-yellow-400 navbar-sunray`}
                          data-rotate={i * 45}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xl font-bold">AiDocify</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-8">
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
                      className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {menu.items.map((item, index) => (
                        <Link
                          key={index}
                          href={item.path}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 transition-colors duration-200 no-underline"
                        >
                          {item.label}
                        </Link>
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Authentication */}
            <SignedOut>
              <Link
                href="/auth"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 border border-purple-600 hover:border-purple-700 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button 
              onClick={scrollToUploadSection}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <span>Upload PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isMobile && (
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 md:hidden"
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
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
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
                      <Link
                        key={index}
                        href={item.path}
                        onClick={toggleMobileMenu}
                        className="block px-6 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 no-underline"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-4 mt-4 space-y-3">
                <SignedOut>
                  <Link
                    href="/auth"
                    onClick={toggleMobileMenu}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <div className="flex justify-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>

                <button 
                  onClick={scrollToUploadSection}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <span>Upload PDF</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;