const {getUserByIdService} = require('../models/userModel')
const {getAllPostService} = require('../models/postModel')
const {getCommentbyPostId} = require('../controllers/commentController')
const {getUpvoteByPostId} = require('../controllers/upvotesController')
const handleResponse = (res, status, message, data= null)=> {
    res.status(status).json({
        status,
        message,
        data
    })
 
}

const getFeed = async(req, res, next) => {
    try {
        const posts = await getAllPostService()
        const response = []
        const commentsArray = []
        const upvoteArray = []
        for (const post of posts){
            const userId = post.user_id
            const user = await getUserByIdService(userId)
            const comments = await getCommentbyPostId(post.id)
            const upvotes = await getUpvoteByPostId(post.id)
            for (const comment of comments){
                const comment_user = await getUserByIdService(comment.user_id)
                commentsArray.push({
                    comment: comment.comment,
                    comment_user: comment_user.name,
                    comment_avatar_img: comment_user.avatar_img
                })
            }
            for (const upvote of upvotes){
                const upvote_user = await getUserByIdService(upvote.user_id)
                upvoteArray.push({
                    upvote: upvote.upvote,
                    upvote_user: upvote_user.name,
                    upvote_avatar_img: upvote_user.avatar_img
                })
            }
            response.push({
                title: post.title,
                content: post.content,
                type: post.type,
                createdAt: post.createdAt,
                name: user.name,
                avatar_img: user.avatar_img,
                comments: commentsArray

            })
        }
        handleResponse(res, 200, "Feed fetched successfully", response)
    } catch(error) {
        next(error)
    }
}

module.exports = { getFeed }