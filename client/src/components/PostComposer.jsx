import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Image, X, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import usePostStore from '../store/postStore';

const POST_TYPES = [
  { value: 'update',   label: '🔵 Update',   color: 'text-blue-600' },
  { value: 'question', label: '🟣 Question',  color: 'text-purple-600' },
  { value: 'decision', label: '🟡 Decision',  color: 'text-amber-600' },
  { value: 'blocker',  label: '🔴 Blocker',   color: 'text-red-600' },
];

const POST_STATUSES = [
  { value: 'working', label: '🟢 Working' },
  { value: 'blocked', label: '🔴 Blocked' },
  { value: 'done',    label: '⚫ Done'    },
];

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [type, setType] = useState('update');
  const [status, setStatus] = useState('working');
  const [imageUrl, setImageUrl] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const addPost = usePostStore((s) => s.addPost);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [content]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || isPosting) return;
    setIsPosting(true);

    try {
      await addPost({
        type,
        status,
        content: content.trim(),
        image: showImage && imageUrl.trim() ? imageUrl.trim() : null,
        user_id: user?.id,
      });
      setContent('');
      setImageUrl('');
      setShowImage(false);
      setType('update');
      setStatus('working');
      toast.success('Post shared with your team! 🎉');
    } catch (err) {
      toast.error('Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-5">
        <div className="flex gap-3">
          <img
            src={user?.avatar_img}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0 self-start mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening with your work? Share an update, ask a question..."
              className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm resize-none outline-none min-h-[44px] leading-relaxed"
              rows={1}
            />

            {/* Image URL input */}
            <AnimatePresence>
              {showImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="mt-2 rounded-xl max-h-40 object-cover w-full" onError={(e) => e.target.style.display = 'none'} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Type selector */}
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-3 pr-7 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                >
                  {POST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Status selector */}
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-3 pr-7 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                >
                  {POST_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Image toggle */}
              <button
                type="button"
                onClick={() => setShowImage((v) => !v)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  showImage
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
              >
                {showImage ? <X size={11} /> : <Image size={11} />}
                {showImage ? 'Remove Image' : 'Add Image'}
              </button>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!content.trim() || isPosting}
                whileTap={{ scale: 0.95 }}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl gradient-primary text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-sm hover:shadow-md"
              >
                {isPosting ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                {isPosting ? 'Posting...' : 'Share'}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
