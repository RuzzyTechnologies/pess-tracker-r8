const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const db = require("../config/database")
const router = express.Router()

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query

    let query = `
      SELECT id, title, message, type, is_read, action_url, created_at
      FROM notifications 
      WHERE user_id = $1
    `
    const params = [req.user.id]

    if (unreadOnly === "true") {
      query += " AND is_read = false"
    }

    query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    params.push(Number.parseInt(limit), (Number.parseInt(page) - 1) * Number.parseInt(limit))

    const result = await db.query(query, params)

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM notifications WHERE user_id = $1"
    const countParams = [req.user.id]

    if (unreadOnly === "true") {
      countQuery += " AND is_read = false"
      countParams.push(false)
    }

    const countResult = await db.query(countQuery, countParams)
    const totalCount = Number.parseInt(countResult.rows[0].count)

    res.json({
      notifications: result.rows,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalNotifications: totalCount,
        hasNext: Number.parseInt(page) * Number.parseInt(limit) < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ error: "Failed to get notifications" })
  }
})

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" })
    }

    res.json({
      message: "Notification marked as read",
      notification: result.rows[0],
    })
  } catch (error) {
    console.error("Mark notification read error:", error)
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [req.user.id])

    res.json({
      message: "All notifications marked as read",
      updatedCount: result.rowCount,
    })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    res.status(500).json({ error: "Failed to mark all notifications as read" })
  }
})

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query("DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id", [
      id,
      req.user.id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" })
    }

    res.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({ error: "Failed to delete notification" })
  }
})

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false", [
      req.user.id,
    ])

    res.json({ unreadCount: Number.parseInt(result.rows[0].count) })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({ error: "Failed to get unread count" })
  }
})

module.exports = router
