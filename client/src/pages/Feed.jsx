import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Sparkles, Plus } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const GET_FEED = gql`
  query GetFeed {
    getFeed {
      posts {
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
      totalCount
    }
  }
`;

export default function Feed() {
  const { data, loading, error, refetch } = useQuery(GET_FEED, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const handleWSEvent = (e) => {
      const { type } = e.detail;
      if (['NEW_POST', 'UPDATED_POST', 'DELETED_POST', 'NEW_UPVOTE', 'DELETE_UPVOTE'].includes(type)) {
        refetch();
      }
    };
    window.addEventListener('devpulse_ws_event', handleWSEvent);
    return () => window.removeEventListener('devpulse_ws_event', handleWSEvent);
  }, [refetch]);

  const posts = data?.getFeed?.posts || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Welcome */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Feed <span className="text-gradient">🌊</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay in sync with your team's updates, questions, and decisions.
          </p>
        </div>
        <Link
          to="/create-post"
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20"
        >
          <Plus size={16} />
          Create Post
        </Link>
      </div>

      {/* Feed */}
      {loading && posts.length === 0 ? (
        <LoadingSkeleton count={4} />
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-medium">
          Failed to load feed. Please try again later.
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-5">
            <Inbox size={36} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nothing here yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
            Be the first to share an update, ask a question, or log a decision with your team.
          </p>
          <Link
            to="/create-post"
            className="mt-5 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
          >
            <Sparkles size={16} />
            Write your first post now!
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                layout
              >
                <PostCard post={post} compact />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
