import { create } from 'zustand';
import api from '../api/axios.js';

const useUserStore = create((set, get) => ({
  onlineUsers: [],
  loading: false,

  fetchOnlineUsers: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/api/presence');
      set({ onlineUsers: response.data.data, loading: false });
    } catch (err) {
      console.error("Error fetching online users:", err);
      set({ loading: false });
    }
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  setOnline: (user) => {
    set((state) => {
      if (state.onlineUsers.some((u) => u.user_id === user.user_id)) return state;
      return { onlineUsers: [user, ...state.onlineUsers] };
    });
  },

  setOffline: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u.user_id !== userId),
    }));
  },

  markActive: async (userId) => {
    try {
      await api.post('/api/presence', { user_id: userId });
      get().fetchOnlineUsers();
    } catch (err) {
      console.error("Error marking user active:", err);
    }
  },

  markInactive: async (userId) => {
    try {
      await api.delete('/api/presence', { data: { user_id: userId } });
      get().fetchOnlineUsers();
    } catch (err) {
      console.error("Error marking user inactive:", err);
    }
  },
}));

export default useUserStore;
