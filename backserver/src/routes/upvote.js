const express = require('express')
const {getUpvote,createUpvote,deleteUpvote} = require('../controllers/upvotesController.js')

const router = express.Router()

router.get("/upvotes", getUpvote)
router.post("/upvotes", createUpvote)
router.delete("/upvotes/:id", deleteUpvote)

module.exports = router