import { MOCK_USERS } from './data.js';

const WS_COMMENT_TEMPLATES = [
  'Great point! I totally agree with this approach.',
  'Have you considered using a different strategy here?',
  'This looks solid. Nice work! 🎉',
  'I can help with this — let\'s sync up tomorrow.',
  'We had a similar issue last sprint. The fix was straightforward.',
  'Love this update! The team has been waiting for this.',
  '👍 Approved from my end.',
  'Can you add more context? Would love to understand the tradeoffs.',
  'This unblocks us on the auth side. Thanks!',
  'Adding this to the sprint review notes.',
];

export function createMockWebSocket(onNewComment, onPresenceChange) {
  let commentInterval = null;
  let presenceInterval = null;
  let connected = false;

  function connect() {
    connected = true;

    // Simulate new comments arriving every 8–15 seconds
    commentInterval = setInterval(() => {
      if (!connected) return;
      const randomUserIndex = Math.floor(Math.random() * MOCK_USERS.length);
      const randomUser = MOCK_USERS[randomUserIndex];
      const randomTemplate = WS_COMMENT_TEMPLATES[Math.floor(Math.random() * WS_COMMENT_TEMPLATES.length)];

      if (onNewComment) {
        onNewComment({
          id: `ws-c-${Date.now()}`,
          authorId: randomUser.id,
          author: randomUser,
          content: randomTemplate,
          isSolution: false,
          createdAt: new Date().toISOString(),
        });
      }
    }, Math.floor(Math.random() * 7000) + 8000);

    // Simulate user presence changes every 10–20 seconds
    presenceInterval = setInterval(() => {
      if (!connected) return;
      const allUsers = [...MOCK_USERS];
      // Pick a random subset (4-8) of online users
      const count = Math.floor(Math.random() * 5) + 4;
      const shuffled = allUsers.sort(() => Math.random() - 0.5).slice(0, count);

      if (onPresenceChange) {
        onPresenceChange(shuffled);
      }
    }, Math.floor(Math.random() * 10000) + 10000);
  }

  function disconnect() {
    connected = false;
    clearInterval(commentInterval);
    clearInterval(presenceInterval);
  }

  // Initial connection with slight delay
  setTimeout(connect, 500);

  return { disconnect, isConnected: () => connected };
}
