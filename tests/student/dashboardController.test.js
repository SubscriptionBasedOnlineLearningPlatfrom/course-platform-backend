import * as dashboardController from "../../controllers/student/dashboardController.js";
import * as dashboardModel from "../../models/student/dashboardModel.js";

jest.mock("../../models/student/dashboardModel.js");

describe("Dashboard Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { studentId: "student123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("dashboardController", () => {
    it("should return dashboard and streak data", async () => {
      const mockData = { dashboard: { coursesCount: 5 }, streak: { current: 3 } };
      dashboardModel.dashboardModel.mockResolvedValue(mockData);

      await dashboardController.dashboardController(req, res);

      expect(dashboardModel.dashboardModel).toHaveBeenCalledWith("student123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should handle errors and send 500", async () => {
      dashboardModel.dashboardModel.mockRejectedValue(new Error("DB error"));

      await dashboardController.dashboardController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Internal Server Error" }));
    });
  });

  describe("enrolledCourses", () => {
    it("should return enrolled courses", async () => {
      const mockCourses = [{ id: "course1" }, { id: "course2" }];
      dashboardModel.enrolledCoursesModel.mockResolvedValue(mockCourses);

      await dashboardController.enrolledCourses(req, res);

      expect(dashboardModel.enrolledCoursesModel).toHaveBeenCalledWith("student123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ courses: mockCourses });
    });

    it("should handle errors and send 500", async () => {
      dashboardModel.enrolledCoursesModel.mockRejectedValue(new Error("DB error"));

      await dashboardController.enrolledCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Internal Server Error" }));
    });
  });
});
