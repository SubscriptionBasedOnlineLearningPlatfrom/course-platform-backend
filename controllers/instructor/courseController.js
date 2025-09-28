import { CourseModel } from "../../models/instructor/courseModel.js";

export const CourseController = {
  // Create a new course
  async createCourse(req, res) {
    try {
      const { title, description, category, level, duration, requirements } = req.body;
      const instructorId = req.user.instructor_id; // From JWT middleware

      // Validate required fields
      if (!title || !description || !category || !level) {
        return res.status(400).json({
          success: false,
          error: "Title, description, category, and level are required",
        });
      }

      // Validate duration if provided
      let validatedDuration = null;
      if (duration !== undefined && duration !== null && duration !== "") {
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
          return res.status(400).json({
            success: false,
            error: "Duration must be a positive number (in hours)",
          });
        }
        validatedDuration = durationNum;
      }

      // Ensure level is properly capitalized (safety net)
      const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

      const courseData = {
        instructor_id: instructorId,
        title,
        description,
        category,
        level: normalizedLevel, // Use the normalized level
        duration: validatedDuration,
        requirements,
      };

      const result = await CourseModel.createCourse(courseData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in createCourse controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Get all courses by instructor
  async getInstructorCourses(req, res) {
    try {
      const instructorId = req.user.instructor_id;

      const result = await CourseModel.getCoursesByInstructor(instructorId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getInstructorCourses controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Get a single course by ID
  async getCourseById(req, res) {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          error: "Course ID is required",
        });
      }

      const result = await CourseModel.getCourseById(courseId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getCourseById controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Update a course
  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const updateData = req.body;
      const instructorId = req.user.instructor_id;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          error: "Course ID is required",
        });
      }

      // First, verify that the course belongs to the instructor
      const courseResult = await CourseModel.getCourseById(courseId);
      if (!courseResult.success) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (courseResult.data.instructor_id !== instructorId) {
        return res.status(403).json({
          success: false,
          error: "You don't have permission to update this course",
        });
      }

      const result = await CourseModel.updateCourse(courseId, updateData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in updateCourse controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Delete a course
  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;
      const instructorId = req.user.instructor_id;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          error: "Course ID is required",
        });
      }

      // First, verify that the course belongs to the instructor
      const courseResult = await CourseModel.getCourseById(courseId);
      if (!courseResult.success) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (courseResult.data.instructor_id !== instructorId) {
        return res.status(403).json({
          success: false,
          error: "You don't have permission to delete this course",
        });
      }

      const result = await CourseModel.deleteCourse(courseId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in deleteCourse controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Get all published courses (for students)
  async getPublishedCourses(req, res) {
    try {
      const result = await CourseModel.getPublishedCourses();

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getPublishedCourses controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Update course status (publish/unpublish)
  async updateCourseStatus(req, res) {
    try {
      const { courseId } = req.params;
      const { status } = req.body;
      const instructorId = req.user.instructor_id;

      if (!courseId || !status) {
        return res.status(400).json({
          success: false,
          error: "Course ID and status are required",
        });
      }

      if (!["draft", "published", "archived"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Must be 'draft', 'published', or 'archived'",
        });
      }

      // First, verify that the course belongs to the instructor
      const courseResult = await CourseModel.getCourseById(courseId);
      if (!courseResult.success) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (courseResult.data.instructor_id !== instructorId) {
        return res.status(403).json({
          success: false,
          error: "You don't have permission to update this course",
        });
      }

      const result = await CourseModel.updateCourseStatus(courseId, status);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        message: `Course ${status} successfully`,
        data: result.data,
      });
    } catch (error) {
      console.error("Error in updateCourseStatus controller:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
};