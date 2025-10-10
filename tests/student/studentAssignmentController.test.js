import { submitAssignment, getStudentSubmissions } from "../../controllers/student/studentAssignmentController.js";
import * as studentAssignmentModel from "../../models/student/studentAssignmentModel.js";
import { s3 } from "../../config/doSpaces.js";

jest.mock("../../models/student/studentAssignmentModel.js");
jest.mock("../../config/doSpaces.js");

describe("Student Assignment Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { courseId: "course123" },
      studentId: "student123",
      file: {
        originalname: "assignment.pdf",
        buffer: Buffer.from("filecontent"),
        mimetype: "application/pdf"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("submitAssignment", () => {
    it("should return 400 if no file uploaded", async () => {
      req.file = null;
      await submitAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded" });
    });

    it("should return 400 if uploaded file is not PDF", async () => {
      req.file.mimetype = "image/png";
      await submitAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Only PDF files allowed" });
    });

    it("should upload file and save submission successfully", async () => {
      const uploadMock = { promise: jest.fn().mockResolvedValue({ Location: "https://fakeurl.com/file.pdf" }) };
      s3.upload.mockReturnValue(uploadMock);

      studentAssignmentModel.saveSubmission.mockResolvedValue({ id: "sub1", fileUrl: "https://fakeurl.com/file.pdf" });

      req.file.mimetype = "application/pdf";

      await submitAssignment(req, res);

      expect(s3.upload).toHaveBeenCalled();
      expect(studentAssignmentModel.saveSubmission).toHaveBeenCalledWith("course123", "student123", "https://fakeurl.com/file.pdf");
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment submitted successfully",
        submission: { id: "sub1", fileUrl: "https://fakeurl.com/file.pdf" }
      });
    });

    it("should handle errors in upload or save", async () => {
      const uploadMock = { promise: jest.fn().mockRejectedValue(new Error("upload failed")) };
      s3.upload.mockReturnValue(uploadMock);

      await submitAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Submission failed" }));
    });
  });

  describe("getStudentSubmissions", () => {
    it("should fetch submissions successfully", async () => {
      const mockSubmissions = [{ id: "sub1" }, { id: "sub2" }];
      studentAssignmentModel.getSubmissionsByStudent.mockResolvedValue(mockSubmissions);

      await getStudentSubmissions(req, res);

      expect(studentAssignmentModel.getSubmissionsByStudent).toHaveBeenCalledWith("course123", "student123");
      expect(res.json).toHaveBeenCalledWith({ submissions: mockSubmissions });
    });

    it("should handle errors fetching submissions", async () => {
      studentAssignmentModel.getSubmissionsByStudent.mockRejectedValue(new Error("fetch error"));

      await getStudentSubmissions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Failed to fetch submissions" }));
    });
  });
});
