// Standardized Response function
const {getAllUsersService, getUserByIdService, createUserService, updateUserService, updateUserProfileService, deleteUserService, getUserByEmailService} = require('../models/userModel')
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const handleResponse = (res, status, message, data= null)=> {
    res.status(status).json({
        status,
        message,
        data
    })
 
}

// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService()
        handleResponse(res, 200, "Users fetched successfully", users)
    } catch (error){
        next(error)
    }
}

// Get user by ID
const getUser = async (req, res, next) => {
    const {id} = req.params;
    try {
        const user = await getUserByIdService(id);
        if(!user) return handleResponse(res, 404, "User not found")
        handleResponse(res, 200, "User fetched successfully", user)
    } catch (error) {
        next(error)
    }
}

// Create User
 const createUser = async (req, res, next) => {
    const {name, email, password, avatar_img, role} = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password,salt, async(err, hash) => {
             try {
                 const newUsers = await createUserService(name, email, hash, avatar_img, role);
                 const token = jwt.sign(
                 { email: newUsers.email, id: newUsers.id }, 
                 process.env.JWT_SECRET, 
                 { expiresIn: '7d' }
             );

             // Set HttpOnly cookie
             res.cookie('token', token, {
                 httpOnly: true,
                 secure: process.env.NODE_ENV === 'production',
                 sameSite: 'lax',
                 maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
             });

         // Send user info and token back to frontend
         handleResponse(res, 201, "Registered successfully", { user: newUsers, token })
            } catch (error) {
                next(error)
            }

        })
    })
   
}

const loginUser = async (req, res, next) => {
    const {email, password} = req.body
    try {
        const user = await getUserByEmailService(email);
        if(!user) return handleResponse(res, 404, "Invalid credentials")
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return handleResponse(res, 401, "Invalid credentials")

        // Generate JWT Token
        const token = jwt.sign(
            { email: user.email, id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Set HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send user info and token back to frontend
        handleResponse(res, 200, "Logged in successfully", { user, token })
        
    } catch (error) {
        next(error)
    }    
}

// Update User Profile (lightweight â€” name, avatar_img, role)
const updateProfile = async (req, res, next) => {
    const { id } = req.params;
    const { name, avatar_img, role } = req.body;
    try {
        const updatedUser = await updateUserProfileService(id, name, avatar_img, role);
        if (!updatedUser) return handleResponse(res, 404, "User not found")
        handleResponse(res, 200, "Profile updated successfully", updatedUser)
    } catch (error) {
        next(error)
    }
}

// Update User
 const updateUser = async (req, res, next) => {
    const {name, email, password, avatar_img, role,id} = req.body;
    try {
        const updatedUsers = await updateUserService(name, email, password, avatar_img, role, id);
        if(!updatedUsers) return handleResponse(res, 404, "User not found")
        handleResponse(res, 200, "Users updated successfully", updatedUsers)
    } catch (error) {
        next(error)
    }
}

// Delete User
 const deleteUser = async (req, res, next) => {
    const {id} = req.params;
    try {
        const user = await getUserByIdService(id);
        if(!user) return handleResponse(res, 404, "User not found")
        if(user.id !== id) return handleResponse(res, 403, "You are not authorized to delete this user")
        
        const deletedUsers = await deleteUserService(id);
        handleResponse(res, 200, "Users deleted successfully", deletedUsers)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    updateProfile,
    deleteUser,
    loginUser
}

