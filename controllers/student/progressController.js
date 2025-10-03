import { createCourseProgress, updateProgress} from "../../models/student/progressModel.js";

export const trackProgress = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.studentId; //comes from studentAuth middleware

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const progress = await createCourseProgress(studentId, courseId);

    return res.status(201).json({
      message: "Progress tracking initialized for the course",
      progress,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//Update progress for a module 
export const updateModuleProgress = async (req, res) => {
  try {
    const studentId = req.studentId; // from middleware
    const { moduleId, isCompleted } = req.body;

    if (!moduleId || typeof isCompleted !== "boolean") {
      return res.status(400).json({ error: "moduleId and isCompleted are required" });
    }

    const updated = await updateProgress(studentId, moduleId, isCompleted);

    return res.status(200).json({
      message: "Module progress updated successfully",
      updated,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
