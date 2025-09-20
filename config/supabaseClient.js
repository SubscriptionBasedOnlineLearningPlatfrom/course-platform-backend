import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// For backend use (full access) → use service role key
 const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
     auth: { autoRefreshToken: false, persistSession: false } 
  }
);

export { supabase };

// For testing the connection
// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config();

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export { supabase }; 
/*
// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    if (error) {
      console.error(' Supabase connection failed:', error.message);
    } else {
      console.log(' Supabase connected successfully');
    }
  } catch (err) {
    console.error(' Supabase connection error:', err.message);
  }
};


 */