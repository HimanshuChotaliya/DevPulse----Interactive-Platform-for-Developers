import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUp, MessageCircle, CheckCircle2, MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import usePostStore from '../store/postStore';
import useUserStore from '../store/userStore';
import TypeBadge from './TypeBadge';
import PresenceDot from './PresenceDot';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar.js';

export default function PostCard({ post, compact = false }) {
  const user = useAuthStore((s) => s.user);
  const toggleUpvote = usePostStore((s) => s.toggleUpvote);
  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const onlineUsers = useUserStore((s) => s.onlineUsers);

  const author = post.author || { name: 'Unknown', avatar_img: '' };
  const authorId = author.id || post.user_id;
  const isOnline = onlineUsers.some((u) => u.user_id === authorId);

  const isAuthor = user?.id === authorId;
  const hasUpvoted = post.upvotes?.includes(user?.id);
  const parsedDate = !isNaN(Number(post.date_created)) ? Number(post.date_created) : post.date_created;
  const timeAgo = post.date_created ? formatDistanceToNow(new Date(parsedDate), { addSuffix: true }) : 'Recently';

  // State for menu and inline edit
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [editType, setEditType] = useState(post.type || 'update');
  const [saving, setSaving] = useState(false);

  const menuRef = useRef(null);

  // Click outside menu listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return toast.error('Content is required');

    setSaving(true);
    try {
      await api.put(`/api/posts/${post.id}`, {
        id: post.id,
        user_id: user?.id,
        title: editTitle.trim() || editContent.substring(0, 60),
        content: editContent.trim(),
        type: editType
      });
      toast.success('Post updated! 🚀');
      setIsEditing(false);
      fetchPosts(); // Refetch to sync state
    } catch (err) {
      console.error(err);
      toast.error('Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!window.confirm('Are you absolutely sure you want to delete this post?')) return;

    try {
      await api.delete(`/api/posts/${post.id}`, {
        data: {
          id: post.id,
          user_id: user?.id
        }
      });
      toast.success('Post deleted successfully.');
      fetchPosts(); // Refetch to sync state
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete post.');
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all overflow-hidden shadow-sm hover:shadow-md">
      {post.resolved && (
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-3 pointer-events-none">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-semibold shadow">
            <CheckCircle2 size={13} />
            Resolved
          </div>
        </div>
      )}

      <div className={`p-5 ${post.resolved ? 'opacity-70' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${authorId}`} className="relative">
              <img
                src={getAvatarUrl(author.avatar_img, author.name)}
                alt={author.name}
                onError={(e) => handleAvatarError(e, author.name)}
                className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-800 object-cover bg-gray-200 flex-shrink-0 hover:ring-2 hover:ring-indigo-400 transition"
              />
              <div className="absolute bottom-0 right-0 transform translate-x-0.5 translate-y-0.5">
                <PresenceDot isOnline={isOnline} />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/profile/${authorId}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {author.name}
                </Link>
                <span className="text-gray-400 dark:text-gray-600 text-xs">·</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TypeBadge type={isEditing ? editType : post.type} />
              </div>
            </div>
          </div>

          {/* Three Dot Menu Ellipsis */}
          {isAuthor && !isEditing && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <MoreVertical size={16} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-36 glass rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden z-20"
                  >
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Pencil size={13} />
                        Edit Post
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete Post
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content & Form Overlay */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-3 mb-4">
            {/* Edit Type Grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {['update', 'question', 'bug', 'milestone'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEditType(t)}
                  className={`py-1 px-2 rounded-xl text-[10px] font-bold border capitalize transition-all ${
                    editType === t
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t === 'bug' ? 'Bug Report' : t}
                </button>
              ))}
            </div>

            {/* Edit Title */}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title (Optional)"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 focus:border-indigo-450 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            />

            {/* Edit Content */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your content..."
              rows={3}
              required
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 focus:border-indigo-450 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none"
            />

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(post.title || '');
                  setEditContent(post.content || '');
                  setEditType(post.type || 'update');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <X size={12} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !editContent.trim()}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-indigo-650 text-white text-xs font-semibold hover:bg-indigo-600 disabled:opacity-40"
              >
                {saving ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                Save
              </button>
            </div>
          </form>
        ) : (
          <div>
            {post.title && post.title !== post.content.substring(0, 60) && (
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5">
                {post.title}
              </h3>
            )}
            <p className={`text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap ${compact ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-50 dark:border-gray-800">
          {/* Upvote Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleUpvote(post.id, user?.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              hasUpvoted
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <motion.div
              animate={{ scale: hasUpvoted ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUp size={15} className={hasUpvoted ? 'fill-current' : ''} />
            </motion.div>
            <span>{post.upvotesCount || 0}</span>
          </motion.button>

          {/* Comment Button */}
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageCircle size={15} />
            <span>{post.commentsCount || 0}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
