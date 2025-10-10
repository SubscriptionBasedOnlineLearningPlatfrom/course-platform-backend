// tests/instructor/chapterController.test.js
import { addChapter, deleteChapter } from '../../controllers/instructor/chapterController.js';
import * as chapterModel from '../../models/instructor/chapterModel.js';

describe('Chapter Controller', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- addChapter ----------------
  describe('addChapter', () => {
    it('should return 400 if lesson_title is missing', async () => {
      const req = { params: { moduleId: '1' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await addChapter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Chapter title is required' });
    });

    it('should create a chapter and return 201', async () => {
      const req = { params: { moduleId: '1' }, body: { lesson_title: 'Test Chapter' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock createChapter from your model
      jest.spyOn(chapterModel, 'createChapter').mockResolvedValue({ id: 1, lesson_title: 'Test Chapter' });

      await addChapter(req, res);

      expect(chapterModel.createChapter).toHaveBeenCalledWith('1', 'Test Chapter');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Chapter created',
        chapter: { id: 1, lesson_title: 'Test Chapter' },
      });
    });

    it('should handle errors and return 500', async () => {
      const req = { params: { moduleId: '1' }, body: { lesson_title: 'Test Chapter' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(chapterModel, 'createChapter').mockRejectedValue(new Error('DB Error'));

      await addChapter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to add chapter',
        error: 'DB Error',
      });
    });
  });

  // ---------------- deleteChapter ----------------
  describe('deleteChapter', () => {
    it('should return 404 if chapter not found', async () => {
      const req = { params: { lessonId: '1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(chapterModel, 'removeChapter').mockResolvedValue(false);

      await deleteChapter(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Chapter not found or could not be deleted',
      });
    });

    it('should delete chapter and return 200', async () => {
      const req = { params: { lessonId: '1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(chapterModel, 'removeChapter').mockResolvedValue(true);

      await deleteChapter(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Chapter deleted successfully' });
    });

    it('should handle errors and return 500', async () => {
      const req = { params: { lessonId: '1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(chapterModel, 'removeChapter').mockRejectedValue(new Error('DB Error'));

      await deleteChapter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to delete chapter',
        error: 'DB Error',
      });
    });
  });
});
