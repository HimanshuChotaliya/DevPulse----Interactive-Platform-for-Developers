const pool = require('../config/db.js')

const getAllPostService = async () => {
    const result = await pool.query(`
        SELECT 
            p.id,
            p.title,
            p.content,
            p.type,
            p.date_created,
            p.user_id,
            u.name AS author,
            COUNT(DISTINCT uv.id)::int AS upvote_count,
            COUNT(DISTINCT c.id)::int AS comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN upvotes uv ON uv.post_id = p.id
        LEFT JOIN comments c ON c.post_id = p.id
        GROUP BY p.id, u.name
        ORDER BY p.date_created DESC
    `)
    return result.rows
}

 const getAllPostServiceRest = async () => {
    const result = await pool.query("SELECT * FROM posts");
    return result.rows
}

 const getPostByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    return result.rows[0]
}

const getUserIdbyPostIdService = async (id) => {
    const result = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    return result.rows[0]
}

 const createPostService = async (user_id,title, content, type) => {
    const result = await pool.query("INSERT INTO posts (user_id, title,content, type) VALUES ($1, $2, $3,$4) RETURNING *", [user_id,title, content, type]);
    return result.rows[0]
}

 const updatePostService = async (id,title, content, type) => {
    const result = await pool.query("UPDATE posts SET title=$1,content=$2, type=$3 WHERE id=$4 RETURNING *", [title,content, type, id]);
    return result.rows[0]
}

 const deletePostService = async (id) => {
    const result = await pool.query("DELETE FROM posts WHERE id=$1 RETURNING *", [id]);
    return result.rows[0]
}


module.exports = {
    getAllPostService,
    getAllPostServiceRest,
    getPostByIdService,
    createPostService,
    updatePostService,
    deletePostService,
    getUserIdbyPostIdService
}