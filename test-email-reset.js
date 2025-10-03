import { supabase } from './config/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

async function testPasswordReset() {
  console.log("🧪 Testing password reset email...\n");

  try {
    const testEmail = "sivapriya.22@cse.mrt.ac.lk";
    console.log(`📧 Sending reset email to: ${testEmail}`);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.FRONTEND_URL}/update-password`,
    });

    if (error) {
      console.error("❌ Supabase reset error:", error);
      return;
    }

    console.log("✅ Supabase response:", data);
    console.log("\n📝 Next steps:");
    console.log("1. Check your email inbox");
    console.log("2. Look for spam/junk folder");
    console.log("3. Verify Supabase SMTP configuration");
    console.log("4. Check Supabase Dashboard → Authentication → Email Templates");

  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

testPasswordReset();