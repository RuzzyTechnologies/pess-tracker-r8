const { Pool } = require("pg")

// Use the same connection string that works with psql
const connectionString =
  "postgresql://neondb_owner:npg_ibsPCj43pkWz@ep-shy-meadow-ad83igyf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // longer timeout
})

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    console.log("✅ Database connection test successful:", result.rows[0])
    client.release()
    return true
  } catch (error) {
    console.error("❌ Database connection test failed:", error)
    throw error
  }
}

async function query(text, params) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
}
