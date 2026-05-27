const express = require('express')
const {getAllUsers, getUser, createUser, updateUser, updateProfile, deleteUser} = require('../controllers/userController.js')

const router = express.Router()

router.get("/", getAllUsers)
router.get("/:id", getUser)
router.post("/", createUser)
router.patch("/:id/profile", updateProfile)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)

module.exports = router
