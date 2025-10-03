import { supabase } from "../../config/supabaseClient.js";


export const activeModel = async (student_id) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', student_id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
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
export const changeSubscriptionPlan = async (student_id, transaction_id, plan) => {

  const { data, error } = await supabase
    .from("payments")
    .update({
      transaction_id: transaction_id,
      plan: plan
    })
    .eq("student_id", student_id)
    .select()
    .single();


  if (error) {
    throw new Error(error.message);
  }
  return data;

};
export const activePlan = async (payment_id) => {

  const { data, error } = await supabase
    .from("payments")
    .update({
      updated_at: new Date().toISOString()
    })
    .eq("payment_id", payment_id)
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  return data;

};