const express = require('express')
const {getComment, createComment, updateComment, deleteComment} = require('../controllers/commentController.js')

const router = express.Router()

router.get("/comment/:id", getComment)
router.post("/comment", createComment)
router.put("/comment/:id", updateComment)
router.delete("/comment/:id", deleteComment)

module.exports = router