import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const CourseModel = {
  // Create a new course
  async createCourse(courseData) {
    try {
      const { data, error } = await supabase
        .from("courses")
        .insert([
          {
            instructor_id: courseData.instructor_id,
            course_title: courseData.title,
            course_description: courseData.description,
            category: courseData.category,
            level: courseData.level,
            rating: 0, // Default rating for new courses
            duration: courseData.duration, // Already validated and converted in controller
            requirements: courseData.requirements || null,
            thumbnail_url: courseData.thumbnail_url || null, // Course thumbnail URL
            // language field exists but we don't set it (will use default or NULL)
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error creating course:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all courses by instructor
  async getCoursesByInstructor(instructorId) {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", instructorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching courses:", error);
      return { success: false, error: error.message };
    }
  },

  // Get a single course by ID
  async getCourseById(courseId) {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("course_id", courseId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching course:", error);
      return { success: false, error: error.message };
    }
  },

  // Update a course
  async updateCourse(courseId, updateData) {
    try {
      // Map frontend field names to database column names
      const mappedData = {};
      
      if (updateData.title) mappedData.course_title = updateData.title;
      if (updateData.description) mappedData.course_description = updateData.description;
      if (updateData.category) mappedData.category = updateData.category;
      if (updateData.level) mappedData.level = updateData.level;
      if (updateData.duration) mappedData.duration = parseInt(updateData.duration);
      if (updateData.requirements !== undefined) mappedData.requirements = updateData.requirements;
      if (updateData.thumbnail_url !== undefined) mappedData.thumbnail_url = updateData.thumbnail_url;
      
      // Don't manually set updated_at, let the trigger handle it
      const { data, error } = await supabase
        .from("courses")
        .update(mappedData)
        .eq("course_id", courseId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error updating course:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete a course and its thumbnail
  async deleteCourse(courseId) {
    try {
      console.log("Starting course deletion for courseId:", courseId);
      
      // First, get the course data to check for thumbnail
      const { data: courseData, error: fetchError } = await supabase
        .from("courses")
        .select("thumbnail_url")
        .eq("course_id", courseId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error("Error fetching course for deletion:", fetchError);
        throw fetchError;
      }

      // Delete thumbnail from Digital Ocean Spaces if it exists
      if (courseData?.thumbnail_url) {
        try {
          const { deleteCourseThumbnail } = await import("../../utils/courseThumbnailUpload.js");
          const deleteResult = await deleteCourseThumbnail(courseData.thumbnail_url);
          if (deleteResult.success) {
            console.log("✅ Course thumbnail deleted from storage");
          } else {
            console.warn("⚠️ Failed to delete thumbnail:", deleteResult.error);
          }
        } catch (thumbnailError) {
          console.warn("⚠️ Error deleting thumbnail (continuing with course deletion):", thumbnailError);
        }
      }
      
      // Delete the course from database
      const { data, error } = await supabase
        .from("courses")
        .delete()
        .eq("course_id", courseId);

      if (error) {
        console.error("Error deleting course:", error);
        throw error;
      }
      
      console.log("Course deleted successfully, affected rows:", data);
      return { success: true, data: { courseId, deleted: true } };
    } catch (error) {
      console.error("Error deleting course:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all courses (for students and public viewing)
  async getPublishedCourses() {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching courses:", error);
      return { success: false, error: error.message };
    }
  },

  // Update course (removed status functionality)
  async updateCourseStatus(courseId, status) {
    try {
      // Since we're not using status, just return success
      return { 
        success: true, 
        data: { course_id: courseId, message: "Status functionality removed" } 
      };
    } catch (error) {
      console.error("Error in updateCourseStatus:", error);
      return { success: false, error: error.message };
    }
  },
};