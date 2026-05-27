const pool = require('../config/db.js')


const getUpvoteService = async () =>{
    result = await pool.query("SELECT * FROM  upvotes");
    return result.rows
}

const createUpvoteService = async (user_id,post_id ) =>{
    result = await pool.query("INSERT INTO upvotes (user_id,post_id ) VALUES ($1, $2) RETURNING *", [user_id,post_id ]);
    return result.rows[0]
}

const deleteUpvoteService = async (id) =>{
    result = await pool.query("DELETE FROM upvotes WHERE id=$1 RETURNING *", [id]);
    return result.rows[0]
}

const getUpvoteByPostIdService = async (post_id) => {
    const result = await pool.query("SELECT * FROM upvotes WHERE post_id=$1", [post_id]);
    return result.rows;
}

const getUpvoteCountByPostIdService = async (post_id) => {
    const result = await pool.query("SELECT COUNT(*) FROM upvotes WHERE post_id=$1", [post_id]);
    return parseInt(result.rows[0].count, 10);
}

const getUpvoteByUserAndPostService = async (user_id, post_id) => {
    const result = await pool.query("SELECT * FROM upvotes WHERE user_id=$1 AND post_id=$2", [user_id, post_id]);
    return result.rows[0] || null;
}

const deleteUpvoteByUserAndPostService = async (user_id, post_id) => {
    const result = await pool.query("DELETE FROM upvotes WHERE user_id=$1 AND post_id=$2 RETURNING *", [user_id, post_id]);
    return result.rows[0];
}

module.exports = {
    getUpvoteService,
    createUpvoteService,
    deleteUpvoteService,
    getUpvoteByPostIdService,
    getUpvoteCountByPostIdService,
    getUpvoteByUserAndPostService,
    deleteUpvoteByUserAndPostService
}