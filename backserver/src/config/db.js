const { Pool } = require("pg")
const dotenv = require("dotenv")
const path = require("path")

dotenv.config({ path: path.resolve(__dirname, "../../.env") })

const isInternalRailway = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway.internal");

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            host: process.env.DB_HOST || "localhost",
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        }
)

module.exports = pool