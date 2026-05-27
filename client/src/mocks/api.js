import { MOCK_USERS, MOCK_POSTS, MOCK_COMMENTS } from './data.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let postIdCounter = 100;
let commentIdCounter = 200;

// In-memory state
let postsState = [...MOCK_POSTS];
const commentsState = { ...MOCK_COMMENTS };

// Auth
export async function mockLogin(email, password) {
  await delay(500);
  const user = MOCK_USERS.find((u) => u.email === email) || MOCK_USERS[0];
  const token = `fake-jwt-token-${Date.now()}`;
  return { user, token };
}

export async function mockRegister(name, email, password, role) {
  await delay(500);
  const newUser = {
    id: `u${Date.now()}`,
    name,
    email,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    joinedAt: new Date().toISOString(),
  };
  const token = `fake-jwt-token-${Date.now()}`;
  return { user: newUser, token };
}

// Posts
export async function mockFetchPosts() {
  await delay(300);
  return postsState.map((post) => ({
    ...post,
    author: MOCK_USERS.find((u) => u.id === post.authorId) || MOCK_USERS[0],
  }));
}

export async function mockFetchPost(id) {
  await delay(200);
  const post = postsState.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');
  const comments = (commentsState[id] || []).map((c) => ({
    ...c,
    author: MOCK_USERS.find((u) => u.id === c.authorId) || MOCK_USERS[0],
  }));
  return {
    ...post,
    author: MOCK_USERS.find((u) => u.id === post.authorId) || MOCK_USERS[0],
    comments,
  };
}

export async function mockCreatePost({ type, status, content, image, authorId }) {
  await delay(400);
  const newPost = {
    id: `p${postIdCounter++}`,
    authorId,
    type,
    status,
    content,
    image: image || null,
    upvotes: [],
    commentCount: 0,
    resolved: false,
    createdAt: new Date().toISOString(),
  };
  postsState = [newPost, ...postsState];
  commentsState[newPost.id] = [];
  return {
    ...newPost,
    author: MOCK_USERS.find((u) => u.id === authorId) || MOCK_USERS[0],
  };
}

export async function mockAddComment(postId, content, authorId) {
  await delay(300);
  const newComment = {
    id: `c${commentIdCounter++}`,
    postId,
    authorId,
    content,
    isSolution: false,
    createdAt: new Date().toISOString(),
    author: MOCK_USERS.find((u) => u.id === authorId) || MOCK_USERS[0],
  };
  if (!commentsState[postId]) commentsState[postId] = [];
  commentsState[postId].push(newComment);
  // Update comment count in posts state
  postsState = postsState.map((p) =>
    p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
  );
  return newComment;
}

export function getPostsState() {
  return postsState;
}

export function resolvePost(postId) {
  postsState = postsState.map((p) =>
    p.id === postId ? { ...p, resolved: true } : p
  );
}
