import {getAllCourses, deleteCourse} from "../../models/admin/courseManagementModel.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const deleteCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteCourse(id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete course" });
  }
};
