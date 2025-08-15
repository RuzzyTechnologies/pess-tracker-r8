const crypto = require("crypto")
const path = require("path")

// Generate random string
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString("hex")
}

// Format user object for API response
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`,
    role: user.role,
    avatarUrl: user.avatar_url,
    isActive: user.is_active,
    lastLogin: user.last_login,
    createdAt: user.created_at,
  }
}

// Format task object for API response
function formatTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    projectId: task.project_id,
    projectName: task.project_name,
    assignedTo: task.assigned_to,
    assignedToName: task.assigned_to_name,
    assignedBy: task.assigned_by,
    assignedByName: task.assigned_by_name,
    dueDate: task.due_date,
    completedAt: task.completed_at,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }
}

// Format chat thread for API response
function formatChatThread(thread) {
  return {
    id: thread.id,
    name: thread.name,
    type: thread.type,
    createdBy: thread.created_by,
    createdByName: thread.created_by_name,
    participants: thread.participants || [],
    messageCount: Number.parseInt(thread.message_count) || 0,
    lastMessage: thread.last_message,
    lastMessageAt: thread.last_message_at,
    isActive: thread.is_active,
    createdAt: thread.created_at,
  }
}

// Format chat message for API response
function formatChatMessage(message) {
  return {
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
    deletedBy: message.deleted_by,
    deletedAt: message.deleted_at,
    createdAt: message.created_at,
  }
}

// Pagination helper
function getPaginationData(page, limit, totalCount) {
  const currentPage = Number.parseInt(page) || 1
  const itemsPerPage = Number.parseInt(limit) || 20
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const offset = (currentPage - 1) * itemsPerPage

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalCount,
    offset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

// File upload helpers
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase()
}

function isImageFile(filename) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
  return imageExtensions.includes(getFileExtension(filename))
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

// Date helpers
function isToday(date) {
  const today = new Date()
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

function isThisWeek(date) {
  const today = new Date()
  const checkDate = new Date(date)
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  return checkDate >= startOfWeek && checkDate <= endOfWeek
}

// Error response helper
function createErrorResponse(message, statusCode = 500, details = null) {
  const error = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
  }

  if (details) {
    error.details = details
  }

  return error
}

// Success response helper
function createSuccessResponse(data, message = "Success") {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

module.exports = {
  generateRandomString,
  formatUser,
  formatTask,
  formatChatThread,
  formatChatMessage,
  getPaginationData,
  getFileExtension,
  isImageFile,
  formatFileSize,
  isToday,
  isThisWeek,
  createErrorResponse,
  createSuccessResponse,
}
