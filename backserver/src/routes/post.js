const express = require('express')
const {getAllPosts, getPostbyId, createPost, updatePost, deletePost} = require('../controllers/postController.js')
const {getUpvote, toggleUpvote, deleteUpvote} = require('../controllers/upvotesController.js')
const {getComment, createComment, updateComment, deleteComment} = require('../controllers/commentController.js')

const router = express.Router()

// Posts
router.get("/", getAllPosts);
router.get("/:id", getPostbyId);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

// Upvotes — toggle is the primary action frontend uses
router.post("/upvote", toggleUpvote);       // POST with { user_id, post_id } → adds or removes
router.delete("/upvote", deleteUpvote);     // explicit DELETE with { user_id, post_id } in body

// Comments
router.post("/comments", createComment);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

module.exports = router