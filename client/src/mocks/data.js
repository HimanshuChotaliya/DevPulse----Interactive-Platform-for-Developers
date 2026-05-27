// Mock Users
export const MOCK_USERS = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@devpulse.io', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', joinedAt: '2023-06-15T10:00:00Z' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@devpulse.io', role: 'Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', joinedAt: '2023-07-20T09:00:00Z' },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@devpulse.io', role: 'Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', joinedAt: '2023-05-10T08:00:00Z' },
  { id: 'u4', name: 'Sam Chen', email: 'sam@devpulse.io', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', joinedAt: '2023-08-01T11:00:00Z' },
  { id: 'u5', name: 'Mia Torres', email: 'mia@devpulse.io', role: 'Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', joinedAt: '2023-09-05T14:00:00Z' },
  { id: 'u6', name: 'Chris Park', email: 'chris@devpulse.io', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris', joinedAt: '2023-10-12T10:00:00Z' },
  { id: 'u7', name: 'Dana Wilson', email: 'dana@devpulse.io', role: 'Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana', joinedAt: '2023-04-22T09:00:00Z' },
  { id: 'u8', name: 'Ryan Patel', email: 'ryan@devpulse.io', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan', joinedAt: '2023-11-08T13:00:00Z' },
  { id: 'u9', name: 'Luna Kim', email: 'luna@devpulse.io', role: 'Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', joinedAt: '2023-12-01T10:00:00Z' },
  { id: 'u10', name: 'Ethan Brooks', email: 'ethan@devpulse.io', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan', joinedAt: '2024-01-15T09:00:00Z' },
];

const now = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const MOCK_POSTS = [
  {
    id: 'p1', authorId: 'u1', type: 'update', status: 'working', resolved: false,
    content: 'Just pushed the new authentication module to staging. All OAuth flows are working with the Google and GitHub providers. Will start on the email/password flow next.',
    image: null, upvotes: ['u2', 'u3', 'u5'], commentCount: 4,
    createdAt: minsAgo(25),
  },
  {
    id: 'p2', authorId: 'u3', type: 'decision', status: 'done', resolved: false,
    content: 'After reviewing the options, we\'ve decided to go with PostgreSQL for our primary database. The team agreed on using Prisma as our ORM for better TypeScript support and migration management.',
    image: null, upvotes: ['u1', 'u2', 'u4', 'u6', 'u7'], commentCount: 8,
    createdAt: hoursAgo(2),
  },
  {
    id: 'p3', authorId: 'u4', type: 'blocker', status: 'blocked', resolved: false,
    content: '🚨 Blocker: The CI pipeline is failing on the test suite for the payments module. Error is intermittent but happening ~60% of the time. Need someone with AWS access to check the environment variables.',
    image: null, upvotes: ['u1', 'u3', 'u7'], commentCount: 6,
    createdAt: hoursAgo(3),
  },
  {
    id: 'p4', authorId: 'u2', type: 'question', status: 'working', resolved: true,
    content: 'What\'s our preferred approach for handling dark mode? Should we use CSS variables + class toggling, or go with Tailwind\'s built-in dark: variant? Would love input from the frontend folks.',
    image: null, upvotes: ['u1', 'u5', 'u6'], commentCount: 5,
    createdAt: hoursAgo(5),
  },
  {
    id: 'p5', authorId: 'u6', type: 'update', status: 'done', resolved: false,
    content: 'Completed the redesign of the dashboard analytics section. New charts are interactive with drill-down capability. Reduced bundle size by 23% using dynamic imports for chart components.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    upvotes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u7', 'u8'], commentCount: 12,
    createdAt: hoursAgo(8),
  },
  {
    id: 'p6', authorId: 'u7', type: 'decision', status: 'done', resolved: false,
    content: 'Sprint 14 planning done. Focus areas: (1) Complete user onboarding flow, (2) Performance optimization pass, (3) Accessibility audit and fixes. Velocity target: 42 story points.',
    image: null, upvotes: ['u1', 'u2', 'u4', 'u6'], commentCount: 3,
    createdAt: hoursAgo(12),
  },
  {
    id: 'p7', authorId: 'u5', type: 'update', status: 'working', resolved: false,
    content: 'Working on the new design system tokens in Figma. Creating a comprehensive color palette with 11 shades per color, spacing scale, and typography system. Should be ready for dev handoff by EOD.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    upvotes: ['u2', 'u3', 'u6', 'u9'], commentCount: 2,
    createdAt: hoursAgo(14),
  },
  {
    id: 'p8', authorId: 'u8', type: 'question', status: 'working', resolved: false,
    content: 'Has anyone integrated with the Stripe Connect API for marketplace payments? Struggling with the webhook verification in a serverless environment. Any patterns or examples would be super helpful!',
    image: null, upvotes: ['u4', 'u6', 'u10'], commentCount: 7,
    createdAt: hoursAgo(18),
  },
  {
    id: 'p9', authorId: 'u1', type: 'update', status: 'done', resolved: false,
    content: 'Finished implementing real-time notifications using Server-Sent Events. Notification delivery latency is under 200ms. Tested with 500 concurrent connections with no issues.',
    image: null, upvotes: ['u2', 'u3', 'u4', 'u5', 'u7', 'u9'], commentCount: 5,
    createdAt: daysAgo(1),
  },
  {
    id: 'p10', authorId: 'u3', type: 'blocker', status: 'blocked', resolved: true,
    content: 'RESOLVED: The production deployment was blocked due to a memory leak in the WebSocket handler. Found and fixed the issue — was missing cleanup in the useEffect hook. Deployed successfully.',
    image: null, upvotes: ['u1', 'u2', 'u4', 'u6', 'u8', 'u10'], commentCount: 9,
    createdAt: daysAgo(1),
  },
  {
    id: 'p11', authorId: 'u9', type: 'update', status: 'working', resolved: false,
    content: 'Started on the mobile app redesign. New navigation pattern based on user research showing 73% of users preferred bottom tabs. Prototypes are in Figma for review.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
    upvotes: ['u2', 'u5', 'u7'], commentCount: 4,
    createdAt: daysAgo(2),
  },
  {
    id: 'p12', authorId: 'u10', type: 'question', status: 'working', resolved: false,
    content: 'Best practices for handling optimistic updates with React Query? I\'m running into edge cases where the cache gets out of sync when a mutation fails after the UI has already updated.',
    image: null, upvotes: ['u1', 'u4', 'u6', 'u8'], commentCount: 6,
    createdAt: daysAgo(2),
  },
  {
    id: 'p13', authorId: 'u4', type: 'decision', status: 'done', resolved: false,
    content: 'Architecture decision: We\'re switching to a microservices architecture for the notifications, billing, and analytics services. API Gateway will handle routing. Expected completion: Q2.',
    image: null, upvotes: ['u1', 'u3', 'u7', 'u10'], commentCount: 11,
    createdAt: daysAgo(3),
  },
  {
    id: 'p14', authorId: 'u2', type: 'update', status: 'done', resolved: false,
    content: 'Component library v2.0 is live on npm! 47 new components, full dark mode support, WCAG 2.1 AA compliance, and Storybook docs. Thanks to everyone who contributed!',
    image: null, upvotes: ['u1', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10'], commentCount: 15,
    createdAt: daysAgo(4),
  },
  {
    id: 'p15', authorId: 'u6', type: 'blocker', status: 'blocked', resolved: false,
    content: 'API rate limiting is hitting us harder than expected in the dev environment. We\'re getting 429s from the third-party geocoding service during integration tests. Need a mock or higher tier.',
    image: null, upvotes: ['u1', 'u4', 'u8'], commentCount: 3,
    createdAt: daysAgo(5),
  },
];

export const MOCK_COMMENTS = {
  p1: [
    { id: 'c1a', postId: 'p1', authorId: 'u2', content: 'Great work! Did you add rate limiting to the OAuth endpoints?', createdAt: minsAgo(20), isSolution: false },
    { id: 'c1b', postId: 'p1', authorId: 'u3', content: 'Looks good. Make sure to handle token refresh edge cases.', createdAt: minsAgo(15), isSolution: false },
    { id: 'c1c', postId: 'p1', authorId: 'u1', content: 'Yes, using express-rate-limit with Redis backing. 10 req/min per IP.', createdAt: minsAgo(10), isSolution: false },
    { id: 'c1d', postId: 'p1', authorId: 'u4', content: 'Perfect, that should handle most abuse cases.', createdAt: minsAgo(5), isSolution: false },
  ],
  p2: [
    { id: 'c2a', postId: 'p2', authorId: 'u1', content: 'Totally agree on Prisma. The type safety is a game changer.', createdAt: hoursAgo(1.8), isSolution: false },
    { id: 'c2b', postId: 'p2', authorId: 'u4', content: 'Any concerns about Prisma performance at scale?', createdAt: hoursAgo(1.5), isSolution: false },
    { id: 'c2c', postId: 'p2', authorId: 'u3', content: 'We\'ve done benchmarks up to 10k RPS with connection pooling — it holds up well.', createdAt: hoursAgo(1.2), isSolution: true },
  ],
  p3: [
    { id: 'c3a', postId: 'p3', authorId: 'u1', content: 'I have AWS access, looking into it now.', createdAt: hoursAgo(2.9), isSolution: false },
    { id: 'c3b', postId: 'p3', authorId: 'u7', content: 'Adding this to critical blockers in Jira. P1 priority.', createdAt: hoursAgo(2.7), isSolution: false },
    { id: 'c3c', postId: 'p3', authorId: 'u1', content: 'Found it — PAYMENT_SECRET was missing from the Lambda env vars. Adding now.', createdAt: hoursAgo(2.5), isSolution: true },
  ],
  p4: [
    { id: 'c4a', postId: 'p4', authorId: 'u1', content: 'CSS variables + Tailwind dark: both work well. For a component library I\'d go CSS vars.', createdAt: hoursAgo(4.5), isSolution: false },
    { id: 'c4b', postId: 'p4', authorId: 'u6', content: 'We went with Tailwind dark: class strategy and it\'s been clean. Single source of truth in tailwind.config.js.', createdAt: hoursAgo(4), isSolution: true },
  ],
  p5: [],
  p8: [
    { id: 'c8a', postId: 'p8', authorId: 'u4', content: 'Use the stripe.webhooks.constructEvent() with the raw body — don\'t parse it as JSON first!', createdAt: hoursAgo(17), isSolution: false },
    { id: 'c8b', postId: 'p8', authorId: 'u6', content: 'For serverless, make sure to set bodyParser: false for the webhook route specifically.', createdAt: hoursAgo(16), isSolution: true },
  ],
};

// Generate activity data for heatmap (last 365 days)
export function generateActivityData(userId) {
  const data = {};
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    // Generate random activity with higher probability on recent days
    const roll = Math.random();
    if (roll > 0.65) {
      data[dateStr] = Math.floor(Math.random() * 6) + 1;
    } else {
      data[dateStr] = 0;
    }
  }
  return data;
}
