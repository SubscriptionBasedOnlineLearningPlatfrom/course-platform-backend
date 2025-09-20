import { supabase } from "../../config/supabaseClient.js";


export const dashboardModel = async (studentId) => {
    const { data: dashboardData, error } = await supabase
            .from('student_dashboard')
            .select('*')
            .eq('student_id', studentId)
            .single();
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: streakData, error: streakErr } = await supabase.rpc(
            'get_current_streak',
            { p_student: studentId }
        );
        
        if (streakErr) {
            console.log(streakErr);
            return res.status(500).json({ error: streakErr.message });
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
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
        return courses;
}