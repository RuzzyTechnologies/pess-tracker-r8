const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Chat = require("../models/Chat")
const User = require("../models/User")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/chat-files"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only images, documents, and archives are allowed"))
    }
  },
})

// @route   GET /api/chats
// @desc    Get all chat threads for the current user
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { type } = req.query // Filter by chat type: individual, group, department

    let threads = await Chat.findThreadsByUser(req.user.id)

    // Filter by type if specified
    if (type) {
      threads = threads.filter((thread) => thread.type === type)
    }

    res.json({
      threads: threads.map((thread) => ({
        id: thread.id,
        name: thread.name,
        type: thread.type,
        createdBy: thread.created_by,
        createdByName: thread.created_by_name,
        messageCount: Number.parseInt(thread.message_count) || 0,
        lastMessage: thread.last_message,
        lastMessageAt: thread.last_message_at,
        createdAt: thread.created_at,
      })),
    })
  } catch (error) {
    console.error("Get chat threads error:", error)
    res.status(500).json({ error: "Failed to get chat threads" })
  }
})

// @route   POST /api/chats
// @desc    Create a new chat thread
// @access  Private
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, type, participants } = req.body

    // Validation
    if (!type || !["individual", "group", "department"].includes(type)) {
      return res.status(400).json({ error: "Valid chat type is required (individual, group, department)" })
    }

    if ((type === "group" || type === "department") && !name) {
      return res.status(400).json({ error: "Name is required for group and department chats" })
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: "At least one participant is required" })
    }

    // Validate all participants exist
    const participantUsers = await Promise.all(participants.map((id) => User.findById(id)))
    if (participantUsers.some((user) => !user)) {
      return res.status(400).json({ error: "One or more participants not found" })
    }

    // For individual chats, check if thread already exists
    if (type === "individual" && participants.length === 1) {
      const existingThreads = await Chat.findThreadsByUser(req.user.id)
      const existingIndividualThread = existingThreads.find(
        (thread) =>
          thread.type === "individual" &&
          thread.participants &&
          thread.participants.length === 2 &&
          thread.participants.some((p) => p.id === participants[0]),
      )

      if (existingIndividualThread) {
        return res.json({
          message: "Chat thread already exists",
          thread: existingIndividualThread,
        })
      }
    }

    // Add creator to participants if not already included
    const allParticipants = [...new Set([req.user.id, ...participants])]

    const threadData = {
      name: type === "individual" ? null : name,
      type,
      createdBy: req.user.id,
      participants: allParticipants,
    }

    const thread = await Chat.createThread(threadData)

    // Get the full thread with participants
    const fullThread = await Chat.findThreadById(thread.id)

    // Notify all participants via Socket.io
    allParticipants.forEach((participantId) => {
      if (participantId !== req.user.id) {
        req.io?.to(`user-${participantId}`).emit("new-chat-thread", {
          thread: fullThread,
          createdBy: {
            id: req.user.id,
            name: `${req.user.first_name} ${req.user.last_name}`,
          },
        })
      }
    })

    res.status(201).json({
      message: "Chat thread created successfully",
      thread: fullThread,
    })
  } catch (error) {
    console.error("Create chat thread error:", error)
    res.status(500).json({ error: "Failed to create chat thread" })
  }
})

// @route   GET /api/chats/:id
// @desc    Get chat thread details with participants
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const thread = await Chat.findThreadById(id)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    // Check if user is a participant
    const isParticipant = thread.participants.some((p) => p.id === req.user.id)
    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    res.json({ thread })
  } catch (error) {
    console.error("Get chat thread error:", error)
    res.status(500).json({ error: "Failed to get chat thread" })
  }
})

