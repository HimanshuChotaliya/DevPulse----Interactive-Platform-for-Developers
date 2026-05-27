import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sun, Moon, User, LogOut, ChevronDown, Wifi, WifiOff, Users } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import useThemeStore from '../store/themeStore';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const { onlineUsers, markInactive } = useUserStore();
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    if (user?.id) {
      markInactive(user.id);
    }
    logout();
    navigate('/login');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-gradient hidden sm:block">DevPulse</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Online count */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Users size={14} className="text-green-500" />
            <span>{onlineUsers.length} online</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full pr-2 pl-1 py-1 transition-colors"
            >
              <img
                src={user?.avatar_img}
                alt={user?.name}
                className="w-8 h-8 rounded-full border-2 border-indigo-500/30 object-cover bg-gray-200"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:block max-w-24 truncate">{user?.name}</span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 glass rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to={`/profile/${user?.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User size={15} />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
