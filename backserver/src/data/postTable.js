const pool = require("../config/db.js")

const createPostTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR NOT NULL,
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
module.exports = createPostTable