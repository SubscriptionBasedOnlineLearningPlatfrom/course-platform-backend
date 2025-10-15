import { getStudentPlan } from "../../models/student/paymentModel.js";

export const fetchStudentPlan = async (req, res) => {
  try {
    const studentId = req.studentId; 

    const planData = await getStudentPlan(studentId);

    if (!planData) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ plan: planData.plan });
  } catch (error) {
    console.error("Error fetching plan:", error.message);
    res.status(500).json({ message: "Error fetching plan", error: error.message });
  }
};
