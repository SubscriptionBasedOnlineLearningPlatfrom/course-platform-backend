import { getAllCourses } from "../../models/courseModel.js";

// GET all courses for "Public users"
export const fetchCourses = async (req, res) => {
  try {
    const courses = await getAllCourses();
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }
    res.status(200).json(courses);   
  } catch (err) {
    res.status(500).json({ message: err.message }); 
  }
};