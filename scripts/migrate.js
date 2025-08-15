const fs = require("fs")
const path = require("path")
const db = require("../config/database")

async function runMigrations() {
  try {
    console.log("Starting database migrations...")

    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Get list of executed migrations
    const executedResult = await db.query("SELECT filename FROM migrations")
    const executedMigrations = executedResult.rows.map((row) => row.filename)

    // Read migration files
    const migrationsDir = path.join(__dirname, "../migrations")
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    // Execute pending migrations
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        console.log(`Executing migration: ${filename}`)

        const filePath = path.join(migrationsDir, filename)
        const sql = fs.readFileSync(filePath, "utf8")

        await db.query(sql)
        await db.query("INSERT INTO migrations (filename) VALUES ($1)", [filename])

        console.log(`Migration ${filename} completed successfully`)
      } else {
        console.log(`Migration ${filename} already executed, skipping`)
      }
    }

    console.log("All migrations completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().then(() => {
    console.log("Migration script completed")
    process.exit(0)
  })
}

module.exports = { runMigrations }
