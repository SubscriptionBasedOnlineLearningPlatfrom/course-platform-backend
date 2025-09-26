import express from 'express';
import { editCreatedCourse, EnrollementOverview, viewCreatedCourses } from '../../controllers/instructor/overviewController.js';
import { auth } from '../../middlewares/authMiddleware.js';

const OverviewRouter = express.Router();

OverviewRouter.get("/enrollment",auth, EnrollementOverview);
OverviewRouter.get("/created-courses",auth, viewCreatedCourses);
OverviewRouter.put("/edit-course-details/:courseId", editCreatedCourse);

export default OverviewRouter;