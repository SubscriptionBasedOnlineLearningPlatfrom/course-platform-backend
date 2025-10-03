# 🎓 Course Platform Backend

A comprehensive Node.js/Express backend API for an online learning platform supporting both instructors and students with authentication, course management, quizzes, and more.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Google OAuth 2.0** integration with Passport.js
- **JWT-based** authentication system
- **Supabase Auth** for user management
- **Session management** with Express sessions
- **Password reset** functionality via email

### 👨‍🏫 Instructor Features
- **Course Management**: Create, update, delete courses
- **Module & Chapter** organization
- **Quiz Creation** and management
- **Profile Management** with image upload
- **Course Overview** and analytics
- **Comments & Reviews** management

### 👨‍🎓 Student Features
- **Course Enrollment** and access
- **Dashboard** with progress tracking
- **Quiz Taking** and results
- **Subscription Management** with Stripe
- **Profile Management**
- **Course Content** streaming

### 🛠️ Technical Features
- **File Upload** to Digital Ocean Spaces
- **Email Service** with Nodemailer (Brevo SMTP)
- **Database** integration with Supabase
- **Payment Processing** with Stripe
- **CORS** enabled for frontend integration
- **Error Handling** middleware

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase** account and project
- **Google OAuth** credentials
- **Brevo/Sendinblue** SMTP account
- **Digital Ocean Spaces** (for file storage)
- **Stripe** account (for payments)

## 🔧 Installation

1. **Clone the repository**
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
SESSION_SECRET=your_session_secret

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_PATH=/auth/google/callback

# Email Configuration (Brevo/Sendinblue)
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_sender_email
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# Digital Ocean Spaces
DO_SPACES_KEY=your_do_spaces_key
DO_SPACES_SECRET=your_do_spaces_secret
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_NAME=your_bucket_name
DO_SPACES_REGION=sgp1

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Database (if using PostgreSQL directly)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

4. **Start the development server**
```bash
npm run server
# or
npm start
```

The server will start on `http://localhost:4000`

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