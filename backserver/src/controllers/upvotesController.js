const {getUpvoteService, createUpvoteService, deleteUpvoteService, getUpvoteByUserAndPostService, deleteUpvoteByUserAndPostService} = require('../models/upvoteModel.js')
const {getUserByIdService} = require('../models/userModel.js')
const {getPostByIdService} = require('../models/postModel.js')
const { redisPublisher } = require("../config/redis")

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data })
}

const getUpvote = async (req, res, next) => {
    try {
        const upvotes = await getUpvoteService();
        handleResponse(res, 200, "Upvotes fetched successfully", upvotes)
    } catch (error) {
        next(error)
    }
}

// Toggle upvote: if already upvoted → remove, else → add
const toggleUpvote = async (req, res, next) => {
    try {
        const {user_id, post_id} = req.body;
        if (!user_id || !post_id) return handleResponse(res, 400, "user_id and post_id are required")

        const user = await getUserByIdService(user_id);
        if (!user) return handleResponse(res, 404, "User not found")

        const post = await getPostByIdService(post_id);
        if (!post) return handleResponse(res, 404, "Post not found")

        const existing = await getUpvoteByUserAndPostService(user_id, post_id);
        if (existing) {
            // Already upvoted — remove it
            await deleteUpvoteByUserAndPostService(user_id, post_id);
            await redisPublisher.publish("devpulse_events", JSON.stringify({
                type: "DELETE_UPVOTE",
                payload: { post_id, upvote: existing }
            }))
            return handleResponse(res, 200, "Upvote removed", { action: 'removed' })
        } else {
            // Not upvoted yet — add it
            const newUpvote = await createUpvoteService(user_id, post_id);
            await redisPublisher.publish("devpulse_events", JSON.stringify({
                type: "NEW_UPVOTE",
                payload: { post_id, upvote: newUpvote }
                }))
            return handleResponse(res, 201, "Upvote added", { action: 'added', upvote: newUpvote })
        }
    } catch (error) {
        next(error)
    }
}

const createUpvote = async (req, res, next) => {
    try {
        const {user_id, post_id} = req.body;
        const user = await getUserByIdService(user_id);
        if (!user) return handleResponse(res, 404, "User not found")

        const post = await getPostByIdService(post_id);
        if (!post) return handleResponse(res, 404, "Post not found")

        const newUpvote = await createUpvoteService(user_id, post_id);
        await redisPublisher.publish("devpulse_events", JSON.stringify({
            type: "NEW_UPVOTE",
            payload: { post_id, upvote: newUpvote }
        }))

        handleResponse(res, 201, "Upvote created successfully", newUpvote)
    } catch (error) {
        next(error)
    }
}

const deleteUpvote = async (req, res, next) => {
    try {
        const {user_id, post_id} = req.body;
        if (!user_id || !post_id) return handleResponse(res, 400, "user_id and post_id are required")

        const deletedUpvote = await deleteUpvoteByUserAndPostService(user_id, post_id);
        await redisPublisher.publish("devpulse_events", JSON.stringify({
            type: "DELETE_UPVOTE",
            payload: { post_id, upvote: deletedUpvote || { user_id, post_id } }
        }))
        if (!deletedUpvote) return handleResponse(res, 404, "Upvote not found")
        handleResponse(res, 200, "Upvote deleted successfully", deletedUpvote)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getUpvote,
    toggleUpvote,
    createUpvote,
    deleteUpvote
}
