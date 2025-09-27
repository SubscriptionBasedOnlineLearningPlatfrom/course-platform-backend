import express from "express";
import passport from "passport";
import { CourseController } from "../../controllers/instructor/courseController.js";

const router = express.Router();

// Middleware to protect all routes (require JWT authentication)
const requireAuth = passport.authenticate("jwt", { session: false });

// TEMPORARY: Fake auth middleware for testing (REMOVE IN PRODUCTION)
const fakeAuth = (req, res, next) => {
  req.user = {
    instructor_id: "f4aae234-333a-4cb1-ba6a-8a97cbd8c80c", // Using existing instructor ID
    email: "test@example.com",
    name: "Test Instructor"
  };
  next();
};

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

// Course routes for instructors - TEMPORARILY using fakeAuth for testing
router.post("/", fakeAuth, CourseController.createCourse);
router.get("/", fakeAuth, CourseController.getInstructorCourses);
router.get("/:courseId", fakeAuth, CourseController.getCourseById);
router.put("/:courseId", fakeAuth, CourseController.updateCourse);
router.delete("/:courseId", fakeAuth, CourseController.deleteCourse);

export default router;