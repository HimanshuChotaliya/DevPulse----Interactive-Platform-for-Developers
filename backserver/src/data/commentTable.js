
const pool = require("../config/db.js")

const createCommentTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  date_created TIMESTAMP DEFAULT NOW()
);
    
`;  
    try{
        await pool.query(queryText);
        console.log("Post table created if not exist")
    }catch(error){
        console.log("something unexpected happened",error)

    }    

    }
module.exports = createCommentTable