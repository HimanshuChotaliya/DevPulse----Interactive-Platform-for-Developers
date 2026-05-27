import useAuthStore from '../store/authStore';
import usePostStore from '../store/postStore';
import useUserStore from '../store/userStore';

let ws = null;
let reconnectTimeout = null;

export const connectSocket = () => {
  const user = useAuthStore.getState().user;
  const token = useAuthStore.getState().token;

  if (!user?.id) {
    if (ws) ws.close();
    return;
  }

  // Close existing socket if any
  if (ws) {
    ws.close();
  }

  const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token || ''}&user_id=${user.id}`;
  console.log("[WebSocket] Connecting to", wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[WebSocket] Connected successfully ✅");
    // Sync initial states
    useUserStore.getState().fetchOnlineUsers();
    usePostStore.getState().fetchPosts();
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("[WebSocket] Received event:", message);

      // Dispatch custom event for local pages/components (like PostDetail)
      window.dispatchEvent(new CustomEvent('devpulse_ws_event', { detail: message }));

      const { type, payload } = message;

      switch (type) {
        case 'USER_ONLINE':
          if (payload && payload.user_id) {
            useUserStore.getState().setOnline({
              user_id: payload.user_id,
              name: payload.name || 'User',
              avatar_img: payload.avatar_img || '',
              role: payload.role || 'Member'
            });
            useUserStore.getState().fetchOnlineUsers();
          }
          break;
        case 'USER_OFFLINE':
          if (payload && payload.user_id) {
            useUserStore.getState().setOffline(payload.user_id);
            useUserStore.getState().fetchOnlineUsers();
          }
          break;
        case 'NEW_POST':
          if (payload) {
            usePostStore.getState().prependPost(payload);
          }
          break;
        case 'UPDATED_POST':
        case 'DELETED_POST':
          usePostStore.getState().fetchPosts();
          break;
        case 'NEW_UPVOTE':
          if (payload && payload.post_id) {
            usePostStore.getState().incrementUpvoteCount(payload.post_id, payload.upvote?.user_id);
          }
          break;
        case 'DELETE_UPVOTE':
          usePostStore.getState().fetchPosts();
          break;
        case 'NEW_COMMENT':
          if (payload && payload.post_id) {
            usePostStore.getState().incrementCommentCount(payload.post_id);
          }
          break;
        case 'UPDATED_COMMENT':
        case 'DELETED_COMMENT':
          usePostStore.getState().fetchPosts();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("[WebSocket] Error processing message:", err);
    }
  };

  ws.onerror = (err) => {
    console.error("[WebSocket] Connection error:", err);
  };

  ws.onclose = () => {
    console.log("[WebSocket] Connection closed");
    ws = null;
    
    // Auto-reconnect if user is still logged in
    if (useAuthStore.getState().user?.id) {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        connectSocket();
      }, 3000);
    }
  };
};

export const disconnectSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
};
