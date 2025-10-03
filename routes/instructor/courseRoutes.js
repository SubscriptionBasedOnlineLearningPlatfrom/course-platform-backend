import express from "express";
import passport from "passport";
import { CourseController } from "../../controllers/instructor/courseController.js";

const router = express.Router();

// Middleware to protect all routes (require JWT authentication)
const requireAuth = passport.authenticate("jwt", { session: false });

// Proper JWT authentication middleware is defined above as requireAuth

// Public route for getting all courses (for students)
router.get("/public/all", CourseController.getPublishedCourses);

// Simple test route (no auth required)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Course routes are working! 🎉"
  });
});

// Test route to check database structure (no auth required)
router.get("/test/structure", async (req, res) => {
  try {
    const { CourseModel } = await import("../../models/instructor/courseModel.js");
    const result = await CourseModel.getPublishedCourses();
    res.json({
      success: true,
      message: "Database connection working",
      columnCount: result.data ? result.data.length : 0,
      sampleData: result.data ? result.data.slice(0, 1) : []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Course routes for instructors - using proper JWT authentication
router.post("/", requireAuth, CourseController.createCourse);
router.get("/", requireAuth, CourseController.getInstructorCourses);
router.get("/:courseId", requireAuth, CourseController.getCourseById);
router.put("/:courseId", requireAuth, CourseController.updateCourse);
router.delete("/:courseId", requireAuth, CourseController.deleteCourse);

export default router;