import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Briefcase, Grid, Pencil, Check, X, Camera } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import PostCard from '../components/PostCard';
import useAuthStore from '../store/authStore';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar.js';

const FILTER_TABS = ['All', 'Updates', 'Questions', 'Decisions', 'Blockers'];
const FILTER_MAP = { All: null, Updates: 'update', Questions: 'question', Decisions: 'decision', Blockers: 'blocker' };
const ROLE_OPTIONS = ['Developer', 'Designer', 'Manager', 'DevOps', 'QA', 'Product'];

const ROLE_COLORS = {
  Developer: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  Designer:  'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400',
  Manager:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  DevOps:    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  QA:        'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  Product:   'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
};

const GET_PROFILE = gql`
  query GetProfile($id: ID!) {
    getUser(id: $id) {
      id
      name
      avatar_img
      role
      date_created
    }
    getUserPosts(user_id: $id) {
      id
      title
      content
      type
      date_created
      upvotes
      upvotesCount
      commentsCount
      author {
        id
        name
        avatar_img
      }
    }
  }
`;

export default function Profile() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('All');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', avatar_img: '', role: '' });

  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isOwnProfile = currentUser?.id === userId;

  const { data, loading, error, refetch } = useQuery(GET_PROFILE, {
    variables: { id: userId },
    fetchPolicy: 'network-only',
  });

  // Force refetch on mount or when userId changes
  useEffect(() => {
    refetch();
  }, [userId, refetch]);

  // Real-time synchronization: listen for WebSocket post events to auto-refresh heatmap
  useEffect(() => {
    function handleWSEvent(e) {
      const { type } = e.detail || {};
      if (type === 'NEW_POST' || type === 'UPDATED_POST' || type === 'DELETED_POST') {
        refetch();
      }
    }
    window.addEventListener('devpulse_ws_event', handleWSEvent);
    return () => window.removeEventListener('devpulse_ws_event', handleWSEvent);
  }, [refetch]);

  useEffect(() => {
    if (data?.getUser) {
      setEditForm({
        name: data.getUser.name,
        avatar_img: data.getUser.avatar_img || '',
        role: data.getUser.role,
      });
    }
  }, [data]);

  const profileUser = data?.getUser;
  const userPosts = data?.getUserPosts || [];

  const filteredPosts = useMemo(() => {
    const typeFilter = FILTER_MAP[activeTab];
    if (!typeFilter) return userPosts;
    return userPosts.filter((p) => p.type?.toLowerCase() === typeFilter);
  }, [userPosts, activeTab]);

  async function handleSaveProfile() {
    if (!editForm.name.trim()) return toast.error('Name cannot be empty.');
    setSaving(true);
    try {
      const response = await api.patch(`/api/users/${userId}/profile`, {
        name: editForm.name.trim(),
        avatar_img: editForm.avatar_img.trim(),
        role: editForm.role,
      });
      const updatedUser = response.data.data;
      // Sync auth store if it's the current user's profile
      if (isOwnProfile) {
        updateUser(updatedUser);
      }
      setEditing(false);
      toast.success('Profile updated! ✅');
      refetch();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (profileUser) {
      setEditForm({ name: profileUser.name, avatar_img: profileUser.avatar_img || '', role: profileUser.role });
    }
    setEditing(false);
  }

  if (loading && !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <div className="inline-block w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">User not found.</p>
        <Link to="/feed" className="text-indigo-600 mt-2 inline-block">← Back to Feed</Link>
      </div>
    );
  }

  const roleColor = ROLE_COLORS[profileUser.role] || ROLE_COLORS.Developer;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        to="/feed"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 shadow-sm"
      >
        {/* Banner */}
        <div className="h-32 gradient-primary relative">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 70%)' }}
          />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="relative group">
              <img
                src={getAvatarUrl(editing ? editForm.avatar_img : profileUser.avatar_img, editing ? editForm.name : profileUser.name)}
                alt={profileUser.name}
                className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 object-cover bg-gray-200 shadow-lg"
                onError={(e) => handleAvatarError(e, editing ? editForm.name : profileUser.name)}
              />
              {editing && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile && !editing && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all"
                >
                  <Pencil size={14} />
                  Edit Profile
                </motion.button>
              )}
              {editing && (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold gradient-primary text-white disabled:opacity-50 shadow-sm"
                  >
                    {saving ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : <Check size={14} />}
                    Save
                  </motion.button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {isOwnProfile && !editing && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                  You
                </span>
              )}
            </div>
          </div>

          {/* Name & Role */}
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full max-w-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Avatar URL</label>
                  <input
                    type="url"
                    value={editForm.avatar_img}
                    onChange={(e) => setEditForm(f => ({ ...f, avatar_img: e.target.value }))}
                    className="w-full max-w-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profileUser.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
                    <Briefcase size={12} />
                    {profileUser.role}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    Joined {profileUser.date_created ? format(new Date(!isNaN(Number(profileUser.date_created)) ? Number(profileUser.date_created) : profileUser.date_created), 'MMMM yyyy') : 'Recently'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Grid size={12} />
                    {userPosts.length} posts
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>


      {/* Post History */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Posts</h3>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <p className="text-4xl mb-3">🦗</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {activeTab === 'All' ? 'No posts yet' : `No ${activeTab.toLowerCase()} found`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {activeTab === 'All'
                ? `${profileUser.name} hasn't posted anything yet.`
                : `Try a different filter.`}
            </p>
            {isOwnProfile && activeTab === 'All' && (
              <Link to="/feed" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                ← Go create your first post
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PostCard post={post} compact />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
