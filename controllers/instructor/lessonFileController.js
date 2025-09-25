import { s3 } from "../../config/doSpaces.js";
import {
  saveVideoUrl,
  saveNoteUrl,
  saveAssignmentUrl,
  getLessonById,
  updateLessonResource,
} from "../../models/instructor/lessonFileModel.js";

// Helper to upload file to DO
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

  return data.Location; // public URL
};

// Upload Video
export const addVideoToLesson = async (req, res) => {
  const { lessonId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });
  if (!file.mimetype.startsWith("video/"))
    return res.status(400).json({ message: "Only video files allowed" });

  try {
    const fileUrl = await uploadToDO(file, "videos/");
    const lesson = await saveVideoUrl(lessonId, fileUrl);
    res.json({ message: "Video uploaded", lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Upload Note
export const addNoteToLesson = async (req, res) => {
  const { lessonId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });
  if (file.mimetype !== "application/pdf")
    return res.status(400).json({ message: "Only PDF files allowed" });

  try {
    const fileUrl = await uploadToDO(file, "notes/");
    const lesson = await saveNoteUrl(lessonId, fileUrl);
    res.json({ message: "Note uploaded", lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Upload Assignment
export const addAssignmentToLesson = async (req, res) => {
  const { lessonId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });
  if (file.mimetype !== "application/pdf")
    return res.status(400).json({ message: "Only PDF assignments allowed" });

  try {
    const fileUrl = await uploadToDO(file, "assignments/");
    const lesson = await saveAssignmentUrl(lessonId, fileUrl);
    res.json({ message: "Assignment uploaded", lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

//Delete Resource
export const deleteLessonResource = async (req, res) => {
  try {
    const { lessonId, type } = req.params;

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Choose column + file URL
    let column, fileUrl;
    if (type === "Video") {
      column = "video_url";
      fileUrl = lesson.video_url;
    } else if (type === "Note") {
      column = "note_url";
      fileUrl = lesson.note_url;
    } else if (type === "Assignment") {
      column = "assignment_url";
      fileUrl = lesson.assignment_url;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!fileUrl) {
      return res.status(400).json({ error: "No resource found for this lesson" });
    }

    // Extract object key from URL
    const baseUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT.replace("https://","")}/`;
    const objectKey = fileUrl.replace(baseUrl, "");
    if (!objectKey) return res.status(400).json({ error: "Invalid file URL" });


    // Delete from DigitalOcean Space
    await s3
      .deleteObject({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: objectKey,
      })
      .promise();

    // Update DB
    await updateLessonResource(lessonId, column);

    res.json({ message: `${type} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete resource" });
  }
};
