import bcrypt from "bcrypt";
import { supabase } from "../../config/supabaseClient.js";

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('students')
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('students')
    .select("*")
    .eq("student_id", id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

export const createUser = async ({ username, email, password }) => {
  const password_hash = password ? await bcrypt.hash(password, 10) : "";
  const { data, error } = await supabase
    .from('students')
    .insert([{ username, email, password_hash }])
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const verifyPassword = async (plain, hash) => {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
};


// Update Student password hash in table
export const updateStudentPassword = async (email, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { data, error } = await supabase
    .from("students")
    .update({ password_hash: hashedPassword })
    .eq("email", email)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update password in Supabase Auth (admin API)
export const updateSupabaseAuthPassword = async (userId, newPassword) => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) throw new Error(error.message);
  return data;
};

// Send reset email
export const sendResetEmail = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/update-password`,
  });
  console.log("sendResetEmail data:", data, "error:", error);
  if (error) throw new Error(error.message);
  return data;
};

// Verify reset token using Supabase
export const verifyResetToken = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw new Error("Invalid or expired reset token.");
  return data.user;
};