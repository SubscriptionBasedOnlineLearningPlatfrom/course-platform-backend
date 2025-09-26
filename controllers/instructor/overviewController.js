import { createdCoursesModel, editCreatedCourseModel, enrollmentOverviewModel } from "../../models/instructor/overviewModel.js";

// Enrollement Overview
export const EnrollementOverview = async (req,res) => {
    try {
        const instructorId = req.instructorId;
        const data =await enrollmentOverviewModel(instructorId);
        res.json(data);

    } catch (error) {
        res.status(500).json({error : "Internal server error", details : error.message});
    }
}

// view created courses
export const viewCreatedCourses = async (req,res,next) => {
    try {
        const instructorId = req.instructorId;
        const data = await createdCoursesModel(instructorId);
        res.json(data);

    } catch (error) {
        return res.status(500).json({error : "Internal server error", details : error.message });
    }
}

// edit the course details like name, category, description
export const editCreatedCourse = async (req,res,next) => {
    try {
        const courseId = req.params.courseId;
        const { course_title, course_description, category } = req.body;
        const data =await editCreatedCourseModel(course_title, course_description, category);
        res.json(data);

    } catch (error) {
        return res.status(500).json({error : "Internal server error", details : error.message });
    }
}
