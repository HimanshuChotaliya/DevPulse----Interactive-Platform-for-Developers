import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import useThemeStore from './store/themeStore';
import useUserStore from './store/userStore';
import useAuthStore from './store/authStore';
import { connectSocket, disconnectSocket } from './api/socket';

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
}

function AppLayout({ children }) {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 lg:ml-64 mb-16 lg:mb-0 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function GlobalPresence() {
  const { fetchOnlineUsers, markActive } = useUserStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) {
      disconnectSocket();
      return;
    }

    // Connect WebSocket
    connectSocket();

    // Mark as active on mount
    markActive(user.id);

    // Initial fetch
    fetchOnlineUsers();

    // Poll for online users every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, [user?.id]);

  return null;
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <GlobalPresence />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #1f2937)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
