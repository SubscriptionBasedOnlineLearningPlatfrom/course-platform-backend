import { getStudentActivityData } from "../../models/admin/analyticsModel.js";

export const getStudentActivity = async (req, res) => {
  try {
    const data = await getStudentActivityData();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching student activity data:", err);
    res.status(500).json({ message: "Failed to fetch student activity data" });
  }
};
