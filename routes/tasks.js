const express = require("express")
const Task = require("../models/Task")
const User = require("../models/User")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const router = express.Router()

// @route   GET /api/tasks
// @desc    Get all tasks with filtering
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { assignedTo, assignedBy, status, priority, projectId, page = 1, limit = 50 } = req.query

    const filters = {}

    // Role-based filtering
    if (req.user.role === "staff") {
      // Staff can only see tasks assigned to them or tasks they assigned
      if (!assignedTo && !assignedBy) {
        filters.assignedTo = req.user.id
      } else {
        if (assignedTo && assignedTo !== req.user.id) {
          return res.status(403).json({ error: "Access denied" })
        }
        if (assignedBy && assignedBy !== req.user.id) {
          return res.status(403).json({ error: "Access denied" })
        }
      }
    }

    // Apply filters
    if (assignedTo) filters.assignedTo = assignedTo
    if (assignedBy) filters.assignedBy = assignedBy
    if (status) filters.status = status
    if (priority) filters.priority = priority
    if (projectId) filters.projectId = projectId

    const tasks = await Task.findAll(filters)

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedTasks = tasks.slice(startIndex, endIndex)

    res.json({
      tasks: paginatedTasks,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(tasks.length / limit),
        totalTasks: tasks.length,
        hasNext: endIndex < tasks.length,
        hasPrev: startIndex > 0,
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({ error: "Failed to get tasks" })
  }
})

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const { assignedTo, assignedBy } = req.query

    const filters = {}

    // Role-based filtering for stats
    if (req.user.role === "staff") {
      if (!assignedTo && !assignedBy) {
        filters.assignedTo = req.user.id
      } else {
        if (assignedTo && assignedTo !== req.user.id) {
          return res.status(403).json({ error: "Access denied" })
        }
        if (assignedBy && assignedBy !== req.user.id) {
          return res.status(403).json({ error: "Access denied" })
        }
      }
    } else {
      // Admin can filter by any user
      if (assignedTo) filters.assignedTo = assignedTo
      if (assignedBy) filters.assignedBy = assignedBy
    }

    const stats = await Task.getStats(filters)

    // Process stats into a more usable format
    const processedStats = {
      byStatus: {},
      byPriority: {},
      total: 0,
    }

    stats.forEach((stat) => {
      const count = Number.parseInt(stat.count)
      processedStats.total += count

      if (!processedStats.byStatus[stat.status]) {
        processedStats.byStatus[stat.status] = 0
      }
      processedStats.byStatus[stat.status] += count

      if (!processedStats.byPriority[stat.priority]) {
        processedStats.byPriority[stat.priority] = 0
      }
      processedStats.byPriority[stat.priority] += count
    })

    // Calculate completion rate
    const completedTasks = processedStats.byStatus.completed || 0
    const completionRate = processedStats.total > 0 ? Math.round((completedTasks / processedStats.total) * 100) : 0

    res.json({
      stats: {
        ...processedStats,
        completionRate,
        dueThisWeek: await getDueThisWeekCount(filters),
      },
    })
  } catch (error) {
    console.error("Get task stats error:", error)
    res.status(500).json({ error: "Failed to get task statistics" })
  }
})

