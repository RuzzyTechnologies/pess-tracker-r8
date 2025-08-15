const express = require("express")
const User = require("../models/User")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const router = express.Router()

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, isActive } = req.query

    const filters = {}
    if (role) filters.role = role
    if (isActive !== undefined) filters.isActive = isActive === "true"

    const users = await User.findAll(filters)

    res.json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
      })),
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to get users" })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Users can only view their own profile unless they're admin
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ error: "Access denied" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Failed to get user" })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, role, isActive, avatarUrl } = req.body

    // Prevent admin from deactivating themselves
    if (id === req.user.id && isActive === false) {
      return res.status(400).json({ error: "Cannot deactivate your own account" })
    }

    const updates = {}
    if (firstName !== undefined) updates.first_name = firstName
    if (lastName !== undefined) updates.last_name = lastName
    if (role !== undefined) updates.role = role
    if (isActive !== undefined) updates.is_active = isActive
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl

    const updatedUser = await User.updateProfile(id, updates)

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatar_url,
        isActive: updatedUser.is_active,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" })
    }

    const deletedUser = await User.delete(id)

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (admin only)
// @access  Private (Admin)
router.get("/stats/overview", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allUsers = await User.findAll()
    const activeUsers = allUsers.filter((user) => user.is_active)
    const adminUsers = allUsers.filter((user) => user.role === "admin")
    const staffUsers = allUsers.filter((user) => user.role === "staff")

    res.json({
      stats: {
        total: allUsers.length,
        active: activeUsers.length,
        inactive: allUsers.length - activeUsers.length,
        admins: adminUsers.length,
        staff: staffUsers.length,
      },
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({ error: "Failed to get user statistics" })
  }
})

module.exports = router
