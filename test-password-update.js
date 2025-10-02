import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPasswordUpdate() {
  console.log("🧪 Testing password update flow...\n");

  try {
    // 1. First get a user's auth record to simulate a real reset token
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const testUser = users.users.find(user => user.email === 'newuser@example.com');
    if (!testUser) {
      console.log("❌ Test user not found in Supabase Auth");
      return;
    }

    console.log("✅ Found test user:", testUser.email);
    console.log("User ID:", testUser.id);

    // 2. Create a mock JWT token (similar to what Supabase would send)
    const mockToken = {
      sub: testUser.id,
      email: testUser.email,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000)
    };

    // Simple base64 encoding for test (real Supabase tokens are properly signed)
    const encodedToken = Buffer.from(JSON.stringify(mockToken)).toString('base64');

    console.log("📝 Mock token created for testing");

    // 3. Test the password update endpoint
    const response = await axios.post('http://localhost:4000/auth/update-password', {
      token: encodedToken,
      newPassword: 'newtestpassword123'
    });

    console.log("\n✅ Password update response:");
    console.log("- Message:", response.data.message);
    console.log("- Token returned:", !!response.data.token);
    console.log("- User data returned:", !!response.data.user);
    
    if (response.data.user) {
      console.log("- User:", response.data.user.username, "(" + response.data.user.email + ")");
    }

    console.log("\n🎉 Test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.response?.data?.error || error.message);
  }
}

testPasswordUpdate();