import { create } from 'zustand';
import api from '../api/axios.js';
import useAuthStore from './authStore';

const usePostStore = create((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const query = `
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
      const response = await api.post('/graphql', { query });
      const posts = response.data.data.getFeed.posts;
      set({ posts, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  prependPost: (post) => {
    set((state) => {
      if (state.posts.some((p) => p.id === post.id)) return state;
      return { posts: [post, ...state.posts] };
    });
  },

  incrementCommentCount: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ),
    }));
  },

  incrementUpvoteCount: (postId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const hasUpvoted = p.upvotes?.includes(userId);
        return {
          ...p,
          upvotes: hasUpvoted ? p.upvotes.filter((id) => id !== userId) : [...(p.upvotes || []), userId],
          upvotesCount: hasUpvoted ? (p.upvotesCount || 1) - 1 : (p.upvotesCount || 0) + 1,
        };
      }),
    }));
  },

  toggleUpvote: async (postId, userId) => {
    get().incrementUpvoteCount(postId, userId);
    try {
      await api.post('/api/posts/upvote', { post_id: postId, user_id: userId });
    } catch (err) {
      console.error("Error toggling upvote:", err);
      get().fetchPosts();
    }
  },

  markResolved: async (postId) => {
    try {
      await api.put(`/api/posts/${postId}`, { resolved: true });
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, resolved: true } : p
        ),
      }));
    } catch (err) {
      console.error("Error resolving post:", err);
    }
  },

  addPost: async (postData) => {
    try {
      const response = await api.post('/api/posts', postData);
      const newPost = response.data.data;
      const currentUser = useAuthStore.getState().user;
      const postWithAuthor = { 
        ...newPost, 
        author: currentUser,
        upvotes: [],
        upvotesCount: 0,
        commentsCount: 0
      };
      get().prependPost(postWithAuthor);
      return postWithAuthor;
    } catch (err) {
      console.error("Error adding post:", err);
      throw err;
    }
  },
}));

export default usePostStore;
