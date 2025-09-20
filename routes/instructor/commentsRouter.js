import express from 'express'
import { createReplyForComment, deleteReply, updateReplyForComment, viewStudentsComments } from '../../Controllers/Instructor/CommentsController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const commentRouter = express.Router();

commentRouter.get("/comments",auth, viewStudentsComments);
commentRouter.post("/:commentId/replies",auth, createReplyForComment);
commentRouter.put("/update-reply/:replyId", updateReplyForComment);
commentRouter.delete("/delete-reply/:replyId", deleteReply);


export default commentRouter;