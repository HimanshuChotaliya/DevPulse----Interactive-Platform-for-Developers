const pool = require('../config/db.js')


const getCommentService = async () =>{
    result = await pool.query("SELECT * FROM  comments");
    return result.rows
}

const createCommentService = async (user_id,post_id , comment, is_solution ) =>{
    result = await pool.query("INSERT INTO comments (user_id,post_id , comment, is_solution ) VALUES ($1, $2, $3, $4) RETURNING *", [user_id,post_id , comment, is_solution ]);
    return result.rows[0]
}

const updateCommentService = async (id, comment, is_solution ) =>{
    result = await pool.query("UPDATE comments SET comment=$1, is_solution=$2 WHERE id=$3 RETURNING *", [comment, is_solution, id]);
    return result.rows[0]
}

const deleteCommentService = async (id) =>{
    result = await pool.query("DELETE FROM comments WHERE id=$1 RETURNING *", [id]);
    return result.rows[0]
}

const getCommentByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM comments WHERE id=$1", [id]);
    return result.rows[0];
}

const getCommentByPostIdService = async (post_id) => {
    const result = await pool.query("SELECT * FROM comments WHERE post_id=$1", [post_id]);
    return result.rows;
}

const getCommentCountByPostIdService = async (post_id) => {
    const result = await pool.query("SELECT COUNT(*) FROM comments WHERE post_id=$1", [post_id]);
    return parseInt(result.rows[0].count, 10);
}

module.exports = {
    getCommentService,
    createCommentService,
    updateCommentService,
    deleteCommentService,
    getCommentByIdService,
    getCommentByPostIdService,
    getCommentCountByPostIdService
}