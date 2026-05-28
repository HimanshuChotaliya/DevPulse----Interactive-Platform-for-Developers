const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('verbatim');
}

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const pool = require('./src/config/db.js')
const cookieParser = require('cookie-parser')
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const typeDefs = require('./src/graphql/typeDefs');
const resolvers = require('./src/graphql/resolvers');

const path = require("path")
dotenv.config({ path: path.resolve(__dirname, ".env") })

// Routes
const userRoutes = require('./src/routes/user.js')
const postRoutes = require('./src/routes/post.js')
const authRoutes = require('./src/routes/auth.js')
const presenceRoutes = require('./src/routes/presence.js')

// Middlewares
const errorhandling = require('./src/middlewares/errorhandler.js')
const authMiddleware = require('./src/middlewares/auth.js')

// Database Tables
const createUserTable = require('./src/data/usertable.js')
const createPostTable = require('./src/data/postTable.js')
const createCommentTable = require('./src/data/commentTable.js')
const createUpvoteTable = require('./src/data/upvoteTable.js')
const createPresenceTable = require('./src/data/presenceTable.js')

// Websockets and Redis
const http = require("http")
const setupWebSocket = require("./src/sockets")
const { connectRedis } = require("./src/config/redis")

const app = express()
const server = http.createServer(app)

const port = process.env.PORT || 5000;

// CORS config
const allowedOrigins = [
  'https://dev-pulse-interactive-platform-for.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// ✅ CORS must be first — before all other middlewares and routes
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/users',    authMiddleware, userRoutes)
app.use('/api/posts',    authMiddleware, postRoutes)
app.use('/api/presence', authMiddleware, presenceRoutes)

// Test route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()")
    res.send(`DB connected: ${result.rows[0].current_database}`)
  } catch (err) {
    res.status(500).send(`DB error: ${err.message}`)
  }
})

const startServer = async () => {
  console.log('DB URL:', process.env.DATABASE_URL);

  try {
    await createUserTable();
    await createPostTable();
    await createCommentTable();
    await createUpvoteTable();
    await createPresenceTable();
    console.log("Database tables verified/created sequentially ✅");
  } catch (err) {
    console.error("Critical: Database table creation failed:", err);
  }

  await connectRedis();

  setupWebSocket(server);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();

  app.use('/graphql', authMiddleware, express.json(), expressMiddleware(apolloServer));

  // Error handling must be last
  app.use(errorhandling);

  server.listen(port, () => {
    console.log(`Server is running on port ${port} and GraphQL on /graphql`);
  });
};

startServer();