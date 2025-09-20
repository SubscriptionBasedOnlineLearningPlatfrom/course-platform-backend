import express from "express";
import passport from "passport";
import cors from "cors";
// import session from "express-session"; // optional if you use sessions, not needed for JWT only
import dotenv from "dotenv";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import session from "express-session";
// import cookieParser from "cookie-parser";
// import { supabase } from "./Database/SupabaseClient.js";
import OverviewRouter from "./routes/instructor/overviewRouter.js";
import commentRouter from "./routes/instructor/commentsRouter.js";
import QuizRouter from "./routes/instructor/quizRouter.js";
import courseRouter from "./routes/student/courseRouter.js";
import moduleRoutes from './routes/instructor/moduleRoutes.js';
import chapterRoutes from './routes/instructor/chapterRoutes.js';
import authRoutes from "./routes/auth.js";
import dashboardRouter from "./routes/student/dashboardRouter.js";
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



// Initialize Passport
app.use(passport.initialize());

// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
  res.send("✅ Server running. Go to /signup or /login");
  
});
app.use("/instructor/overview", OverviewRouter);
app.use("/instructor/comments", commentRouter);
app.use("/instructor/quizzes", QuizRouter);
app.use("/instructor/modules", moduleRoutes);
app.use("/instructor/chapters", chapterRoutes);

// students
app.use("/student/courses", courseRouter);
app.use('/student/dashboard', dashboardRouter);
// Routes
app.use("/auth", authRoutes);

// app.use("/auth", authRoutes); // signup, login, dashboard

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
