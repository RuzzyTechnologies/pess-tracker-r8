const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
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

const corsOptions = {
  origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3000", "https://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
}

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

app.use(cors(corsOptions))
app.use(compression())
app.use(morgan("combined"))

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static("uploads"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/settings", settingsRoutes)

io.on("connection", (socket) => {
  console.log(`[v0] User connected: ${socket.id}`)

  // Join user to their personal room
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`)
    console.log(`[v0] User ${userId} joined personal room`)
  })

  // Join chat room
  socket.on("join-chat", (chatId) => {
    socket.join(`chat-${chatId}`)
    console.log(`[v0] User joined chat: ${chatId}`)
  })

  // Leave chat room
  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat-${chatId}`)
    console.log(`[v0] User left chat: ${chatId}`)
  })

  // Handle new messages
  socket.on("send-message", (data) => {
    socket.to(`chat-${data.chatId}`).emit("new-message", data)
  })

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(`chat-${data.chatId}`).emit("user-typing", data)
  })

  socket.on("stop-typing", (data) => {
    socket.to(`chat-${data.chatId}`).emit("user-stop-typing", data)
  })

  // Handle task updates
  socket.on("task-updated", (data) => {
    io.emit("task-update", data)
  })

  // Handle notifications
  socket.on("send-notification", (data) => {
    io.to(`user-${data.userId}`).emit("new-notification", data)
  })

  socket.on("disconnect", () => {
    console.log(`[v0] User disconnected: ${socket.id}`)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[v0] Error:", err.stack)

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    })
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid token",
    })
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, async () => {
  try {
    // Test database connection
    await db.query("SELECT NOW()")
    console.log(`[v0] ✅ Database connected successfully`)
    console.log(`[v0] 🚀 Server running on port ${PORT}`)
    console.log(`[v0] 🌐 Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`[v0] 🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`)
  } catch (error) {
    console.error("[v0] ❌ Database connection failed:", error.message)
    process.exit(1)
  }
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[v0] SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("[v0] Process terminated")
    process.exit(0)
  })
})

module.exports = { app, io }
