const db = require("../config/database")

class Task {
  static async create(taskData) {
    const { title, description, priority, status, projectId, assignedTo, assignedBy, dueDate } = taskData

    const result = await db.query(
      `INSERT INTO tasks (title, description, priority, status, project_id, assigned_to, assigned_by, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, description, priority, status, projectId, assignedTo, assignedBy, dueDate],
    )

    return result.rows[0]
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT t.*, 
              u1.first_name || ' ' || u1.last_name as assigned_to_name,
              u2.first_name || ' ' || u2.last_name as assigned_by_name,
              p.name as project_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.assigned_by = u2.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, 
             u1.first_name || ' ' || u1.last_name as assigned_to_name,
             u2.first_name || ' ' || u2.last_name as assigned_by_name,
             p.name as project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.assigned_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `
    const params = []

    if (filters.assignedTo) {
      params.push(filters.assignedTo)
      query += ` AND t.assigned_to = $${params.length}`
    }

    if (filters.assignedBy) {
      params.push(filters.assignedBy)
      query += ` AND t.assigned_by = $${params.length}`
    }

    if (filters.status) {
      params.push(filters.status)
      query += ` AND t.status = $${params.length}`
    }

    if (filters.priority) {
      params.push(filters.priority)
      query += ` AND t.priority = $${params.length}`
    }

    if (filters.projectId) {
      params.push(filters.projectId)
      query += ` AND t.project_id = $${params.length}`
    }

    query += " ORDER BY t.created_at DESC"

    const result = await db.query(query, params)
    return result.rows
  }

  static async update(id, updates) {
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
      UPDATE tasks SET ${fields.join(", ")}, updated_at = NOW() 
      WHERE id = $${paramCount} 
      RETURNING *
    `

    const result = await db.query(query, params)
    return result.rows[0]
  }

  static async delete(id) {
    const result = await db.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id])
    return result.rows[0]
  }

  static async getStats(filters = {}) {
    let query = "SELECT status, priority, COUNT(*) as count FROM tasks WHERE 1=1"
    const params = []

    if (filters.assignedTo) {
      params.push(filters.assignedTo)
      query += ` AND assigned_to = $${params.length}`
    }

    if (filters.assignedBy) {
      params.push(filters.assignedBy)
      query += ` AND assigned_by = $${params.length}`
    }

    query += " GROUP BY status, priority"

    const result = await db.query(query, params)
    return result.rows
  }
}

module.exports = Task
