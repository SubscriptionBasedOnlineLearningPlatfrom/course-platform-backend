// test/instructor/courseController.test.js
import { CourseController } from '../../controllers/instructor/courseController.js';
import * as CourseModel from '../../models/instructor/courseModel.js';

describe('CourseController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {}, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { title: '', description: '', category: '', level: '' };
      await CourseController.createCourse(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Title, description, category, and level are required',
      });
    });

    it('should create a course successfully', async () => {
      req.body = { title: 'Test', description: 'Desc', category: 'Cat', level: 'Beginner' };
      req.user.instructor_id = 'inst1';
      const mockResult = { success: true, data: { id: 1 } };
      jest.spyOn(CourseModel.CourseModel, 'createCourse').mockResolvedValue(mockResult);

      await CourseController.createCourse(req, res);

      expect(CourseModel.CourseModel.createCourse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course created successfully',
        data: mockResult.data,
      });
    });

    it('should handle errors and return 500', async () => {
      req.body = { title: 'Test', description: 'Desc', category: 'Cat', level: 'Beginner' };
      req.user.instructor_id = 'inst1';
      jest.spyOn(CourseModel.CourseModel, 'createCourse').mockRejectedValue(new Error('DB Error'));

      await CourseController.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });
  });

  describe('getInstructorCourses', () => {
    it('should return instructor courses successfully', async () => {
      req.user.instructor_id = 'inst1';
      const mockResult = { success: true, data: [{ id: 1 }] };
      jest.spyOn(CourseModel.CourseModel, 'getCoursesByInstructor').mockResolvedValue(mockResult);

      await CourseController.getInstructorCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockResult.data });
    });

    it('should handle errors and return 500', async () => {
      req.user.instructor_id = 'inst1';
      jest.spyOn(CourseModel.CourseModel, 'getCoursesByInstructor').mockRejectedValue(new Error('DB Error'));

      await CourseController.getInstructorCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' });
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      req.params.courseId = 'course1';
      req.user.instructor_id = 'inst1';
      jest.spyOn(CourseModel.CourseModel, 'getCourseById').mockResolvedValue({ success: true, data: { instructor_id: 'inst1' } });
      jest.spyOn(CourseModel.CourseModel, 'deleteCourse').mockResolvedValue({ success: true, data: { id: 'course1' } });

      await CourseController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
        data: { id: 'course1' },
      });
    });

    it('should return 403 if instructor does not own the course', async () => {
      req.params.courseId = 'course1';
      req.user.instructor_id = 'inst2';
      jest.spyOn(CourseModel.CourseModel, 'getCourseById').mockResolvedValue({ success: true, data: { instructor_id: 'inst1' } });

      await CourseController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "You don't have permission to delete this course",
      });
    });

    it('should handle errors and return 500', async () => {
      req.params.courseId = 'course1';
      req.user.instructor_id = 'inst1';
      jest.spyOn(CourseModel.CourseModel, 'getCourseById').mockRejectedValue(new Error('DB Error'));

      await CourseController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' });
    });
  });

  // Similarly, you can add tests for updateCourse, getCourseById, getPublishedCourses, updateCourseStatus
});
