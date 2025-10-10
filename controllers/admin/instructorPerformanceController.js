import { getInstructorEnrollments } from "../../models/admin/analyticsModel.js";

export const getInstructorPerformance = async (req, res) => {
  try {
    const topInstructors = await getInstructorEnrollments();
    res.status(200).json(topInstructors);
  } catch (err) {
    console.error("Error fetching instructor performance:", err);
    res.status(500).json({ message: "Failed to fetch instructor performance" });
  }
};
