import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, MessageCircle, User, Code, Moon, Sun, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/match', icon: Users, label: 'Match' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/feed" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <Code className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  DevConnect
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/10 to-cyan-500/10 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:scale-105"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 p-0.5 cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-full h-full bg-gray-800 rounded-[10px] flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3">
              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navItems.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/10 to-cyan-500/10 text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-4 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-150"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Match Button */}
      <Link
        to="/match"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Find matches"
      >
        <Users className="w-6 h-6" />
      </Link>
    </>
  );
};

export default Navbar;