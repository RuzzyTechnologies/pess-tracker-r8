const db = require("../config/database")
const bcrypt = require("bcrypt")

class User {
  static async create(userData) {
    const { email, password, firstName, lastName, role = "staff" } = userData
    const passwordHash = await bcrypt.hash(password, 10)

    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, passwordHash, firstName, lastName, role],
    )

    return result.rows[0]
  }

  static async findByEmail(email) {
    const result = await db.query(
      "SELECT id, email, password_hash, first_name, last_name, role, avatar_url, is_active, last_login, created_at FROM users WHERE email = $1",
      [email],
    )
    return result.rows[0]
  }

  static async findById(id) {
    const result = await db.query(
      "SELECT id, email, first_name, last_name, role, avatar_url, is_active, last_login, created_at FROM users WHERE id = $1",
      [id],
    )
    return result.rows[0]
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT id, email, first_name, last_name, role, avatar_url, is_active, last_login, created_at 
      FROM users WHERE 1=1
    `
    const params = []

    if (filters.role) {
      params.push(filters.role)
      query += ` AND role = $${params.length}`
    }

    if (filters.isActive !== undefined) {
      params.push(filters.isActive)
      query += ` AND is_active = $${params.length}`
    }

    query += " ORDER BY created_at DESC"

    const result = await db.query(query, params)
    return result.rows
  }

  static async updateLastLogin(id) {
    await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [id])
  }

  static async updateProfile(id, updates) {
    const fields = []
    const params = []
    let paramCount = 1

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        params.push(updates[key])
        paramCount++
      }
    })

    if (fields.length === 0) return null

    params.push(id)
    const query = `
      UPDATE users SET ${fields.join(", ")}, updated_at = NOW() 
      WHERE id = $${paramCount} 
      RETURNING id, email, first_name, last_name, role, avatar_url, is_active
    `

    const result = await db.query(query, params)
    return result.rows[0]
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await db.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, id])
  }

  static async delete(id) {
    const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING id", [id])
    return result.rows[0]
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
  }
}

module.exports = User
