import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import usePostStore from '../store/postStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addPost = usePostStore((s) => s.addPost);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('update');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Content is required');

    setLoading(true);
    try {
      await addPost({
        user_id: user?.id,
        title: title.trim() || content.substring(0, 60),
        content: content.trim(),
        type: type
      });
      toast.success('Post created successfully! 🚀');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/feed"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create a Post</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Share an update, ask a question, or report a bug.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Post Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'update', label: 'Update' },
                { value: 'question', label: 'Question' },
                { value: 'bug', label: 'Bug Report' },
                { value: 'milestone', label: 'Milestone' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-2 px-3 rounded-2xl text-sm font-semibold border transition-all ${
                    type === opt.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a descriptive title..."
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-indigo-400 dark:focus:border-indigo-600 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share? Write in Markdown or plain text..."
              rows={6}
              required
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 focus:border-indigo-400 dark:focus:border-indigo-600 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/feed"
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              Cancel
            </Link>
            <motion.button
              type="submit"
              disabled={loading || !content.trim()}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Publish Post
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
