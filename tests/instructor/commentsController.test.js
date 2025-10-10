// tests/instructor/commentController.test.js
import { viewStudentsComments, createReplyForComment, updateReplyForComment, deleteReply } from '../../controllers/instructor/commentsController.js';
import * as commentModel from '../../models/instructor/commentModel.js';

describe('Comment Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- viewStudentsComments ----------------
  describe('viewStudentsComments', () => {
    it('should return 200 with comments and replies', async () => {
      const req = { instructorId: 'inst-123' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockData = [{ comment_id: 'c1', replies: [] }];
      jest.spyOn(commentModel, 'studentCommentsModel').mockResolvedValue(mockData);

      await viewStudentsComments(req, res);

      expect(commentModel.studentCommentsModel).toHaveBeenCalledWith('inst-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 500 on error', async () => {
      const req = { instructorId: 'inst-123' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(commentModel, 'studentCommentsModel').mockRejectedValue(new Error('DB Error'));

      await viewStudentsComments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error : ",
        details: 'DB Error'
      });
    });
  });

  // ---------------- createReplyForComment ----------------
  describe('createReplyForComment', () => {
    it('should return 400 if validation fails', async () => {
      const req = { params: { commentId: 'invalid-uuid' }, instructorId: 'inst-123', body: { reply_text: '' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createReplyForComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should create reply and return data', async () => {
      const req = { params: { commentId: '4efd5c01-6037-439e-b871-04c379c0f189' }, instructorId: 'e86b2227-4782-4181-9ac9-0729f19ae1ca', body: { reply_text: 'Hello' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockReply = { reply_id: 'r1', reply_text: 'Hello' };
      jest.spyOn(commentModel, 'createReplyModel').mockResolvedValue(mockReply);

      await createReplyForComment(req, res);

      expect(commentModel.createReplyModel).toHaveBeenCalledWith(
        '4efd5c01-6037-439e-b871-04c379c0f189',
        'e86b2227-4782-4181-9ac9-0729f19ae1ca',
        'Hello'
      );
      expect(res.json).toHaveBeenCalledWith(mockReply);
    });

    it('should return 500 on error', async () => {
      const req = { params: { commentId: '4efd5c01-6037-439e-b871-04c379c0f189' }, instructorId: 'e86b2227-4782-4181-9ac9-0729f19ae1ca', body: { reply_text: 'Hello' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(commentModel, 'createReplyModel').mockRejectedValue(new Error('DB Error'));

      await createReplyForComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        details: 'DB Error'
      });
    });
  });

  // ---------------- updateReplyForComment ----------------
  describe('updateReplyForComment', () => {
    it('should return 400 if validation fails', async () => {
      const req = { params: { replyId: 'r1' }, body: { reply_text: '' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await updateReplyForComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should update reply and return data', async () => {
      const req = { params: { replyId: 'r1' }, body: { reply_text: 'Updated text' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockReply = { reply_id: 'r1', reply_text: 'Updated text' };
      jest.spyOn(commentModel, 'updateReplyModel').mockResolvedValue(mockReply);

      await updateReplyForComment(req, res);

      expect(commentModel.updateReplyModel).toHaveBeenCalledWith('r1', 'Updated text');
      expect(res.json).toHaveBeenCalledWith(mockReply);
    });

    it('should return 500 on error', async () => {
      const req = { params: { replyId: 'r1' }, body: { reply_text: 'Updated text' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(commentModel, 'updateReplyModel').mockRejectedValue(new Error('DB Error'));

      await updateReplyForComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        details: 'DB Error'
      });
    });
  });

  // ---------------- deleteReply ----------------
  describe('deleteReply', () => {
    it('should return 400 if reply_id missing', async () => {
      const req = { params: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

      await deleteReply(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "reply_id is required" });
    });

    it('should delete reply and return 200', async () => {
      const req = { params: { reply_id: 'r1' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      jest.spyOn(commentModel, 'deleteReplyModel').mockResolvedValue(true);

      await deleteReply(req, res);

      expect(commentModel.deleteReplyModel).toHaveBeenCalledWith('r1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      const req = { params: { reply_id: 'r1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

      jest.spyOn(commentModel, 'deleteReplyModel').mockRejectedValue(new Error('DB Error'));

      await deleteReply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        details: 'DB Error'
      });
    });
  });

});
