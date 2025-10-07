import { supabase } from "../../config/supabaseClient.js"

export const profileModel = async (student_id) => {
    const { data, error } = await supabase
        .from('students')
        .select('student_id,username,email,user_profile')
        .eq('student_id', student_id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const uploadProfile = async (imageUrl,student_id) => {
    const { data, error } = await supabase
        .from("students")
        .update({ user_profile: imageUrl })
        .eq('student_id',student_id)
        .select()
        .single();

    if (error){
        throw new Error(error.message);
    } 
    return data;
}