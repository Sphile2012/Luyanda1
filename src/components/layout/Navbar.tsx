import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Car } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/buyers', label: 'Buyers' },
    { path: '/dealerships', label: 'Dealerships' },
    { path: '/become-agent', label: 'Become Agent' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Car className="w-8 h-8 text-brand-500" />
            <span className="text-xl font-bold text-navy-500">Drive Agency</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-500'
                    : 'text-gray-600 hover:text-brand-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/portal"
              className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
            >
              Staff Login
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 text-sm font-medium ${
                    isActive(link.path)
                      ? 'text-brand-500 bg-brand-50'
                      : 'text-gray-600 hover:text-brand-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/portal"
                onClick={() => setIsOpen(false)}
                className="mx-4 px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg text-center hover:bg-brand-600 transition-colors"
              >
                Staff Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
