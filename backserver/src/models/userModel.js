const pool = require('../config/db.js')

 const getAllUsersService = async () => {
    const result = await pool.query("SELECT * FROM users");
    return result.rows
}

 const getUserByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0]
}

const getUserByEmailService = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0]
}


 const createUserService = async (name, email, password, avatar_img, role) => {
    const result = await pool.query("INSERT INTO users (name, email, password, avatar_img, role) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, email, password, avatar_img, role]);
    return result.rows[0]
}

 const updateUserService = async (name, email, password, avatar_img, role, id) => {
    const result = await pool.query("UPDATE users SET name=$1, email=$2, password=$3, avatar_img=$4, role=$5 WHERE id=$6 RETURNING *", [name, email, password, avatar_img, role, id]);
    return result.rows[0]
}

const updateUserProfileService = async (id, name, avatar_img, role) => {
    const result = await pool.query(
        "UPDATE users SET name=$1, avatar_img=$2, role=$3 WHERE id=$4 RETURNING id, name, email, avatar_img, role, date_created",
        [name, avatar_img, role, id]
    );
    return result.rows[0];
}

 const deleteUserService = async (id) => {
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [id]);
    return result.rows[0]
}

module.exports = {
    getAllUsersService,
    getUserByIdService,
    createUserService,
    updateUserService,
    updateUserProfileService,
    deleteUserService,
    getUserByEmailService
}
