const bcrypt = require("bcrypt")
const db = require("../config/database")
const { v4: uuidv4 } = require("uuid")

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Clear existing data (in reverse order of dependencies)
    await db.query("DELETE FROM chat_messages")
    await db.query("DELETE FROM chat_participants")
    await db.query("DELETE FROM chat_threads")
    await db.query("DELETE FROM notifications")
    await db.query("DELETE FROM user_settings")
    await db.query("DELETE FROM tasks")
    await db.query("DELETE FROM projects")
    await db.query("DELETE FROM users")

    console.log("Cleared existing data")

    // Create admin users
    const adminPassword = await bcrypt.hash("admin123", 10)
    const adminUsers = [
      {
        id: uuidv4(),
        email: "admin@acme.org",
        password_hash: adminPassword,
        first_name: "John",
        last_name: "Admin",
        role: "admin",
      },
      {
        id: uuidv4(),
        email: "admin@ngo.org",
        password_hash: adminPassword,
        first_name: "Sarah",
        last_name: "Manager",
        role: "admin",
      },
    ]

    // Create staff users
    const staffPassword = await bcrypt.hash("staff123", 10)
    const staffUsers = [
      {
        id: uuidv4(),
        email: "jane.doe@acme.org",
        password_hash: staffPassword,
        first_name: "Jane",
        last_name: "Doe",
        role: "staff",
      },
      {
        id: uuidv4(),
        email: "mike.smith@acme.org",
        password_hash: staffPassword,
        first_name: "Mike",
        last_name: "Smith",
        role: "staff",
      },
      {
        id: uuidv4(),
        email: "alice.johnson@ngo.org",
        password_hash: staffPassword,
        first_name: "Alice",
        last_name: "Johnson",
        role: "staff",
      },
    ]

    const allUsers = [...adminUsers, ...staffUsers]

    // Insert users
    for (const user of allUsers) {
      await db.query(
        "INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6)",
        [user.id, user.email, user.password_hash, user.first_name, user.last_name, user.role],
      )
    }

    console.log(`Created ${allUsers.length} users`)

    // Create projects
    const projects = [
      {
        id: uuidv4(),
        name: "Website Revamp",
        description: "Complete redesign of the company website",
        status: "active",
        created_by: adminUsers[0].id,
      },
      {
        id: uuidv4(),
        name: "Mobile App Development",
        description: "Develop mobile application for iOS and Android",
        status: "active",
        created_by: adminUsers[1].id,
      },
      {
        id: uuidv4(),
        name: "Database Migration",
        description: "Migrate legacy database to new system",
        status: "completed",
        created_by: adminUsers[0].id,
      },
    ]

    for (const project of projects) {
      await db.query("INSERT INTO projects (id, name, description, status, created_by) VALUES ($1, $2, $3, $4, $5)", [
        project.id,
        project.name,
        project.description,
        project.status,
        project.created_by,
      ])
    }

    console.log(`Created ${projects.length} projects`)

    // Create tasks
    const tasks = [
      {
        id: uuidv4(),
        title: "Design Homepage Layout",
        description: "Create wireframes and mockups for the new homepage",
        priority: "high",
        status: "in_progress",
        project_id: projects[0].id,
        assigned_to: staffUsers[0].id,
        assigned_by: adminUsers[0].id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        id: uuidv4(),
        title: "Implement User Authentication",
        description: "Set up JWT-based authentication system",
        priority: "urgent",
        status: "todo",
        project_id: projects[1].id,
        assigned_to: staffUsers[1].id,
        assigned_by: adminUsers[1].id,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        id: uuidv4(),
        title: "Database Schema Design",
        description: "Design the database schema for the new system",
        priority: "medium",
        status: "completed",
        project_id: projects[2].id,
        assigned_to: staffUsers[2].id,
        assigned_by: adminUsers[0].id,
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: uuidv4(),
        title: "API Documentation",
        description: "Write comprehensive API documentation",
        priority: "low",
        status: "review",
        project_id: projects[1].id,
        assigned_to: staffUsers[0].id,
        assigned_by: adminUsers[1].id,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    ]

    for (const task of tasks) {
      await db.query(
        `INSERT INTO tasks (id, title, description, priority, status, project_id, assigned_to, assigned_by, due_date, completed_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          task.id,
          task.title,
          task.description,
          task.priority,
          task.status,
          task.project_id,
          task.assigned_to,
          task.assigned_by,
          task.due_date,
          task.completed_at,
        ],
      )
    }

    console.log(`Created ${tasks.length} tasks`)

    // Create user settings for all users
    for (const user of allUsers) {
      await db.query(
        `INSERT INTO user_settings (user_id, email_notifications, push_notifications, task_reminders, chat_notifications, theme, language, timezone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, true, true, true, true, "system", "en", "UTC"],
      )
    }

    console.log(`Created settings for ${allUsers.length} users`)

    // Create sample notifications
    const notifications = [
      {
        user_id: staffUsers[0].id,
        title: "New Task Assigned",
        message: "You have been assigned a new task: Design Homepage Layout",
        type: "task",
        action_url: `/tasks/${tasks[0].id}`,
      },
      {
        user_id: staffUsers[1].id,
        title: "Task Due Soon",
        message: "Your task 'Implement User Authentication' is due in 3 days",
        type: "warning",
        action_url: `/tasks/${tasks[1].id}`,
      },
      {
        user_id: adminUsers[0].id,
        title: "Task Completed",
        message: "Alice Johnson completed the task: Database Schema Design",
        type: "success",
        action_url: `/tasks/${tasks[2].id}`,
      },
    ]

    for (const notification of notifications) {
      await db.query(
        "INSERT INTO notifications (user_id, title, message, type, action_url) VALUES ($1, $2, $3, $4, $5)",
        [notification.user_id, notification.title, notification.message, notification.type, notification.action_url],
      )
    }

    console.log(`Created ${notifications.length} notifications`)

    console.log("Database seeding completed successfully!")
    console.log("\nSample login credentials:")
    console.log("Admin: admin@acme.org / admin123")
    console.log("Admin: admin@ngo.org / admin123")
    console.log("Staff: jane.doe@acme.org / staff123")
    console.log("Staff: mike.smith@acme.org / staff123")
    console.log("Staff: alice.johnson@ngo.org / staff123")
  } catch (error) {
    console.error("Database seeding failed:", error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Seeding script failed:", error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }
