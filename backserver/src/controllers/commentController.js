const {getCommentService,createCommentService,updateCommentService,deleteCommentService,getCommentByIdService} = require('../models/commentModel.js')
const {getUserByIdService} = require('../models/userModel.js')
const {getPostByIdService} = require('../models/postModel.js')
const {getCommentByPostIdService} = require('../models/commentModel.js')
const { safeClient: client, redisPublisher } = require("../config/redis")


const handleResponse = (res, status, message, data= null)=> {
    res.status(status).json({
        status,
        message,
        data
    })
 
}

const getComment = async (req, res, next) => {
    
    try{
        const comments = await getCommentService();
        handleResponse(res, 200, "Comments fetched successfully", comments)
    }
    catch(error){
        next(error)
    }
}



const createComment = async (req, res, next) => {
    try{
        const {user_id, post_id, comment, is_solution}= req.body;
        const user = await getUserByIdService(user_id);
        if(!user) return handleResponse(res, 404, "User not found")

        const post = await getPostByIdService(post_id);
        if(!post) return handleResponse(res, 404, "Post not found")
            
        const newComment = await createCommentService(user_id, post_id, comment, is_solution);
        await client.del("feed:all")                 // comment_count changed in feed
        await client.del(`comments:${post_id}`)
        await redisPublisher.publish("devpulse_events", JSON.stringify({
        type: "NEW_COMMENT",
        payload: newComment
        }))
        handleResponse(res, 201, "Comment created successfully", newComment)
    }
    catch(error){
        next(error)
    }
}

const updateComment = async (req, res, next) => {
    try{
        const {id, user_id, post_id, comment, is_solution}= req.body;

        const user = await getUserByIdService(user_id);
        if(!user) return handleResponse(res, 404, "User not found")

        const post = await getPostByIdService(post_id);
        if(!post) return handleResponse(res, 404, "Post not found")
            
        const comment_present  = await getCommentByIdService(id);
        if(!comment_present) return handleResponse(res, 404, "Comment not found")
        if(comment_present.user_id !== user_id) return handleResponse(res, 403, "You are not authorized to update this comment")    
        const updatedComment = await updateCommentService(id, comment, is_solution);
        await client.del(`comments:${post_id}`)
        await redisPublisher.publish("devpulse_events", JSON.stringify({
        type: "UPDATED_COMMENT",
        payload: updatedComment
        }))
        handleResponse(res, 200, "Comment updated successfully", updatedComment)
    }
    catch(error){
        next(error)
    }
}

const deleteComment = async (req, res, next) => {
    try{
        const {id, user_id, post_id}= req.body;
        const user = await getUserByIdService(user_id);
        if(!user) return handleResponse(res, 404, "User not found")

        const post = await getPostByIdService(post_id);
        if(!post) return handleResponse(res, 404, "Post not found")
            
        const comment_present  = await getCommentByIdService(id);
        if(!comment_present) return handleResponse(res, 404, "Comment not found")
        if(comment_present.user_id !== user_id) return handleResponse(res, 403, "You are not authorized to delete this comment")    
        const deletedComment = await deleteCommentService(id);
        await client.del("feed:all")                 // comment_count changed in feed
        await client.del(`comments:${post_id}`)
        await redisPublisher.publish("devpulse_events", JSON.stringify({
        type: "DELETED_COMMENT",
        payload: comment_present
        }))
        handleResponse(res, 200, "Comment deleted successfully", deletedComment)
    }
    catch(error){
        next(error)
    }
}

module.exports = {
    getComment,
    createComment,
    updateComment,
    deleteComment
}
