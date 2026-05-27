const { markUserActiveService, markUserInactiveService, getOnlineUsersService } = require('../models/presenceModel');
const { getUserByIdService } = require('../models/userModel');

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
};

const markActive = async (req, res, next) => {
    const { user_id } = req.body;
    try {
        if (!user_id) return handleResponse(res, 400, "user_id is required");
        const user = await getUserByIdService(user_id);
        if (!user) return handleResponse(res, 404, "User not found");
        
        const presence = await markUserActiveService(user_id);
        handleResponse(res, 200, "User marked active", presence);
    } catch (error) {
        next(error);
    }
};

const markInactive = async (req, res, next) => {
    const { user_id } = req.body;
    try {
        if (!user_id) return handleResponse(res, 400, "user_id is required");
        const presence = await markUserInactiveService(user_id);
        handleResponse(res, 200, "User marked inactive", presence);
    } catch (error) {
        next(error);
    }
};

const getOnlineUsers = async (req, res, next) => {
    try {
        const users = await getOnlineUsersService();
        handleResponse(res, 200, "Online users fetched successfully", users);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markActive,
    markInactive,
    getOnlineUsers
};