// @route   GET /api/chats/:id/messages
// @desc    Get messages for a chat thread
// @access  Private
router.get("/:id/messages", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 50 } = req.query

    // Check if thread exists and user has access
    const thread = await Chat.findThreadById(id)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    const isParticipant = thread.participants.some((p) => p.id === req.user.id)
    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const messages = await Chat.getMessages(id, Number.parseInt(limit), offset)

    res.json({
      messages: messages.map((message) => ({
        id: message.id,
        threadId: message.thread_id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        senderAvatar: message.sender_avatar,
        content: message.content,
        messageType: message.message_type,
        fileUrl: message.file_url,
        fileName: message.file_name,
        fileSize: message.file_size,
        isDeleted: message.is_deleted,
        createdAt: message.created_at,
      })),
      pagination: {
        currentPage: Number.parseInt(page),
        limit: Number.parseInt(limit),
        hasMore: messages.length === Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Get chat messages error:", error)
    res.status(500).json({ error: "Failed to get chat messages" })
  }
})

// @route   POST /api/chats/:id/messages
// @desc    Send a message to a chat thread
// @access  Private
router.post("/:id/messages", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    // Check if thread exists and user has access
    const thread = await Chat.findThreadById(id)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    const isParticipant = thread.participants.some((p) => p.id === req.user.id)
    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Validate message content or file
    if (!content && !req.file) {
      return res.status(400).json({ error: "Message content or file is required" })
    }

    const messageData = {
      threadId: id,
      senderId: req.user.id,
      content: content || "",
      messageType: req.file ? "file" : "text",
      fileUrl: req.file ? `/uploads/chat-files/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null,
      fileSize: req.file ? req.file.size : null,
    }

    const message = await Chat.addMessage(messageData)

    // Get the full message with sender info
    const fullMessage = {
      id: message.id,
      threadId: message.thread_id,
      senderId: message.sender_id,
      senderName: `${req.user.first_name} ${req.user.last_name}`,
      senderAvatar: req.user.avatar_url,
      content: message.content,
      messageType: message.message_type,
      fileUrl: message.file_url,
      fileName: message.file_name,
      fileSize: message.file_size,
      isDeleted: message.is_deleted,
      createdAt: message.created_at,
    }

    // Broadcast message to all participants via Socket.io
    thread.participants.forEach((participant) => {
      req.io?.to(`user-${participant.id}`).emit("new-message", {
        threadId: id,
        message: fullMessage,
      })
    })

    res.status(201).json({
      message: "Message sent successfully",
      data: fullMessage,
    })
  } catch (error) {
    console.error("Send message error:", error)
    res.status(500).json({ error: "Failed to send message" })
  }
})

// @route   DELETE /api/chats/:threadId/messages/:messageId
// @desc    Delete a message (admin only or message sender)
// @access  Private
router.delete("/:threadId/messages/:messageId", authenticateToken, async (req, res) => {
  try {
    const { threadId, messageId } = req.params

    // Check if thread exists
    const thread = await Chat.findThreadById(threadId)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    // Get the message to check ownership
    const messages = await Chat.getMessages(threadId, 1000, 0) // Get all messages to find the specific one
    const message = messages.find((m) => m.id === messageId)

    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    // Check permissions: admin can delete any message, users can only delete their own
    if (req.user.role !== "admin" && message.sender_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }

    const deletedMessage = await Chat.deleteMessage(messageId, req.user.id)

    // Broadcast message deletion to all participants
    thread.participants.forEach((participant) => {
      req.io?.to(`user-${participant.id}`).emit("message-deleted", {
        threadId,
        messageId,
        deletedBy: req.user.id,
      })
    })

    res.json({
      message: "Message deleted successfully",
      deletedMessage: {
        id: deletedMessage.id,
        deletedBy: req.user.id,
        deletedAt: deletedMessage.deleted_at,
      },
    })
  } catch (error) {
    console.error("Delete message error:", error)
    res.status(500).json({ error: "Failed to delete message" })
  }
})

// @route   DELETE /api/chats/:id
// @desc    Delete a chat thread (admin only or creator)
// @access  Private
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const thread = await Chat.findThreadById(id)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    // Check permissions: admin can delete any thread, users can only delete threads they created
    if (req.user.role !== "admin" && thread.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }

    await Chat.deleteThread(id)

    // Notify all participants
    thread.participants.forEach((participant) => {
      req.io?.to(`user-${participant.id}`).emit("thread-deleted", {
        threadId: id,
        deletedBy: req.user.id,
      })
    })

    res.json({ message: "Chat thread deleted successfully" })
  } catch (error) {
    console.error("Delete chat thread error:", error)
    res.status(500).json({ error: "Failed to delete chat thread" })
  }
})

// @route   POST /api/chats/:id/participants
// @desc    Add participants to a chat thread (admin only or creator)
// @access  Private
router.post("/:id/participants", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { userIds } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "User IDs array is required" })
    }

    const thread = await Chat.findThreadById(id)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    // Check permissions
    if (req.user.role !== "admin" && thread.created_by !== req.user.id) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Individual chats cannot have additional participants
    if (thread.type === "individual") {
      return res.status(400).json({ error: "Cannot add participants to individual chats" })
    }

    // Validate all users exist
    const users = await Promise.all(userIds.map((userId) => User.findById(userId)))
    if (users.some((user) => !user)) {
      return res.status(400).json({ error: "One or more users not found" })
    }

    // Add participants
    const addedParticipants = []
    for (const userId of userIds) {
      try {
        const participant = await Chat.addParticipant(id, userId)
        addedParticipants.push(participant)

        // Notify the new participant
        req.io?.to(`user-${userId}`).emit("added-to-chat", {
          thread,
          addedBy: {
            id: req.user.id,
            name: `${req.user.first_name} ${req.user.last_name}`,
          },
        })
      } catch (error) {
        console.error(`Error adding participant ${userId}:`, error)
      }
    }

    // Notify existing participants
    thread.participants.forEach((participant) => {
      req.io?.to(`user-${participant.id}`).emit("participants-added", {
        threadId: id,
        addedParticipants: addedParticipants.map((p) => p.user_id),
        addedBy: req.user.id,
      })
    })

    res.json({
      message: "Participants added successfully",
      addedCount: addedParticipants.length,
    })
  } catch (error) {
    console.error("Add participants error:", error)
    res.status(500).json({ error: "Failed to add participants" })
  }
})

// @route   DELETE /api/chats/:id/participants/:userId
// @desc    Remove a participant from a chat thread (admin only or creator)
// @access  Private
router.delete("/:id/participants/:userId", authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params

    const thread = await Chat.findThreadById(id)
    if (!thread) {
      return res.status(404).json({ error: "Chat thread not found" })
    }

    // Check permissions: admin, creator, or the user themselves can remove
    if (req.user.role !== "admin" && thread.created_by !== req.user.id && req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Cannot remove participants from individual chats
    if (thread.type === "individual") {
      return res.status(400).json({ error: "Cannot remove participants from individual chats" })
    }

    // Cannot remove the creator
    if (userId === thread.created_by) {
      return res.status(400).json({ error: "Cannot remove the chat creator" })
    }

    await Chat.removeParticipant(id, userId)

    // Notify the removed participant
    req.io?.to(`user-${userId}`).emit("removed-from-chat", {
      threadId: id,
      removedBy: req.user.id,
    })

    // Notify remaining participants
    thread.participants.forEach((participant) => {
      if (participant.id !== userId) {
        req.io?.to(`user-${participant.id}`).emit("participant-removed", {
          threadId: id,
          removedUserId: userId,
          removedBy: req.user.id,
        })
      }
    })

    res.json({ message: "Participant removed successfully" })
  } catch (error) {
    console.error("Remove participant error:", error)
    res.status(500).json({ error: "Failed to remove participant" })
  }
})

// @route   GET /api/chats/admin/all
// @desc    Get all chat threads (admin only)
// @access  Private (Admin)
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query

    // This would require a more complex query to get all threads
    // For now, return a placeholder response
    res.json({
      threads: [],
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: 0,
        totalThreads: 0,
      },
    })
  } catch (error) {
    console.error("Get all chat threads error:", error)
    res.status(500).json({ error: "Failed to get chat threads" })
  }
})

module.exports = router
