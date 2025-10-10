import { listModules } from "../../controllers/student/courseContentController.js";
import * as courseContentModel from "../../models/student/courseContentModel.js";

jest.mock("../../models/student/courseContentModel.js");

describe("listModules controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      studentId: "student123",
      params: { courseId: "course456" },
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should fetch and return modules successfully", async () => {
    const mockModules = [{ id: 1, title: "Module 1" }, { id: 2, title: "Module 2" }];
    courseContentModel.getModulesByCourse.mockResolvedValue(mockModules);
    
    await listModules(req, res);

    expect(courseContentModel.getModulesByCourse).toHaveBeenCalledWith("course456", "student123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ modules: mockModules });
  });

  it("should handle errors and return 500 status", async () => {
    const error = new Error("Database error");
    courseContentModel.getModulesByCourse.mockRejectedValue(error);

    await listModules(req, res);

    expect(courseContentModel.getModulesByCourse).toHaveBeenCalledWith("course456", "student123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch modules",
      error: error.message,
    });
  });

});
