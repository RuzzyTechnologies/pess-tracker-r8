const jwt = require("jsonwebtoken")
const db = require("../config/database")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

// Verify JWT token middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Get fresh user data from database
    const result = await db.query(
      "SELECT id, email, role, first_name, last_name, created_at FROM users WHERE id = $1",
      [decoded.id],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

// Admin only middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

// Check if user is admin
function isAdmin(email) {
  const adminEmails = ["admin@acme.org", "admin@ngo.org", "admin@freelance.org"]
  return adminEmails.includes(email.toLowerCase())
}

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  isAdmin,
}
