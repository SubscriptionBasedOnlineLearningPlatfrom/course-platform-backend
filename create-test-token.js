import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTestToken() {
  console.log("🧪 Creating test token for password update...\n");

  try {
    // Get a user's auth record to simulate a real reset token
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const testUser = users.users.find(user => user.email === 'newuser@example.com');
    if (!testUser) {
      console.log("❌ Test user not found in Supabase Auth");
      return;
    }

    console.log("✅ Found test user:", testUser.email);

    // Create a mock JWT token (similar to what Supabase would send)
    const mockToken = {
      sub: testUser.id,
      email: testUser.email,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000)
    };

    // Simple base64 encoding for test
    const encodedToken = Buffer.from(JSON.stringify(mockToken)).toString('base64');

    console.log("\n📝 Test token (base64 encoded):");
    console.log(encodedToken);

    console.log("\n🔗 Test curl command:");
    console.log(`curl -X POST http://localhost:4000/auth/update-password -H "Content-Type: application/json" -d '{"token": "${encodedToken}", "newPassword": "newtestpassword123"}'`);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

createTestToken();