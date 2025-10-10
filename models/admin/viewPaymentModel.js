import { supabase } from '../../config/supabaseClient.js';
export const getPaymentDetails = async () => {
  // Join payments with students
  const { data, error } = await supabase
    .from('payments_with_students')
    .select('*');

  if (error) throw error;

  // Map data to flatten student info
  return data.map(item => ({
    payment_id: item.payment_id,
    plan: item.plan,
    amount: item.amount,
    student_id: item.student_id,
    student_name: item.username || '',
    student_email: item.email || '',
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};
