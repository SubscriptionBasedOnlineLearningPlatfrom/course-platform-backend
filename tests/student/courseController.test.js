import * as courseController from "../../controllers/student/courseController.js"; // Adjust the path
import * as courseModel from "../../models/student/courseModel.js";
import * as authModel from "../../models/student/authModel.js";
import { transporter } from "../../config/nodemailer.js";

jest.mock("../../models/student/courseModel.js");
jest.mock("../../models/student/authModel.js");
jest.mock("../../config/nodemailer.js");

describe("Course Controllers", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, studentId: "student123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("courseDetails", () => {
    it("should return course and modules", async () => {
      const mockCourse = { id: "course1", title: "Course 1" };
      const mockModules = [{ id: "mod1" }, { id: "mod2" }];
      courseModel.courseDetailsByCourseId.mockResolvedValue({ course: mockCourse, modules: mockModules });

      req.params.courseId = "course1";

      await courseController.courseDetails(req, res);

      expect(courseModel.courseDetailsByCourseId).toHaveBeenCalledWith("course1");
      expect(res.json).toHaveBeenCalledWith({ course: mockCourse, modules: mockModules });
    });

    it("should handle errors", async () => {
      courseModel.courseDetailsByCourseId.mockRejectedValue(new Error("DB error"));
      
      await courseController.courseDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe("enrollment", () => {
    it("should create enrollment and send email", async () => {
      req.studentId = "student123";
      req.body.course_id = "course1";

      authModel.findUserById.mockResolvedValue({ email: "test@example.com", username: "user1" });
      courseModel.courseDetailsByCourseId.mockResolvedValue({ course: { course_title: "Course 1" } });
      courseModel.createEnrollment.mockResolvedValue({ id: "enroll1" });
      transporter.sendMail.mockResolvedValue(true);

      await courseController.enrollment(req, res);

      expect(authModel.findUserById).toHaveBeenCalledWith("student123");
      expect(courseModel.createEnrollment).toHaveBeenCalledWith("course1", "student123");
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      courseModel.createEnrollment.mockRejectedValue(new Error("Create enrollment error"));

      await courseController.enrollment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("checkCourseEnrollment", () => {
    it("should return enrollment status", async () => {
      req.studentId = "student1";
      req.params.courseId = "course1";
      courseModel.checkEnrollment.mockResolvedValue(true);

      await courseController.checkCourseEnrollment(req, res);

      expect(courseModel.checkEnrollment).toHaveBeenCalledWith("course1", "student1");
      expect(res.json).toHaveBeenCalledWith({ isEnrolled: true });
    });

    it("should return 401 if missing studentId", async () => {
      req.studentId = null;

      await courseController.checkCourseEnrollment(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should return 400 if missing courseId", async () => {
      req.studentId = "student1";
      req.params.courseId = null;

      await courseController.checkCourseEnrollment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // Similarly, tests can be created for other controller methods:
  // fetchRelatedCourses, viewCommentsWithReplies, postComment,
  // editCommentByStudent, deleteCommentByStudent, postReply,
  // editReplyByStudent, deleteReplyByStudent, updateProgressPercentage,
  // updateQuizMarks, getMarks...

});
