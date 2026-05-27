// Standardized Response function
const {getAllPostServiceRest, getPostByIdService, createPostService, updatePostService, deletePostService} = require('../models/postModel')
const {getUserByIdService} = require("../models/userModel.js")
const { safeClient: client, redisPublisher } = require('../config/redis.js')

const handleResponse = (res, status, message, data= null)=> {
    res.status(status).json({
        status,
        message,
        data
    })
 
}

// Get all posts
const getAllPosts = async (req, res, next) => {
    try {
        const posts = await getAllPostService()
        handleResponse(res, 200, "Posts fetched successfully", posts)
    } catch (error){
        next(error)
    }
}

// Get post by ID
const getPostbyId = async (req, res, next) => {
    const {id} = req.params;
    try {
        const post = await getPostByIdService(id);
        if(!post) return handleResponse(res, 404, "Post not found")
        handleResponse(res, 200, "Post fetched successfully", post)
    } catch (error) {
        next(error)
    }
}

// Create Post
 const createPost = async (req, res, next) => {
    const {user_id, content, type, status} = req.body;
    const title = req.body.title || content.substring(0, 60);
    try {
        const user = await getUserByIdService(user_id);
        if(!user) return handleResponse(res, 404, "User not found")
            
        const newPost = await createPostService(user_id, title, content, type);
        await client.del("feed:all")                 // comment_count changed in feed
        
        await redisPublisher.publish("devpulse_events", JSON.stringify({
        type: "NEW_POST",
        payload: newPost
        }))

        handleResponse(res, 201, "Post created successfully", newPost)
    } catch (error) {
        next(error)
    }
}

// Update Post
 const updatePost = async (req, res, next) => {
    const {id,user_id,title,content, type} = req.body;
    try {
        // check if the post author is editing the post or not using user_id
        const user = await getUserByIdService(user_id);
        if(!user) return handleResponse(res, 404, "User not found")

        const post = await getPostByIdService(id);
        if(!post) return handleResponse(res, 404, "Post not found")
        if(post.user_id !== user_id) return handleResponse(res, 403, "You are not authorized to edit this post")
        
        const updatedPost = await updatePostService(id, title, content, type);
        await client.del("feed:all")                 // comment_count changed in feed
        await client.del(`post:${id}`)
        await redisPublisher.publish("devpulse_events", JSON.stringify({
        type: "UPDATED_POST",
        payload: updatedPost
        }))
        if(!updatedPost) return handleResponse(res, 404, "Post not found")
        handleResponse(res, 200, "Post updated successfully", updatedPost)
    } catch (error) {
        next(error)
    }
}

// Delete Post
 const deletePost = async (req, res, next) => {
    
    const { id ,user_id } = req.body;
    
    try {
        // check if the post author is deleting the post or not using user_id
        const post = await getPostByIdService(id);
        if(!post) return handleResponse(res, 404, "Post not found")
        if(post.user_id !== user_id) return handleResponse(res, 403, "You are not authorized to delete this post")
        
        const deletedPost = await deletePostService(id);
        await client.del("feed:all")                 // comment_count changed in feed
        await client.del(`post:${id}`)
        await redisPublisher.publish("devpulse_events", JSON.stringify({
        type: "DELETED_POST",
        payload: post
        }))
        handleResponse(res, 200, "Post deleted successfully", deletedPost)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllPosts,
    getPostbyId,
    createPost,
    updatePost,
    deletePost
}