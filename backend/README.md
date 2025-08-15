# PESS Tracker Backend

Backend API for the Project and Employee Support System (PESS) Tracker.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Admin and staff user roles with comprehensive user management
- **Task Management**: Create, assign, and track tasks with priorities and due dates
- **Real-time Chat**: Individual, group, and department chat with file sharing
- **Notifications**: Real-time notifications for task assignments and updates
- **File Upload**: Support for file attachments in chats and tasks
- **Settings Management**: User preferences and notification settings

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Neon account)
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file with your configuration:
\`\`\`env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
\`\`\`

4. Run database migrations:
\`\`\`bash
npm run migrate
\`\`\`

5. Seed the database with sample data:
\`\`\`bash
npm run seed
\`\`\`

6. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/overview` - Get user statistics

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### Chat
- `GET /api/chats` - Get user's chat threads
- `POST /api/chats` - Create new chat thread
- `GET /api/chats/:id` - Get chat thread details
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message
- `DELETE /api/chats/:threadId/messages/:messageId` - Delete message
- `DELETE /api/chats/:id` - Delete chat thread
- `POST /api/chats/:id/participants` - Add participants
- `DELETE /api/chats/:id/participants/:userId` - Remove participant

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Sample Users

After running the seed script, you can use these credentials:

**Admin Users:**
- admin@acme.org / admin123
- admin@ngo.org / admin123

**Staff Users:**
- jane.doe@acme.org / staff123
- mike.smith@acme.org / staff123
- alice.johnson@ngo.org / staff123

## Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Project Structure

\`\`\`
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Task.js              # Task model
│   └── Chat.js              # Chat model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── tasks.js             # Task management routes
│   ├── chats.js             # Chat system routes
│   ├── notifications.js     # Notification routes
│   └── settings.js          # Settings routes
├── scripts/
│   ├── migrate.js           # Database migration script
│   └── seed.js              # Database seeding script
├── utils/
│   ├── validation.js        # Input validation schemas
│   └── helpers.js           # Utility functions
├── migrations/
│   └── 001_initial_schema.sql # Database schema
├── uploads/                 # File upload directory
├── server.js                # Main server file
├── package.json
└── README.md
\`\`\`

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Role-based access control
- File upload restrictions

## Real-time Features

The application uses Socket.io for real-time functionality:

- Live chat messaging
- Real-time notifications
- Task assignment alerts
- User presence indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
