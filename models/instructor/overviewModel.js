import { supabase } from "../../config/supabaseClient.js";

export const enrollmentOverviewModel = async (instructorId) => {
    const { data, error } = await supabase
        .from('v_enrollment_overview')
        .select('*')
        .eq('instructor_id', instructorId);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    
    return data;
}

export const createdCoursesModel = async (instructorId) => {
    const { data, error } = await supabase
        .from('v_created_courses')
        .select('*')
        .eq('instructor_id', instructorId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return data;
}

export const editCreatedCourseModel = async (course_title, course_description, category) => {
    const { data, error } = await supabase
        .from('courses')
        .update({ course_title, course_description, category, updated_at: new Date().toISOString() })
        .eq('course_id', courseId)
        .single();
    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return data;
}

