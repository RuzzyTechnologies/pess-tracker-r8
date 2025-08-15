const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const db = require("../config/database")
const router = express.Router()

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM user_settings WHERE user_id = $1", [req.user.id])

    let settings = result.rows[0]

    // Create default settings if none exist
    if (!settings) {
      const defaultSettings = {
        user_id: req.user.id,
        email_notifications: true,
        push_notifications: true,
        task_reminders: true,
        chat_notifications: true,
        theme: "system",
        language: "en",
        timezone: "UTC",
      }

      const insertResult = await db.query(
        `INSERT INTO user_settings (user_id, email_notifications, push_notifications, task_reminders, chat_notifications, theme, language, timezone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          defaultSettings.user_id,
          defaultSettings.email_notifications,
          defaultSettings.push_notifications,
          defaultSettings.task_reminders,
          defaultSettings.chat_notifications,
          defaultSettings.theme,
          defaultSettings.language,
          defaultSettings.timezone,
        ],
      )

      settings = insertResult.rows[0]
    }

    res.json({
      settings: {
        id: settings.id,
        emailNotifications: settings.email_notifications,
        pushNotifications: settings.push_notifications,
        taskReminders: settings.task_reminders,
        chatNotifications: settings.chat_notifications,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      },
    })
  } catch (error) {
    console.error("Get settings error:", error)
    res.status(500).json({ error: "Failed to get settings" })
  }
})

// @route   PUT /api/settings
// @desc    Update user settings
// @access  Private
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, taskReminders, chatNotifications, theme, language, timezone } =
      req.body

    const updates = {}
    if (emailNotifications !== undefined) updates.email_notifications = emailNotifications
    if (pushNotifications !== undefined) updates.push_notifications = pushNotifications
    if (taskReminders !== undefined) updates.task_reminders = taskReminders
    if (chatNotifications !== undefined) updates.chat_notifications = chatNotifications
    if (theme !== undefined) updates.theme = theme
    if (language !== undefined) updates.language = language
    if (timezone !== undefined) updates.timezone = timezone

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No settings to update" })
    }

    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")
    const values = [req.user.id, ...Object.values(updates)]

    const result = await db.query(
      `UPDATE user_settings SET ${fields}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      values,
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Settings not found" })
    }

    const settings = result.rows[0]

    res.json({
      message: "Settings updated successfully",
      settings: {
        id: settings.id,
        emailNotifications: settings.email_notifications,
        pushNotifications: settings.push_notifications,
        taskReminders: settings.task_reminders,
        chatNotifications: settings.chat_notifications,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        updatedAt: settings.updated_at,
      },
    })
  } catch (error) {
    console.error("Update settings error:", error)
    res.status(500).json({ error: "Failed to update settings" })
  }
})

module.exports = router
