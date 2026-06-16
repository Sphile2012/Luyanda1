import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Car } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal') ||
    location.pathname.startsWith('/agent-dashboard') ||
    location.pathname.startsWith('/management-dashboard');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  if (isPortal) return null;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/buyers', label: 'Buyers' },
    { path: '/dealerships', label: 'Dealerships' },
    { path: '/become-agent', label: 'Become an Agent' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-950 shadow-xl' : 'bg-gray-950'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Drive Agency</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/portal"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Staff Login
            </Link>
            <Link
              to="/buyers"
              className="inline-flex items-center px-5 py-2 bg-brand-500 text-white text-sm font-semibold rounded-full hover:bg-brand-600 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive(link.path)
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/portal"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                Staff Login
              </Link>
              <Link
                to="/buyers"
                onClick={() => setIsOpen(false)}
                className="mx-4 mt-2 px-5 py-2 bg-brand-500 text-white text-sm font-semibold rounded-full text-center hover:bg-brand-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
