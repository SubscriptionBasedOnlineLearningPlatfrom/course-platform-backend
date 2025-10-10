import { getOverallAnalytics } from "../../models/admin/analyticsModel.js";

export const getOverallData = async (req, res) => {
  try {
    const data = await getOverallAnalytics();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching overall analytics:", err);
    res.status(500).json({ message: "Failed to fetch overall analytics" });
  }
};
