import { supabase } from "../../config/supabaseClient.js";


export const activeModel = async (student_id) => {
    const { data, error } = await supabase
                                .from('payments')
                                .select('*')
                                .eq('student_id', student_id)
                                .order('created_at', { ascending: false })
                                .limit(1);

    if(error){
        throw new Error(error.message);
    }

    return data;
}

export const createPayment = async (student_id, transaction_id, plan) => {
 
    const { data, error } = await supabase
      .from("payments")
      .insert([
        {
          student_id,
          transaction_id,
          plan
        },
      ])
      .select()
      .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
  
};