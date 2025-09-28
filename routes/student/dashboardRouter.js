import express from 'express';
import { dashboardController, enrolledCourses } from '../../controllers/student/dashboardController.js';
import { studentAuth } from '../../middlewares/authMiddleware.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/', studentAuth, dashboardController)
dashboardRouter.get('/enrolled-courses',studentAuth, enrolledCourses)

export default dashboardRouter;