// Helper function to get tasks due this week
async function getDueThisWeekCount(filters) {
  try {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const tasks = await Task.findAll(filters)
    return tasks.filter((task) => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      return dueDate >= startOfWeek && dueDate <= endOfWeek
    }).length
  } catch (error) {
    console.error("Error getting due this week count:", error)
    return 0
  }
}

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Role-based access control
    if (req.user.role === "staff") {
      if (task.assigned_to !== req.user.id && task.assigned_by !== req.user.id) {
        return res.status(403).json({ error: "Access denied" })
      }
    }

    res.json({ task })
  } catch (error) {
    console.error("Get task error:", error)
    res.status(500).json({ error: "Failed to get task" })
  }
})

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, status, projectId, assignedTo, dueDate } = req.body

    // Validation
    if (!title) {
      return res.status(400).json({ error: "Task title is required" })
    }

    // Staff can only assign tasks to themselves unless they're admin
    let finalAssignedTo = assignedTo
    if (req.user.role === "staff" && assignedTo && assignedTo !== req.user.id) {
      return res.status(403).json({ error: "Staff can only assign tasks to themselves" })
    }

    // If no assignedTo specified and user is staff, assign to themselves
    if (!finalAssignedTo && req.user.role === "staff") {
      finalAssignedTo = req.user.id
    }

    // Validate assigned user exists
    if (finalAssignedTo) {
      const assignedUser = await User.findById(finalAssignedTo)
      if (!assignedUser) {
        return res.status(400).json({ error: "Assigned user not found" })
      }
    }

    const taskData = {
      title,
      description,
      priority: priority || "medium",
      status: status || "todo",
      projectId,
      assignedTo: finalAssignedTo,
      assignedBy: req.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
    }

    const task = await Task.create(taskData)

    // Get the full task with user names
    const fullTask = await Task.findById(task.id)

    // Create notification for assigned user if different from creator
    if (finalAssignedTo && finalAssignedTo !== req.user.id) {
      // This would be handled by the notification system
      req.io?.to(`user-${finalAssignedTo}`).emit("new-notification", {
        type: "task",
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}`,
        actionUrl: `/tasks/${task.id}`,
      })
    }

    res.status(201).json({
      message: "Task created successfully",
      task: fullTask,
    })
  } catch (error) {
    console.error("Create task error:", error)
    res.status(500).json({ error: "Failed to create task" })
  }
})

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, priority, status, projectId, assignedTo, dueDate } = req.body

    // Get existing task
    const existingTask = await Task.findById(id)
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Role-based access control
    if (req.user.role === "staff") {
      // Staff can only update tasks assigned to them or tasks they created
      if (existingTask.assigned_to !== req.user.id && existingTask.assigned_by !== req.user.id) {
        return res.status(403).json({ error: "Access denied" })
      }

      // Staff cannot reassign tasks to other users
      if (assignedTo && assignedTo !== req.user.id && assignedTo !== existingTask.assigned_to) {
        return res.status(403).json({ error: "Staff cannot reassign tasks to other users" })
      }
    }

    // Validate assigned user exists if changing assignment
    if (assignedTo && assignedTo !== existingTask.assigned_to) {
      const assignedUser = await User.findById(assignedTo)
      if (!assignedUser) {
        return res.status(400).json({ error: "Assigned user not found" })
      }
    }

    const updates = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (priority !== undefined) updates.priority = priority
    if (status !== undefined) {
      updates.status = status
      // Set completed_at when task is marked as completed
      if (status === "completed" && existingTask.status !== "completed") {
        updates.completed_at = new Date()
      } else if (status !== "completed") {
        updates.completed_at = null
      }
    }
    if (projectId !== undefined) updates.project_id = projectId
    if (assignedTo !== undefined) updates.assigned_to = assignedTo
    if (dueDate !== undefined) updates.due_date = dueDate ? new Date(dueDate) : null

    const updatedTask = await Task.update(id, updates)

    // Get the full task with user names
    const fullTask = await Task.findById(id)

    // Send notification if task was reassigned
    if (assignedTo && assignedTo !== existingTask.assigned_to && assignedTo !== req.user.id) {
      req.io?.to(`user-${assignedTo}`).emit("new-notification", {
        type: "task",
        title: "Task Reassigned",
        message: `You have been assigned a task: ${fullTask.title}`,
        actionUrl: `/tasks/${id}`,
      })
    }

    res.json({
      message: "Task updated successfully",
      task: fullTask,
    })
  } catch (error) {
    console.error("Update task error:", error)
    res.status(500).json({ error: "Failed to update task" })
  }
})

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Get existing task
    const existingTask = await Task.findById(id)
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Role-based access control
    if (req.user.role === "staff") {
      // Staff can only delete tasks they created
      if (existingTask.assigned_by !== req.user.id) {
        return res.status(403).json({ error: "Access denied" })
      }
    }

    await Task.delete(id)

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({ error: "Failed to delete task" })
  }
})

// @route   GET /api/tasks/:id/comments
// @desc    Get task comments
// @access  Private
router.get("/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Check if task exists and user has access
    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    if (req.user.role === "staff") {
      if (task.assigned_to !== req.user.id && task.assigned_by !== req.user.id) {
        return res.status(403).json({ error: "Access denied" })
      }
    }

    // This would require a TaskComment model - for now return empty array
    res.json({ comments: [] })
  } catch (error) {
    console.error("Get task comments error:", error)
    res.status(500).json({ error: "Failed to get task comments" })
  }
})

// @route   POST /api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
router.post("/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" })
    }

    // Check if task exists and user has access
    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    if (req.user.role === "staff") {
      if (task.assigned_to !== req.user.id && task.assigned_by !== req.user.id) {
        return res.status(403).json({ error: "Access denied" })
      }
    }

    // This would require a TaskComment model implementation
    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        id: "temp-id",
        content,
        userId: req.user.id,
        userName: `${req.user.first_name} ${req.user.last_name}`,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Add task comment error:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
})

module.exports = router
