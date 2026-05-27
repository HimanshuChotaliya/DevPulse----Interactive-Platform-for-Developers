
const pool = require("../config/db.js")

const createUpvoteTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  date_created TIMESTAMP DEFAULT NOW(),

  UNIQUE (user_id, post_id)
);
    
`;  
        try{
            await pool.query(queryText);
            console.log("Upvote table created if not exist")
        }catch(error){
            console.log("something unexpected happened",error)

        }    

        }
module.exports = createUpvoteTable