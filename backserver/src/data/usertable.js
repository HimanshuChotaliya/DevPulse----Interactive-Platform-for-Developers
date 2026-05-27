const pool = require("../config/db.js")

const createUserTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  avatar_img VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'viewer',
  date_created TIMESTAMP DEFAULT NOW()
)
    `;
    try{
        await pool.query(queryText);
        console.log("User table created if not exist")
    }catch(error){
        console.log("something unexpected happened",error)

    }    

    }
module.exports = createUserTable