import express from 'express';
import { dashboardController, enrolledCourses } from '../../controllers/student/dashboardController.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/', dashboardController)
dashboardRouter.get('/enrolled-courses', enrolledCourses)

export default dashboardRouter;