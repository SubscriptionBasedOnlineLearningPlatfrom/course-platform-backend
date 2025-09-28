import { supabase } from "../../config/supabaseClient.js";

export const dashboardModel = async (studentId) => {
    const { data: dashboardData, error } = await supabase
            .from('student_dashboard')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();
        if (error) {
            console.log(error);
            throw new Error(error.message);
        }

        const { data: streakData, error: streakErr } = await supabase.rpc(
            'get_current_streak',
            { p_student: studentId }
        );
        
        if (streakErr) {
            throw new Error(streakErr.message);
        }
        return {
            dashboard:dashboardData,
            streak:streakData
        };
}

export const enrolledCoursesModel = async (studentId) => {
    const { data: courses, error } = await supabase
            .from('enrolledcoursedetails')
            .select('*')
            .eq('student_id', studentId);   

        if (error) {
            throw new Error(error.message);
        }
        return courses;
}