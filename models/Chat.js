const db = require("../config/database")

class Chat {
  static async createThread(threadData) {
    const { name, type, createdBy, participants } = threadData

    return await db.transaction(async (client) => {
      // Create thread
      const threadResult = await client.query(
        "INSERT INTO chat_threads (name, type, created_by) VALUES ($1, $2, $3) RETURNING *",
        [name, type, createdBy],
      )

      const thread = threadResult.rows[0]

      // Add participants
      if (participants && participants.length > 0) {
        const participantValues = participants.map((userId, index) => `($1, $${index + 2})`).join(", ")
        const participantParams = [thread.id, ...participants]

        await client.query(
          `INSERT INTO chat_participants (thread_id, user_id) VALUES ${participantValues}`,
          participantParams,
        )
      }

      return thread
    })
  }

  static async findThreadById(id) {
    const result = await db.query(
      `SELECT ct.*, 
              u.first_name || ' ' || u.last_name as created_by_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', cp_users.id,
                    'email', cp_users.email,
                    'name', cp_users.first_name || ' ' || cp_users.last_name
                  )
                ) FILTER (WHERE cp_users.id IS NOT NULL), 
                '[]'
              ) as participants
       FROM chat_threads ct
       LEFT JOIN users u ON ct.created_by = u.id
       LEFT JOIN chat_participants cp ON ct.id = cp.thread_id AND cp.left_at IS NULL
       LEFT JOIN users cp_users ON cp.user_id = cp_users.id
       WHERE ct.id = $1 AND ct.is_active = true
       GROUP BY ct.id, u.first_name, u.last_name`,
      [id],
    )
    return result.rows[0]
  }

  static async findThreadsByUser(userId) {
    const result = await db.query(
      `SELECT DISTINCT ct.*, 
              u.first_name || ' ' || u.last_name as created_by_name,
              (SELECT COUNT(*) FROM chat_messages cm WHERE cm.thread_id = ct.id) as message_count,
              (SELECT cm.content FROM chat_messages cm WHERE cm.thread_id = ct.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
              (SELECT cm.created_at FROM chat_messages cm WHERE cm.thread_id = ct.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_at
       FROM chat_threads ct
       LEFT JOIN users u ON ct.created_by = u.id
       INNER JOIN chat_participants cp ON ct.id = cp.thread_id
       WHERE cp.user_id = $1 AND cp.left_at IS NULL AND ct.is_active = true
       ORDER BY last_message_at DESC NULLS LAST, ct.created_at DESC`,
      [userId],
    )
    return result.rows
  }

  static async addMessage(messageData) {
    const { threadId, senderId, content, messageType, fileUrl, fileName, fileSize } = messageData

    const result = await db.query(
      `INSERT INTO chat_messages (thread_id, sender_id, content, message_type, file_url, file_name, file_size) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [threadId, senderId, content, messageType, fileUrl, fileName, fileSize],
    )

    return result.rows[0]
  }

  static async getMessages(threadId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT cm.*, 
              u.first_name || ' ' || u.last_name as sender_name,
              u.avatar_url as sender_avatar
       FROM chat_messages cm
       LEFT JOIN users u ON cm.sender_id = u.id
       WHERE cm.thread_id = $1 AND cm.is_deleted = false
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [threadId, limit, offset],
    )
    return result.rows.reverse()
  }

  static async deleteMessage(messageId, deletedBy) {
    const result = await db.query(
      `UPDATE chat_messages 
       SET is_deleted = true, deleted_by = $2, deleted_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [messageId, deletedBy],
    )
    return result.rows[0]
  }

  static async deleteThread(threadId) {
    const result = await db.query("UPDATE chat_threads SET is_active = false WHERE id = $1 RETURNING *", [threadId])
    return result.rows[0]
  }

  static async removeParticipant(threadId, userId) {
    const result = await db.query(
      "UPDATE chat_participants SET left_at = NOW() WHERE thread_id = $1 AND user_id = $2 RETURNING *",
      [threadId, userId],
    )
    return result.rows[0]
  }

  static async addParticipant(threadId, userId) {
    const result = await db.query(
      `INSERT INTO chat_participants (thread_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (thread_id, user_id) 
       DO UPDATE SET left_at = NULL, joined_at = NOW()
       RETURNING *`,
      [threadId, userId],
    )
    return result.rows[0]
  }
}

module.exports = Chat
