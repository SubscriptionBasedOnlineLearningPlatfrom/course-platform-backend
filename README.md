# 🎓 ProLearnX Backend Server

Backend API server for the ProLearnX online learning platform. This Node.js/Express application handles authentication, course management, enrollment, payments, and all business logic for the platform.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: PostgreSQL + Supabase
- **Authentication**: JWT, Passport.js (Google OAuth, Local Strategy)
- **File Storage**: Digital Ocean Spaces (S3-compatible)
- **Payment Processing**: Stripe
- **Email Service**: Nodemailer (SMTP via Brevo)
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Digital Ocean Spaces account (for file uploads)
- Stripe account (for payments)
- SMTP email service (Brevo recommended)
- Google OAuth credentials (optional, for social login)

## 🔧 Installation

1. **Navigate to backend directory**
```bash
cd course-platform-backend
```bash
git clone <repository-url>
cd course-platform-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:5173

# JWT Secrets
JWT_SECRET=your_instructor_jwt_secret
STUDENT_JWT_SECRET=your_student_jwt_secret
SESSION_SECRET=supersecret

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_PATH=/auth/google/callback

# Email Configuration (Brevo SMTP)
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SENDER_EMAIL=parkkavisivakaran72@gmail.com
ADMIN_EMAIL=parkkavisivakaran72@gmail.com

# Digital Ocean Spaces
DO_SPACES_KEY=your_do_spaces_key
DO_SPACES_SECRET=your_do_spaces_secret
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_NAME=onlinelearningplatform
DO_SPACES_REGION=sgp1

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# PostgreSQL Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=Online Learning Platform
DB_PASSWORD=your_password
DB_PORT=5432

# Frontend URLs (CORS)
INSTRUCTOR_FRONTEND_URL=http://localhost:5173
STUDENT_FRONTEND_URL=http://localhost:5175
ADMIN_FRONTEND_URL=http://localhost:5174
CLIENT_URL=http://localhost:5173
```

3. **Initialize the database**
```bash
# Run SQL scripts from database/ folder
psql -U postgres -d "Online Learning Platform" -f database/SETUP_DATABASE.sql
```

4. **Start the server**
```bash
npm start          # Development mode with nodemon
# or
node server.js     # Production mode
```

Server runs on `http://localhost:4000`

## 📁 Project Structure

```
course-platform-backend/
├── 📁 auth/                    # Authentication modules
├── 📁 config/                  # Configuration files
│   ├── doSpaces.js            # Digital Ocean Spaces config
│   ├── nodemailer.js          # Email configuration
│   ├── passport.js            # Passport strategies
│   └── supabaseClient.js      # Supabase client setup
├── 📁 controllers/            # Route controllers
│   ├── 📁 instructor/         # Instructor-specific controllers
│   └── 📁 student/            # Student-specific controllers
├── 📁 database/               # Database schemas and setup
├── 📁 email-formats/          # Email templates
├── 📁 middlewares/            # Custom middleware
├── 📁 models/                 # Data models
├── 📁 routes/                 # API routes
│   ├── 📁 instructor/         # Instructor routes
│   ├── 📁 student/            # Student routes
│   └── auth.js               # Authentication routes
├── 📁 utils/                  # Utility functions
├── server.js                  # Main server file
├── package.json              # Dependencies and scripts
└── .env                      # Environment variables
```

## 🛣️ API Routes

### 🔐 Authentication Routes (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/reset-password` - Password reset request
- `POST /auth/update-password` - Update password

### 👨‍🏫 Instructor Routes (`/instructor`)
- `GET|POST|PUT|DELETE /instructor/courses` - Course management
- `GET|POST|PUT|DELETE /instructor/modules` - Module management
- `GET|POST|PUT|DELETE /instructor/chapters` - Chapter management
- `GET|POST|PUT|DELETE /instructor/quizzes` - Quiz management
- `GET|PUT /instructor/profile` - Profile management
- `GET /instructor/overview` - Dashboard overview
- `GET|POST /instructor/comments` - Comments management

### 👨‍🎓 Student Routes (`/student`)
- `GET /student/courses` - Browse available courses
- `GET /student/dashboard` - Student dashboard
- `POST /student/auth` - Student authentication
- `GET|POST /student/subscription` - Subscription management
- `GET|POST /student/quizzes` - Take quizzes
- `GET|PUT /student/profile` - Profile management
- `GET /student/course` - Access course content

## 🔒 Authentication Flow

1. **Google OAuth**: Users authenticate via Google
2. **JWT Generation**: Server generates JWT tokens
3. **Token Storage**: Frontend stores tokens in localStorage
4. **Request Authorization**: Protected routes verify JWT tokens
5. **Session Management**: Express sessions for additional security

## 📧 Email System

- **Provider**: Brevo (formerly Sendinblue)
- **Features**: Registration confirmation, password reset
- **Templates**: HTML email templates in `/email-formats`
- **Configuration**: SMTP settings in `config/nodemailer.js`

## 🗄️ Database Schema

### Key Tables (Supabase)
- `auth.users` - User authentication
- `instructor_profiles` - Instructor information
- `student_profiles` - Student information
- `courses` - Course data
- `modules` - Course modules
- `chapters` - Module chapters
- `quizzes` - Quiz data
- `subscriptions` - Student subscriptions

## 🧪 Testing

### Available Test Scripts
- `node test-email-reset.js` - Test password reset emails
- `node test-password-update.js` - Test password update flow
- `node create-test-token.js` - Generate test JWT tokens
- `./test-profile-system.sh` - Test profile system

### API Testing
```bash
# Test server status
curl http://localhost:4000/test-simple

# Test password reset
curl -X POST http://localhost:4000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure Supabase for production
3. Set up Digital Ocean Spaces
4. Configure Stripe webhooks
5. Set up domain and SSL

### Recommended Platforms
- **Render** (recommended)
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

## 🔧 Configuration Notes

### Supabase Setup
1. Create Supabase project
2. Set up authentication providers
3. Configure email templates
4. Set RLS policies
5. Create required tables

### Google OAuth Setup
1. Create Google Cloud Console project
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Set authorized redirect URIs

### Digital Ocean Spaces
1. Create Spaces bucket
2. Generate API keys
3. Configure CORS policy
4. Set public read permissions

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
lsof -ti:4000 | xargs kill -9
```

**Environment variables not loading**
- Check `.env` file location
- Verify file permissions
- Restart server after changes

**Database connection issues**
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies

**Email not sending**
- Verify SMTP credentials
- Check Brevo account status
- Review email templates

## 📝 Development Guidelines

### Code Style
- Use ES6+ modules
- Implement proper error handling
- Add logging for debugging
- Follow RESTful API conventions

### Security Best Practices
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Secure sensitive routes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Create an issue in the repository

---

**Happy Coding! 🚀**