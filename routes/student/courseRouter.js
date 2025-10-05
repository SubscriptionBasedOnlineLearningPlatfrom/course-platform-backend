import express from 'express'
import { checkCourseEnrollment, courseDetails, enrollment, fetchRelatedCourses, postComment, postReply, viewCommentsWithReplies } from '../../controllers/student/courseController.js';
import { fetchCourses, fetchCoursesWithRatings, fetchFeaturedCourses } from "../../controllers/student/getAllCoursesController.js";
import { studentAuth } from '../../middlewares/authMiddleware.js';

const courseRouter = express.Router();

courseRouter.get("/featured", fetchFeaturedCourses);
courseRouter.get("/with-ratings", fetchCoursesWithRatings);
courseRouter.get("/related-courses/:category",fetchRelatedCourses);
courseRouter.get("/comments-with-replies/:courseId", viewCommentsWithReplies);
courseRouter.get("/check-enrollment/:courseId",studentAuth, checkCourseEnrollment);
courseRouter.get("/", fetchCourses);
courseRouter.get('/:courseId', courseDetails);
courseRouter.post('/enrollment',studentAuth, enrollment);
courseRouter.post("/create-comment/:courseId",studentAuth, postComment);
courseRouter.post("/create-reply",studentAuth, postReply);

export default courseRouter;