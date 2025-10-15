import { supabase } from '../../config/supabaseClient.js';


export const getStudentPlan = async (studentId) => {
  const { data, error } = await supabase
    .from("payments")
    .select("plan")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false }) // make sure you have a timestamp column
    .limit(1);

  if (error) throw error;
  return data[0] || null; // safe return
};
