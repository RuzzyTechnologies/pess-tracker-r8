const Joi = require("joi")

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required",
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    avatarUrl: Joi.string().uri().allow("", null),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
}

// Task validation schemas
const taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
      "string.min": "Task title must be at least 3 characters long",
      "string.max": "Task title cannot exceed 255 characters",
      "any.required": "Task title is required",
    }),
    description: Joi.string().max(1000).allow(""),
    priority: Joi.string().valid("low", "medium", "high", "urgent").default("medium"),
    status: Joi.string().valid("todo", "in_progress", "review", "completed", "cancelled").default("todo"),
    projectId: Joi.string().uuid().allow(null),
    assignedTo: Joi.string().uuid().allow(null),
    dueDate: Joi.date().iso().allow(null),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(255),
    description: Joi.string().max(1000).allow(""),
    priority: Joi.string().valid("low", "medium", "high", "urgent"),
    status: Joi.string().valid("todo", "in_progress", "review", "completed", "cancelled"),
    projectId: Joi.string().uuid().allow(null),
    assignedTo: Joi.string().uuid().allow(null),
    dueDate: Joi.date().iso().allow(null),
  }),
}

// Chat validation schemas
const chatSchemas = {
  createThread: Joi.object({
    name: Joi.string()
      .max(100)
      .when("type", {
        is: Joi.string().valid("group", "department"),
        then: Joi.required(),
        otherwise: Joi.allow(null),
      }),
    type: Joi.string().valid("individual", "group", "department").required(),
    participants: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),

  sendMessage: Joi.object({
    content: Joi.string().max(2000).allow(""),
  }).when(Joi.object({ file: Joi.exist() }), {
    then: Joi.object({ content: Joi.string().allow("") }),
    otherwise: Joi.object({ content: Joi.string().min(1).required() }),
  }),
}

// Settings validation schema
const settingsSchema = Joi.object({
  emailNotifications: Joi.boolean(),
  pushNotifications: Joi.boolean(),
  taskReminders: Joi.boolean(),
  chatNotifications: Joi.boolean(),
  theme: Joi.string().valid("light", "dark", "system"),
  language: Joi.string().min(2).max(10),
  timezone: Joi.string().max(50),
})

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      })
    }

    req.validatedData = value
    next()
  }
}

module.exports = {
  userSchemas,
  taskSchemas,
  chatSchemas,
  settingsSchema,
  validate,
}
