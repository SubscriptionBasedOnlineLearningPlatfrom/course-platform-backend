import * as progressController from "../../controllers/student/progressController.js";
import * as progressModel from "../../models/student/progressModel.js";

jest.mock("../../models/student/progressModel.js");

describe("Progress Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, studentId: "student123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("trackProgress", () => {
    it("returns 400 if courseId missing", async () => {
      req.body = {};

      await progressController.trackProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "courseId is required" });
    });

    it("creates progress and responds with 201", async () => {
      req.body = { courseId: "course1" };
      progressModel.createCourseProgress.mockResolvedValue({ courseId: "course1", progress: 0 });

      await progressController.trackProgress(req, res);

      expect(progressModel.createCourseProgress).toHaveBeenCalledWith("student123", "course1");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Progress tracking initialized for the course",
        progress: { courseId: "course1", progress: 0 },
      });
    });

    it("handles errors with 500 status", async () => {
      req.body = { courseId: "course1" };
      progressModel.createCourseProgress.mockRejectedValue(new Error("DB error"));

      await progressController.trackProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("updateModuleProgress", () => {
    it("returns 400 if moduleId or isCompleted missing/invalid", async () => {
      req.body = { };
      await progressController.updateModuleProgress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      req.body = { moduleId: "mod1" };
      await progressController.updateModuleProgress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("updates module progress and responds 200", async () => {
      req.body = { moduleId: "mod1", isCompleted: true };
      progressModel.updateProgress.mockResolvedValue({ moduleId: "mod1", isCompleted: true });

      await progressController.updateModuleProgress(req, res);

      expect(progressModel.updateProgress).toHaveBeenCalledWith("student123", "mod1", true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Module progress updated successfully",
        updated: { moduleId: "mod1", isCompleted: true },
      });
    });

    it("handles errors with 500 status", async () => {
      req.body = { moduleId: "mod1", isCompleted: true };
      progressModel.updateProgress.mockRejectedValue(new Error("DB error"));

      await progressController.updateModuleProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });

  describe("fetchCourseProgress", () => {
    it("returns 400 if studentId or courseId missing", async () => {
      req.studentId = null;
      req.params.courseId = "course1";
      await progressController.fetchCourseProgress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      req.studentId = "student123";
      req.params.courseId = null;
      await progressController.fetchCourseProgress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns modules progress data", async () => {
      req.studentId = "student123";
      req.params.courseId = "course1";
      const mockModules = [{ moduleId: "mod1", progress: 80 }];
      progressModel.getCourseProgress.mockResolvedValue(mockModules);

      await progressController.fetchCourseProgress(req, res);

      expect(progressModel.getCourseProgress).toHaveBeenCalledWith("student123", "course1");
      expect(res.json).toHaveBeenCalledWith({ modules: mockModules });
    });

    it("handles errors with 500 status", async () => {
      req.studentId = "student123";
      req.params.courseId = "course1";
      progressModel.getCourseProgress.mockRejectedValue(new Error("DB error"));

      await progressController.fetchCourseProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });
});
