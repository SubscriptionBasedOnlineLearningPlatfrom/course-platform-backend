import { supabase } from "../../config/supabaseClient.js";

export const dashboardController = async (req, res) => {
    try {
        const studentId = 'd6279018-9f8c-499a-bb78-f40874d2903d' //req.studentId;
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

        const { data: courses, error } = await supabase
            .from('enrolledcoursedetails')
            .select('*')
            .eq('student_id', studentId);   

        if (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json({ courses });

    }
    catch (error) { 
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}