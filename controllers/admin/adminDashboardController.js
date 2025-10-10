import {
  getDashboardStats,
  getRevenueData,
  getEnrollmentData,
  getCourseDistribution
} from "../../models/admin/adminDashboardModel.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    const revenueData = await getRevenueData();
    const enrollmentData = await getEnrollmentData();
    const courseDistribution = await getCourseDistribution();

    res.status(200).json({
      stats,
      revenueData,
      enrollmentData,
      courseDistribution,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load admin dashboard",
      error: err.message,
    });
  }
};
