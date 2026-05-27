import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, User, Users, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar.js';

export default function BottomNav() {
  const [onlineSheetOpen, setOnlineSheetOpen] = useState(false);
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const onlineUsers = useUserStore((s) => s.onlineUsers);

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 glass border-t border-gray-200/50 dark:border-gray-700/50 flex items-center px-6">
        <NavTab to="/feed" icon={<Rss size={20} />} label="Feed" active={pathname === '/feed'} />
        <button
          onClick={() => setOnlineSheetOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2"
        >
          <div className="relative">
            <Users size={20} className="text-gray-500 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {onlineUsers.length}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Online</span>
        </button>
        <NavTab to={`/profile/${user?.id}`} icon={<User size={20} />} label="Profile" active={pathname.includes('/profile')} />
      </nav>

      {/* Online Users Bottom Sheet */}
      <AnimatePresence>
        {onlineSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOnlineSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl pb-8 max-h-[70vh] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Online <span className="ml-1 text-sm font-normal text-gray-500">({onlineUsers.length})</span>
                </h3>
                <button
                  onClick={() => setOnlineSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 pt-3 space-y-1">
                {onlineUsers.map((u) => {
                  const uId = u.user_id || u.id;
                  return (
                    <Link
                      key={uId}
                      to={`/profile/${uId}`}
                      onClick={() => setOnlineSheetOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={getAvatarUrl(u.avatar_img || u.avatar, u.name)}
                          alt={u.name}
                          onError={(e) => handleAvatarError(e, u.name)}
                          className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>
                      <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">● online</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavTab({ to, icon, label, active }) {
  return (
    <Link to={to} className="flex-1 flex flex-col items-center gap-1 py-2">
      <span className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}>{icon}</span>
      <span className={`text-[11px] font-medium ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
    </Link>
  );
}
