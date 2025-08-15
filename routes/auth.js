const express = require("express")
const rateLimit = require("express-rate-limit")
const User = require("../models/User")
const { generateToken, authenticateToken, isAdmin } = require("../middleware/auth")
const router = express.Router()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later" },
})

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 signup attempts per hour
  message: { error: "Too many signup attempts, please try again later" },
})

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", signupLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName, confirmPassword } = req.body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" })
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" })
    }

    // Determine role based on email
    const role = isAdmin(email) ? "admin" : "staff"

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
    })

    // Generate token
    const token = generateToken(user)

    // Update last login
    await User.updateLastLogin(user.id)

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Failed to create user" })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = await User.findByEmail(email.toLowerCase())
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" })
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate token
    const token = generateToken(user)

    // Update last login
    await User.updateLastLogin(user.id)

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        lastLogin: user.last_login,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
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
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to get user profile" })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required" })
    }

    const updates = {
      first_name: firstName,
      last_name: lastName,
    }

    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl
    }

    const updatedUser = await User.updateProfile(req.user.id, updates)

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      message: "Profile updated successfully",
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
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put("/password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All password fields are required" })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" })
    }

    // Get user with password hash
    const user = await User.findByEmail(req.user.email)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword)

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Failed to change password" })
  }
})

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "User not found or inactive" })
    }

    const token = generateToken(user)

    res.json({
      message: "Token refreshed successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({ error: "Failed to refresh token" })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authenticateToken, (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage. This endpoint exists for
  // consistency and potential future server-side token blacklisting.
  res.json({ message: "Logout successful" })
})

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role,
    },
  })
})

module.exports = router
