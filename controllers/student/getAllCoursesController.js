import { getAllCourses, getFeaturedCourses, getCoursesWithRealRatings } from "../../models/student/courseModel.js";

// GET all courses for "Public users" with optional search
export const fetchCourses = async (req, res) => {
  try {
    const { search } = req.query;
    const courses = await getAllCourses(search);
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }
    res.status(200).json(courses);   
  } catch (err) {
    res.status(500).json({ message: err.message }); 
  }
};

// GET all courses with real ratings from comments
export const fetchCoursesWithRatings = async (req, res) => {
  try {
    const courses = await getCoursesWithRealRatings();
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }
    res.status(200).json(courses);   
  } catch (err) {
    res.status(500).json({ message: err.message }); 
  }
};

// GET featured courses based on real ratings from comments
export const fetchFeaturedCourses = async (req, res) => {
  try {
    const featuredCourses = await getFeaturedCourses();
    if (!featuredCourses || featuredCourses.length === 0) {
      return res.status(404).json({ message: "No featured courses found" });
    }
    res.status(200).json(featuredCourses);   
  } catch (err) {
    res.status(500).json({ message: err.message }); 
  }
};