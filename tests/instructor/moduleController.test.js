// test/instructor/moduleController.test.js
import * as moduleController from '../../controllers/instructor/moduleController.js';
import * as moduleModel from '../../models/instructor/moduleModel.js';

describe('Module Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('addModule', () => {
    it('should return 400 if title is missing', async () => {
      req.params.courseId = 'course1';
      req.body.title = '';

      await moduleController.addModule(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Module title is required' });
    });

    it('should create a module and return 201', async () => {
      req.params.courseId = 'course1';
      req.body.title = 'New Module';
      const mockModule = { id: 'module1', title: 'New Module' };

      jest.spyOn(moduleModel, 'createModule').mockResolvedValue(mockModule);

      await moduleController.addModule(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Module created', module: mockModule });
    });

    it('should handle errors and return 500', async () => {
      req.params.courseId = 'course1';
      req.body.title = 'New Module';

      jest.spyOn(moduleModel, 'createModule').mockRejectedValue(new Error('DB Error'));

      await moduleController.addModule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Module creation failed',
        error: 'DB Error',
      });
    });
  });

  describe('listModules', () => {
    it('should return modules for a course', async () => {
      req.params.courseId = 'course1';
      const mockModules = [{ id: 'm1', title: 'Module 1' }, { id: 'm2', title: 'Module 2' }];

      jest.spyOn(moduleModel, 'getModulesByCourse').mockResolvedValue(mockModules);

      await moduleController.listModules(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ modules: mockModules });
    });

    it('should handle errors and return 500', async () => {
      req.params.courseId = 'course1';
      jest.spyOn(moduleModel, 'getModulesByCourse').mockRejectedValue(new Error('DB Error'));

      await moduleController.listModules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch modules',
        error: 'DB Error',
      });
    });
  });

  describe('deleteModule', () => {
    it('should delete a module successfully', async () => {
      req.params.moduleId = 'module1';
      jest.spyOn(moduleModel, 'removeModule').mockResolvedValue(true);

      await moduleController.deleteModule(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Module deleted successfully' });
    });

    it('should return 404 if module not found', async () => {
      req.params.moduleId = 'module1';
      jest.spyOn(moduleModel, 'removeModule').mockResolvedValue(false);

      await moduleController.deleteModule(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Module not found or could not be deleted',
      });
    });

    it('should handle errors and return 500', async () => {
      req.params.moduleId = 'module1';
      jest.spyOn(moduleModel, 'removeModule').mockRejectedValue(new Error('DB Error'));

      await moduleController.deleteModule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to delete module',
        error: 'DB Error',
      });
    });
  });
});
