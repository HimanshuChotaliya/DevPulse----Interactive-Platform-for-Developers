const pool = require("../config/db.js");

const createPresenceTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS presence (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        last_active TIMESTAMP DEFAULT NOW()
    );
    `;
    try {
        await pool.query(queryText);
        await pool.query("DELETE FROM presence");
        console.log("Presence table created and cleared on startup");
    } catch(error) {
        console.log("Something unexpected happened while creating presence table", error);
    }
}

module.exports = createPresenceTable;
