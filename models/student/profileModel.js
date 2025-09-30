import { supabase } from "../../config/supabaseClient.js"

export const profileModel = async (student_id) => {
    const { data, error } = await supabase
        .from('students')
        .select('username,email')
        .eq('student_id', student_id)
        .maybeSingle();
        
    if (error) {
        throw new Error(error.message);
    }

    return data;
}