import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    console.log("📋 Users in Supabase Auth:");
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
    });

    if (users.users.length === 0) {
      console.log("No users found in Supabase Auth");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listUsers();