import { da } from "zod/v4/locales";
import { supabase } from "../../config/supabaseClient.js";
import { dashboardModel, enrolledCoursesModel } from "../../models/student/dashboardModel.js";

// get enrolled courses counts, streaks and certificates
export const dashboardController = async (req, res) => {
    try {
        const studentId = req.studentId;
        const {dashboard: dashboardData, streak: streakData} =await dashboardModel(studentId);

        return res.status(200).json({
            dashboard:dashboardData,
            streak:streakData
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

// view enrolled courses
export const enrolledCourses = async (req, res) => {
    try {
        const studentId = req.studentId;   
        const courses = await enrolledCoursesModel(studentId);
        return res.status(200).json({ courses });

    }
    catch (error) { 
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}