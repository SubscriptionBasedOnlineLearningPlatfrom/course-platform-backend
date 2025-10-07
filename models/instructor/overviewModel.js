import { supabase } from "../../config/supabaseClient.js";

export const enrollmentOverviewModel = async (instructorId) => {
    const { data, error } = await supabase
        .from('v_enrollment_overview')
        .select('*')
        .eq('instructor_id', instructorId);
    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const createdCoursesModel = async (instructorId) => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const editCreatedCourseModel = async (courseId, course_title, course_description, category, thumbnail_url = null) => {
    const updateData = { 
        course_title, 
        course_description, 
        category, 
        updated_at: new Date().toISOString() 
    };
    
    // Only update thumbnail_url if it's provided
    if (thumbnail_url !== null) {
        updateData.thumbnail_url = thumbnail_url;
    }

    const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('course_id', courseId)
        .select()
        .single();
        
    if (error) {
        throw new Error(error.message);
    }

    return data;
}

