import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function CommentCard({ comment, onMarkSolution, onRefresh, postId }) {
  const user = useAuthStore((s) => s.user);
  
  const author = comment.author || { name: 'Unknown', avatar_img: '' };
  const authorId = comment.user_id || author.id;
  const isAuthor = user?.id === authorId;

  const parsedDate = !isNaN(Number(comment.date_created)) ? Number(comment.date_created) : comment.date_created;
  const timeAgo = comment.date_created ? formatDistanceToNow(new Date(parsedDate), { addSuffix: true }) : 'just now';

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCommentText, setEditCommentText] = useState(comment.comment || '');
  const [saving, setSaving] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editCommentText.trim()) return toast.error('Comment text is required');

    setSaving(true);
    try {
      await api.put(`/api/posts/comments/${comment.id}`, {
        id: comment.id,
        user_id: user?.id,
        post_id: comment.post_id || postId,
        comment: editCommentText.trim(),
        is_solution: comment.is_solution || false
      });
      toast.success('Comment updated! 🚀');
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update comment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async () => {
    setShowMenu(false);
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/api/posts/comments/${comment.id}`, {
        data: {
          id: comment.id,
          user_id: user?.id,
          post_id: comment.post_id || postId
        }
      });
      toast.success('Comment deleted.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete comment.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 p-4 rounded-2xl border transition-colors ${
        comment.is_solution
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
      }`}
    >
      <img
        src={author.avatar_img || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
        alt={author.name}
        className="w-9 h-9 rounded-full object-cover bg-gray-200 flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${authorId}`}
              className="font-semibold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {author.name}
            </Link>
            <span className="text-xs text-gray-400 dark:text-gray-600">{timeAgo}</span>
            {comment.is_solution && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} />
                Solution
              </span>
            )}
          </div>

          {isAuthor && !isEditing && (
            <div className="relative ml-auto flex items-center" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <MoreVertical size={14} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-6 w-32 glass rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden z-20"
                  >
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Pencil size={11} />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteComment}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateComment} className="space-y-2 mt-2">
            <textarea
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              placeholder="Edit your comment..."
              rows={2}
              required
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 focus:border-indigo-450 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditCommentText(comment.comment || '');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[11px] font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <X size={11} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !editCommentText.trim()}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 disabled:opacity-40"
              >
                {saving ? (
                  <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={11} />
                )}
                Save
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
        )}
      </div>

      {onMarkSolution && !isEditing && (
        <button
          onClick={() => onMarkSolution(comment.id)}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            comment.is_solution
              ? 'bg-green-500 text-white shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'
          }`}
          title={comment.is_solution ? 'Unmark solution' : 'Mark as solution'}
        >
          <CheckCircle2 size={16} />
        </button>
      )}
    </motion.div>
  );
}
