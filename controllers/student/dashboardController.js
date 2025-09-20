import { da } from "zod/v4/locales";
import { supabase } from "../../config/supabaseClient.js";
import { dashboardModel, enrolledCoursesModel } from "../../models/student/dashboardModels.js";

export const dashboardController = async (req, res) => {
    try {
        const studentId = 'd6279018-9f8c-499a-bb78-f40874d2903d' //req.studentId;
        const {dashboard: dashboardData, streak: streakData} = dashboardModel(studentId);

        return res.status(200).json({
            dashboard:dashboardData,
            streak:streakData
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

export const enrolledCourses = async (req, res) => {
    try {
        const studentId = 'd6279018-9f8c-499a-bb78-f40874d2903d' //req.studentId;   
        const courses = enrolledCoursesModel(studentId);
        
        return res.status(200).json({ courses });

    }
    catch (error) { 
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}