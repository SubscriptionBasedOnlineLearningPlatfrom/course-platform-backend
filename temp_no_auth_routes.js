// TEMPORARY - Remove authentication for testing
// Replace the courseRoutes.js requireAuth middleware with this

import express from "express";
import { CourseController } from "../../controllers/instructor/courseController.js";

const router = express.Router();

// Temporary middleware that adds a fake user for testing
const fakeAuth = (req, res, next) => {
  // Add a fake user to req.user for testing
  req.user = {
    instructor_id: 1, // Make sure this instructor exists in your database
    email: "test@example.com",
    name: "Test Instructor"
  };
  next();
};

// Public routes (no auth required)
router.get("/public/all", CourseController.getPublishedCourses);
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Course routes are working! 🎉"
  });
});

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

// Course routes with fake authentication (TEMPORARY FOR TESTING ONLY)
router.post("/", fakeAuth, CourseController.createCourse);
router.get("/", fakeAuth, CourseController.getInstructorCourses);
router.get("/:courseId", fakeAuth, CourseController.getCourseById);
router.put("/:courseId", fakeAuth, CourseController.updateCourse);
router.delete("/:courseId", fakeAuth, CourseController.deleteCourse);

export default router;