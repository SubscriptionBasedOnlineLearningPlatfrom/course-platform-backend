import express from "express";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import 'dotenv/config';
import session from "express-session";
// import cookieParser from "cookie-parser";
// import { supabase } from "./Database/SupabaseClient.js";
import OverviewRouter from "./routes/instructor/overviewRouter.js";
import commentRouter from "./routes/instructor/commentsRouter.js";
import QuizRouter from "./routes/instructor/quizRouter.js";
import courseRouter from "./routes/student/courseRouter.js";
import moduleRoutes from './routes/instructor/moduleRoutes.js';
import chapterRoutes from './routes/instructor/chapterRoutes.js';
import courseRoutes from './routes/instructor/courseRoutes.js';
import profileRouter from './routes/instructor/profileRoutes.js';
import submissionRoutes from './routes/instructor/submissionRoutes.js';
import authRoutes from "./routes/auth.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminUserManagementRoutes from "./routes/adminUserManagement.js";
import dashboardRouter from "./routes/student/dashboardRouter.js";
import authRouter from "./routes/student/authRoute.js";
import subscriptionRoute from "./routes/student/subscriptionRoute.js";
import quizRouter from "./routes/student/quizRoute.js";
import profileRoute from "./routes/student/profileRoute.js";
import courseContentRoutes from "./routes/student/courseContentRoutes.js";
import studentSubmissionRoutes from "./routes/student/studentSubmissionRoutes.js";
import adminDashboardRoute from "./routes/admin/adminDashboardRoute.js";
import viewPaymentRoute from "./routes/admin/viewPaymentRoute.js";
import { configurePassport } from "./config/passport.js";
import courseManagementRoutes from "./routes/admin/courseManagementRoutes.js";
import analyticsRoutes from "./routes/admin/analyticsRoutes.js";

/* import instructorRoutes from "./routes/instructorRoutes.js"; */
/* import passportConfig from "./auth/passportConfig.js"; */

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // allow requests from localhost (dev) or your deployed frontend
    if (!origin || origin === "http://localhost:5173" || origin === "https://your-frontend-domain.com") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true })); // parse form data

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
}));



// Configure and Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session()); 
// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
  res.send("✅ Server running. Go to /signup or /login");
});
// instructors
app.use("/instructor/overview", OverviewRouter);
app.use("/overview", OverviewRouter); // General overview route for frontend compatibility
app.use("/instructor/comments", commentRouter);
app.use("/instructor/quizzes", QuizRouter);
app.use("/instructor/modules", moduleRoutes);
app.use("/instructor/chapters", chapterRoutes);
app.use("/instructor/courses", courseRoutes);
app.use("/instructor/profile", profileRouter);
app.use("/instructor/submissions", submissionRoutes);

// students
app.use("/student/courses", courseRouter);
app.use('/student/dashboard', dashboardRouter);
app.use('/student/auth', authRouter);
app.use('/student/subscription', subscriptionRoute);
app.use("/student/quizzes", quizRouter);
app.use("/student/profile", profileRoute);
app.use('/student/course', courseContentRoutes);
app.use('/student/assignments', studentSubmissionRoutes);

// Routes
app.use("/auth", authRoutes);
app.use("/admin/dashboard", adminDashboardRoute);
app.use("/admin/payments", viewPaymentRoute);
app.use("/admin/course-management", courseManagementRoutes);
app.use("/admin/analytics", analyticsRoutes);
app.use("/admin/auth", adminAuthRoutes);
app.use("/admin/users", adminUserManagementRoutes);

// app.use("/auth", authRoutes); // signup, login, dashboard

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!", details: err.message });
});


app.get("/test-cors", (req, res) => {
  res.json({
    message: "CORS working ✅",
    receivedOrigin: req.headers.origin,
  });
});


// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
