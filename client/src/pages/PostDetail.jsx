import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import PostCard from '../components/PostCard';
import CommentCard from '../components/CommentCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../api/axios.js';
import useAuthStore from '../store/authStore';
import usePostStore from '../store/postStore';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar.js';

const GET_POST_DETAIL = gql`
  query GetPostDetail($id: ID!) {
    getPost(id: $id) {
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
        role
      }
    }
    getComments(post_id: $id) {
      id
      user_id
      post_id
      comment
      is_solution
      date_created
      author {
        id
        name
        avatar_img
      }
    }
  }
`;

export default function PostDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const markResolved = usePostStore((s) => s.markResolved);

  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef(null);

  const { data, loading, error, refetch } = useQuery(GET_POST_DETAIL, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const handleWSEvent = (e) => {
      const { type, payload } = e.detail;
      if (
        ((type === 'NEW_COMMENT' || type === 'UPDATED_COMMENT' || type === 'DELETED_COMMENT') && payload.post_id === id) ||
        ((type === 'UPDATED_POST' || type === 'DELETED_POST') && payload.id === id) ||
        ((type === 'NEW_UPVOTE' || type === 'DELETE_UPVOTE') && payload.post_id === id)
      ) {
        refetch();
      }
    };

    window.addEventListener('devpulse_ws_event', handleWSEvent);
    return () => window.removeEventListener('devpulse_ws_event', handleWSEvent);
  }, [id, refetch]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.getComments]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/api/posts/comments', {
        post_id: id,
        comment: commentText.trim(),
        user_id: user?.id,
        is_solution: false
      });
      setCommentText('');
      refetch();
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkSolution(commentId) {
    try {
      // Opt-in for REST update to toggle solution status
      const commentToToggle = data?.getComments?.find((c) => c.id === commentId);
      if (!commentToToggle) return;

      const isSolution = !commentToToggle.is_solution;

      await api.put(`/api/posts/comments/${commentId}`, {
        id: commentId,
        user_id: commentToToggle.user_id,
        post_id: id,
        comment: commentToToggle.comment,
        is_solution: isSolution
      });

      if (isSolution) {
        await markResolved(id);
        toast.success('Post marked as resolved! ✅');
      } else {
        toast.success('Solution status updated.');
      }
      
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark solution.');
    }
  }

  if (loading && !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <LoadingSkeleton count={1} />
        <div className="mt-4"><LoadingSkeleton count={2} /></div>
      </div>
    );
  }

  const post = data?.getPost;
  const comments = data?.getComments || [];

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">Post not found.</p>
        <Link to="/feed" className="text-indigo-600 mt-2 inline-block">← Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        to="/feed"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      {/* Post */}
      <PostCard post={post} compact={false} />

      {/* Comments section */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={18} className="text-indigo-500" />
            Comments ({comments.length})
          </h3>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 dark:text-gray-600 text-sm py-8"
              >
                No comments yet. Be the first to respond!
              </motion.p>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onMarkSolution={post.author?.id === user?.id ? handleMarkSolution : null}
                  onRefresh={refetch}
                />
              ))
            )}
          </AnimatePresence>
          <div ref={commentsEndRef} />
        </div>

        {/* Comment input */}
        <form onSubmit={handleAddComment} className="mt-4 flex gap-3 items-start">
            <img
              src={getAvatarUrl(user?.avatar_img, user?.name)}
              alt={user?.name}
              onError={(e) => handleAvatarError(e, user?.name)}
              className="w-9 h-9 rounded-full object-cover bg-gray-200 flex-shrink-0"
            />
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-colors">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(e);
              }}
            />
            <div className="flex justify-end px-3 pb-2">
              <motion.button
                type="submit"
                disabled={!commentText.trim() || submitting}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:bg-indigo-500 shadow-md shadow-indigo-500/10"
              >
                {submitting ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                Reply
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
