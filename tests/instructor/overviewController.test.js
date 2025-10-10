// test/instructor/overviewController.test.js
import * as overviewController from '../../controllers/instructor/overviewController.js';
import * as overviewModel from '../../models/instructor/overviewModel.js';

describe('Overview Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, instructorId: 'instructor1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('EnrollementOverview', () => {
    it('should return enrollment data', async () => {
      const mockData = { totalStudents: 10, totalCourses: 3 };
      jest.spyOn(overviewModel, 'enrollmentOverviewModel').mockResolvedValue(mockData);

      await overviewController.EnrollementOverview(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors and return 500', async () => {
      jest.spyOn(overviewModel, 'enrollmentOverviewModel').mockRejectedValue(new Error('DB Error'));

      await overviewController.EnrollementOverview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        details: 'DB Error',
      });
    });
  });

  describe('viewCreatedCourses', () => {
    it('should return created courses', async () => {
      const mockCourses = [{ id: 'c1', title: 'Course 1' }];
      jest.spyOn(overviewModel, 'createdCoursesModel').mockResolvedValue(mockCourses);

      await overviewController.viewCreatedCourses(req, res);

      expect(res.json).toHaveBeenCalledWith(mockCourses);
    });

    it('should handle errors and return 500', async () => {
      jest.spyOn(overviewModel, 'createdCoursesModel').mockRejectedValue(new Error('DB Error'));

      await overviewController.viewCreatedCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        details: 'DB Error',
      });
    });
  });

  describe('editCreatedCourse', () => {
    it('should edit course details and return updated data', async () => {
      req.params.courseId = 'course1';
      req.body = { course_title: 'Updated', course_description: 'Desc', category: 'Cat' };
      const mockData = { id: 'course1', course_title: 'Updated' };

      jest.spyOn(overviewModel, 'editCreatedCourseModel').mockResolvedValue(mockData);

      await overviewController.editCreatedCourse(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors and return 500', async () => {
      req.params.courseId = 'course1';
      req.body = { course_title: 'Updated', course_description: 'Desc', category: 'Cat' };

      jest.spyOn(overviewModel, 'editCreatedCourseModel').mockRejectedValue(new Error('DB Error'));

      await overviewController.editCreatedCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        details: 'DB Error',
      });
    });
  });
});
