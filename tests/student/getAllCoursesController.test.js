import * as courseController from "../../controllers/student/getAllCoursesController.js";
import * as courseModel from "../../models/student/courseModel.js";

jest.mock("../../models/student/courseModel.js");

describe("Course Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("fetchCourses", () => {
    it("should return courses with status 200", async () => {
      const mockCourses = [{ id: 1, name: "Course 1" }];
      courseModel.getAllCourses.mockResolvedValue(mockCourses);
      req.query.search = "test";

      await courseController.fetchCourses(req, res);

      expect(courseModel.getAllCourses).toHaveBeenCalledWith("test");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourses);
    });

    it("should return 404 when no courses found", async () => {
      courseModel.getAllCourses.mockResolvedValue([]);
      
      await courseController.fetchCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No courses found" });
    });

    it("should handle errors and return 500", async () => {
      courseModel.getAllCourses.mockRejectedValue(new Error("DB error"));

      await courseController.fetchCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "DB error" }));
    });
  });

  describe("fetchCoursesWithRatings", () => {
    it("should return courses with ratings", async () => {
      const mockCourses = [{ id: 1, rating: 4.5 }];
      courseModel.getCoursesWithRealRatings.mockResolvedValue(mockCourses);

      await courseController.fetchCoursesWithRatings(req, res);

      expect(courseModel.getCoursesWithRealRatings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourses);
    });

    it("should return 404 if no courses with ratings", async () => {
      courseModel.getCoursesWithRealRatings.mockResolvedValue([]);

      await courseController.fetchCoursesWithRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No courses found" });
    });

    it("should handle errors", async () => {
      courseModel.getCoursesWithRealRatings.mockRejectedValue(new Error("DB error"));

      await courseController.fetchCoursesWithRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "DB error" }));
    });
  });

  describe("fetchFeaturedCourses", () => {
    it("should return featured courses", async () => {
      const mockFeatured = [{ id: 1, name: "Featured" }];
      courseModel.getFeaturedCourses.mockResolvedValue(mockFeatured);

      await courseController.fetchFeaturedCourses(req, res);

      expect(courseModel.getFeaturedCourses).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFeatured);
    });

    it("should return 404 if no featured courses found", async () => {
      courseModel.getFeaturedCourses.mockResolvedValue([]);

      await courseController.fetchFeaturedCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No featured courses found" });
    });

    it("should handle errors", async () => {
      courseModel.getFeaturedCourses.mockRejectedValue(new Error("DB error"));

      await courseController.fetchFeaturedCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "DB error" }));
    });
  });
});
