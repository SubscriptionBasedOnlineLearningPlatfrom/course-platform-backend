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
import authRoutes from "./routes/auth.js";
import dashboardRouter from "./routes/student/dashboardRouter.js";
import authRouter from "./routes/student/authRoute.js";
import subscriptionRoute from "./routes/student/subscriptionRoute.js";
import quizRouter from "./routes/student/quizRoute.js";
import profileRoute from "./routes/student/profileRoute.js";
import courseContentRoutes from "./routes/student/courseContentRoutes.js";
import studentSubmissionRoutes from "./routes/student/studentSubmissionRoutes.js";
import { configurePassport } from "./config/passport.js";
/* import instructorRoutes from "./routes/instructorRoutes.js"; */
/* import passportConfig from "./auth/passportConfig.js"; */

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// -------------------- MIDDLEWARE --------------------
app.use(express.json()); // parse JSON bodies
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

// Direct test route for Digital Ocean
// app.get("/test-simple", (req, res) => {
//   console.log("Simple test route hit!");
//   res.json({ message: "Simple test route working", timestamp: new Date().toISOString() });
// });
app.use("/instructor/overview", OverviewRouter);
app.use("/overview", OverviewRouter); // General overview route for frontend compatibility
app.use("/instructor/comments", commentRouter);
app.use("/instructor/quizzes", QuizRouter);
app.use("/instructor/modules", moduleRoutes);
app.use("/instructor/chapters", chapterRoutes);
app.use("/instructor/courses", courseRoutes);
app.use("/instructor/profile", profileRouter);

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

// app.use("/auth", authRoutes); // signup, login, dashboard

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!", details: err.message });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
