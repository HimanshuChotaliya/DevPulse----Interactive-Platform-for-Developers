const { getAllPostService, getPostByIdService } = require('../models/postModel');
const { getUserByIdService } = require('../models/userModel');
const { getCommentByPostIdService, getCommentCountByPostIdService } = require('../models/commentModel');
const { getUpvoteCountByPostIdService, getUpvoteByPostIdService } = require('../models/upvoteModel');
const { getOnlineUsersService } = require('../models/presenceModel');
const { safeClient: client } = require("../config/redis")

const resolvers = {
    Query: {
        getFeed: async (_, { limit, offset }) => {
            // 1. check cache
            const cached = await client.get("feed:all")
            if (cached) return JSON.parse(cached)

            // 2. fetch from DB
            const posts = await getAllPostService()
            const totalCount = posts.length

            let paginatedPosts = posts
            if (limit !== undefined && offset !== undefined) {
                paginatedPosts = posts.slice(offset, offset + limit)
            } else if (limit !== undefined) {
                paginatedPosts = posts.slice(0, limit)
            } else if (offset !== undefined) {
                paginatedPosts = posts.slice(offset)
            }

            const result = { posts: paginatedPosts, totalCount }

            // 3. store in cache
            await client.setEx("feed:all", 60, JSON.stringify(result))

            return result  // ← not result.rows
        },

        getPost: async (_, { id }) => {
            const cached = await client.get(`post:${id}`)
            if (cached) return JSON.parse(cached)

            const post = await getPostByIdService(id)
            await client.setEx(`post:${id}`, 60, JSON.stringify(post))
            return post
        },

        getComments: async (_, { post_id }) => {
            const cached = await client.get(`comments:${post_id}`)
            if (cached) return JSON.parse(cached)

            const comments = await getCommentByPostIdService(post_id)
            await client.setEx(`comments:${post_id}`, 60, JSON.stringify(comments))
            return comments
        },

        getUser: async (_, { id }) => {
            return await getUserByIdService(id)
        },

        getUserPosts: async (_, { user_id }) => {
            const allPosts = await getAllPostService()
            return allPosts.filter(post => post.user_id === user_id)
        },

        getOnlineUsers: async () => {
            return await getOnlineUsersService()  // no cache — real time
        }
    },
    Post: {
        author: async (parent) => {
            return await getUserByIdService(parent.user_id);
        },
        upvotesCount: async (parent) => {
            if (parent.upvote_count !== undefined) return parent.upvote_count;
            return await getUpvoteCountByPostIdService(parent.id);
        },
        commentsCount: async (parent) => {
            if (parent.comment_count !== undefined) return parent.comment_count;
            return await getCommentCountByPostIdService(parent.id);
        },
        upvotes: async (parent) => {
            const upvotes = await getUpvoteByPostIdService(parent.id);
            return upvotes.map(u => u.user_id);
        }
    }
}

module.exports = resolvers