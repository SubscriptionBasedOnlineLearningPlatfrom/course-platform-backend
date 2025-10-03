import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('instructors')
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('instructors')
    .select("*")
    .eq("instructor_id", id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

export const createUser = async ({ username, email, password }) => {
  const password_hash = password ? await bcrypt.hash(password, 10) : "";
  const { data, error } = await supabase
    .from('instructors')
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