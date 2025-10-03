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
