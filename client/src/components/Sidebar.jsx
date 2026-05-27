import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Rss, User, Users } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar.js';

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const onlineUsers = useUserStore((s) => s.onlineUsers);

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed top-16 bottom-0 left-0 border-r border-gray-200/50 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm overflow-y-auto z-30 p-4 gap-4">
      {/* Navigation */}
      <nav className="space-y-1">
        <SidebarLink to="/feed" icon={<Rss size={17} />} label="Feed" />
        <SidebarLink to={`/profile/${user?.id}`} icon={<User size={17} />} label="My Profile" />
      </nav>

      {/* Online Users */}
      <div className="flex-1">
        <div className="flex items-center gap-2 px-3 mb-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Online</span>
          <span className="ml-auto text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
            {onlineUsers.length}
          </span>
        </div>

        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {onlineUsers.map((u) => {
              const uId = u.user_id || u.id;
              return (
                <motion.div
                  key={uId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={`/profile/${uId}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={getAvatarUrl(u.avatar_img, u.name)}
                        alt={u.name}
                        onError={(e) => handleAvatarError(e, u.name)}
                        className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{u.role}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/feed' && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
      }`}
    >
      <span className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
