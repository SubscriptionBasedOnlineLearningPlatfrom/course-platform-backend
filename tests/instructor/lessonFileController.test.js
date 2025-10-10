// test/instructor/lessonFileController.test.js
import * as lessonController from '../../controllers/instructor/lessonFileController.js';
import * as lessonModel from '../../models/instructor/lessonFileModel.js';
import { s3 } from '../../config/doSpaces.js';

jest.mock('../../config/doSpaces.js', () => ({
  s3: {
    upload: jest.fn().mockReturnThis(),
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  },
}));

describe('LessonFileController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('addVideoToLesson', () => {
    it('should return 400 if no file uploaded', async () => {
      req.params.lessonId = 'lesson1';
      await lessonController.addVideoToLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded' });
    });

    it('should return 400 if file is not a video', async () => {
      req.params.lessonId = 'lesson1';
      req.file = { mimetype: 'application/pdf', originalname: 'file.pdf', buffer: Buffer.from('') };
      await lessonController.addVideoToLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only video files allowed' });
    });

    it('should upload video and save URL', async () => {
      req.params.lessonId = 'lesson1';
      req.file = { mimetype: 'video/mp4', originalname: 'video.mp4', buffer: Buffer.from('') };

      s3.promise.mockResolvedValue({ Location: 'http://video.url/video.mp4' });
      jest.spyOn(lessonModel, 'saveVideoUrl').mockResolvedValue({ id: 'lesson1', video_url: 'http://video.url/video.mp4' });

      await lessonController.addVideoToLesson(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Video uploaded',
        lesson: { id: 'lesson1', video_url: 'http://video.url/video.mp4' },
      });
    });
  });

  describe('addNoteToLesson', () => {
    it('should return 400 if file is not PDF', async () => {
      req.params.lessonId = 'lesson1';
      req.file = { mimetype: 'video/mp4', originalname: 'video.mp4', buffer: Buffer.from('') };

      await lessonController.addNoteToLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only PDF files allowed' });
    });

    it('should upload note and save URL', async () => {
      req.params.lessonId = 'lesson1';
      req.file = { mimetype: 'application/pdf', originalname: 'note.pdf', buffer: Buffer.from('') };

      s3.promise.mockResolvedValue({ Location: 'http://note.url/note.pdf' });
      jest.spyOn(lessonModel, 'saveNoteUrl').mockResolvedValue({ id: 'lesson1', note_url: 'http://note.url/note.pdf' });

      await lessonController.addNoteToLesson(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Note uploaded',
        lesson: { id: 'lesson1', note_url: 'http://note.url/note.pdf' },
      });
    });
  });

  describe('addAssignmentToLesson', () => {
    it('should return 400 if file is not PDF', async () => {
      req.params.lessonId = 'lesson1';
      req.file = { mimetype: 'video/mp4', originalname: 'video.mp4', buffer: Buffer.from('') };

      await lessonController.addAssignmentToLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only PDF assignments allowed' });
    });

    it('should upload assignment and save URL', async () => {
      req.params.lessonId = 'lesson1';
      req.file = { mimetype: 'application/pdf', originalname: 'assignment.pdf', buffer: Buffer.from('') };

      s3.promise.mockResolvedValue({ Location: 'http://assignment.url/assignment.pdf' });
      jest.spyOn(lessonModel, 'saveAssignmentUrl').mockResolvedValue({ id: 'lesson1', assignment_url: 'http://assignment.url/assignment.pdf' });

      await lessonController.addAssignmentToLesson(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Assignment uploaded',
        lesson: { id: 'lesson1', assignment_url: 'http://assignment.url/assignment.pdf' },
      });
    });
  });

  describe('deleteLessonResource', () => {
    it('should return 404 if lesson not found', async () => {
      req.params.lessonId = 'lesson1';
      req.params.type = 'Video';
      jest.spyOn(lessonModel, 'getLessonById').mockResolvedValue(null);

      await lessonController.deleteLessonResource(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lesson not found' });
    });

    it('should delete video resource successfully', async () => {
      req.params.lessonId = 'lesson1';
      req.params.type = 'Video';
      const lesson = { video_url: 'https://bucket.endpoint/videos/file.mp4' };
      jest.spyOn(lessonModel, 'getLessonById').mockResolvedValue(lesson);
      s3.promise.mockResolvedValue({});
      jest.spyOn(lessonModel, 'updateLessonResource').mockResolvedValue(true);

      process.env.DO_SPACES_BUCKET = 'bucket';
      process.env.DO_SPACES_ENDPOINT = 'https://endpoint';

      await lessonController.deleteLessonResource(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Video deleted successfully' });
    });
  });
});
