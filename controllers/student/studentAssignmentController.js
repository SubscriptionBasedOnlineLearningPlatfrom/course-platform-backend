import { s3 } from "../../config/doSpaces.js";
import { saveSubmission, getSubmissionsByStudent } from "../../models/student/studentAssignmentModel.js";

const uploadToDO = async (file, folder) => {
  const fileName = `${folder}${Date.now()}-${file.originalname}`;
  const data = await s3
    .upload({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    })
    .promise();

  return data.Location;
};

//submit assignment
export const submitAssignment = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.studentId; 
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });
  if (file.mimetype !== "application/pdf")
    return res.status(400).json({ message: "Only PDF files allowed" });

  try {
    const fileUrl = await uploadToDO(file, "submissions/");
    const submission = await saveSubmission(courseId, studentId, fileUrl);
    res.json({ message: "Assignment submitted successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

//fetch all submissions for a student in a course
export const getStudentSubmissions = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.studentId;

  try {
    const submissions = await getSubmissionsByStudent(courseId, studentId);
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch submissions", error: err.message });
  }
};
