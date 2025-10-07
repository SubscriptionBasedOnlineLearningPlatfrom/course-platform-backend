import { getSubmissionsByCourse, updateSubmissionGrade } from "../../models/instructor/submissionModel.js";

//all submissions for a course
export const getSubmissions = async (req, res) => {
  const { courseId } = req.params;
  try {
    const submissions = await getSubmissionsByCourse(courseId);
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//grade for a submission
export const updateGrade = async (req, res) => {
  const { submissionId } = req.params;
  const { grade } = req.body;

  if (!grade) return res.status(400).json({ message: "Grade is required" });

  try {
    const updated = await updateSubmissionGrade(submissionId, grade);
    res.json({ message: "Grade updated successfully", submission: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
