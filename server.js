const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")
require("dotenv").config()

const db = require("./config/database")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const taskRoutes = require("./routes/tasks")
const chatRoutes = require("./routes/chats")
const notificationRoutes = require("./routes/notifications")
const settingsRoutes = require("./routes/settings")

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/settings", settingsRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-chat", (chatId) => {
    socket.join(`chat-${chatId}`)
    console.log(`User ${socket.id} joined chat ${chatId}`)
  })

  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat-${chatId}`)
    console.log(`User ${socket.id} left chat ${chatId}`)
  })

  socket.on("send-message", async (data) => {
    try {
      // Broadcast message to chat room
      socket.to(`chat-${data.chatId}`).emit("new-message", data)
    } catch (error) {
      console.error("Error sending message:", error)
      socket.emit("message-error", { error: "Failed to send message" })
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000

// Initialize database and start server
async function startServer() {
  try {
    await db.testConnection()
    console.log("Database connected successfully")

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

module.exports = { app, io }
