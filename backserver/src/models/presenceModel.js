const pool = require('../config/db.js');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const markUserActiveService = async (userId) => {
    if (!userId || !uuidRegex.test(userId)) {
        console.warn(`[Presence] Skipping DB insert: '${userId}' is not a valid UUID.`);
        return { user_id: userId, last_active: new Date() };
    }
    const result = await pool.query(
        `INSERT INTO presence (user_id, last_active) 
         VALUES ($1, NOW()) 
         ON CONFLICT (user_id) 
         DO UPDATE SET last_active = NOW() RETURNING *`,
         [userId]
    );
    return result.rows[0];
};

const markUserInactiveService = async (userId) => {
    if (!userId || !uuidRegex.test(userId)) {
        console.warn(`[Presence] Skipping DB delete: '${userId}' is not a valid UUID.`);
        return { user_id: userId };
    }
    const result = await pool.query(
        `DELETE FROM presence WHERE user_id = $1 RETURNING *`,
        [userId]
    );
    return result.rows[0];
};

const getOnlineUsersService = async () => {
    const result = await pool.query(
        `SELECT p.user_id, p.last_active, u.name, u.avatar_img, u.role
         FROM presence p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.last_active DESC`
    );
    return result.rows;
};

module.exports = {
    markUserActiveService,
    markUserInactiveService,
    getOnlineUsersService
};
