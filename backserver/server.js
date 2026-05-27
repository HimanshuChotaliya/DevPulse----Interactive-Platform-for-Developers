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

// Routes
const userRoutes = require('./src/routes/user.js')
const postRoutes = require('./src/routes/post.js')
const authRoutes = require('./src/routes/auth.js')
const presenceRoutes = require('./src/routes/presence.js')

// Middlewares
const errorhandling = require('./src/middlewares/errorhandler.js')

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


const path = require("path")
dotenv.config({ path: path.resolve(__dirname, ".env") })
const app = express()
const server = http.createServer(app)   

const port = process.env.PORT || 5000;

// Middlewares
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://dev-pulse-interactive-platform-for.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
            return callback(null, true);
        }
        return callback(new Error("CORS policy violation"), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Handle OPTIONS preflight explicitly for all routes in Express 5 using a regex literal

// Routes
const authMiddleware = require('./src/middlewares/auth.js')

app.use('/api/auth',     authRoutes) // Public routes (login & register)
app.use('/api/users',    authMiddleware, userRoutes)
app.use('/api/posts',    authMiddleware, postRoutes)
app.use('/api/presence', authMiddleware, presenceRoutes)


// Error handling Middleware is moved to the end


// Testing db connection
app.get("/", async (req,res) => {
    console.log("Start")
    const result = await pool.query("SELECT * FROM users")
    console.log("end")
    res.send(`The database name is: ${result.rows[0].current_database}`)
} )

const startServer = async () => {
    // 1. Create/verify database tables sequentially to satisfy foreign key constraints
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

    // Error handling Middleware
    app.use(errorhandling);

    server.listen(port, () => {
        console.log(`Server is running on port ${port} and GraphQL on /graphql`);
    });
};

startServer();