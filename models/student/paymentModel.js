import { supabase } from '../../config/supabaseClient.js';

export const getStudentPlan = async (studentId) => {
  const { data, error } = await supabase
    .from("payments")
    .select("plan")
    .eq("student_id", studentId)
    .single(); 

  if (error) throw error;
  return data;
};
