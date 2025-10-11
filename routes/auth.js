





import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { createClient } from "@supabase/supabase-js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ must be service role, not anon
);

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// -------------------- ROUTES --------------------

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if exists in instructors table
    const { data: existing } = await supabase
      .from("instructors")
      .select("instructor_id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return res.status(400).json({ error: "User already exists" });

    // 1. Create user in Supabase Auth (for password reset functionality)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: username
      }
    });

    if (authError) {
      console.error("Supabase Auth creation error:", authError);
      throw new Error(authError.message);
    }

    console.log("✅ Created Supabase Auth user:", authUser.user.id);

    // 2. Create user in custom instructors table
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("instructors")
      .insert([{ 
        username, 
        email, 
        password_hash: hashedPassword
        // Note: supabase_user_id column would need to be added to link these
      }])
      .select()
      .single();

    if (error) {
      // Clean up: delete the auth user if instructor creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

    console.log("✅ Created instructor record:", data.instructor_id);

    const token = jwt.sign(
      { id: data.instructor_id, username: data.username, email: data.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Signup successful - user created in both systems!", 
      token,
      user: {
        id: data.instructor_id,
        username: data.username,
        email: data.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info?.message || "Login failed" });

    const token = jwt.sign(
      { id: user.instructor_id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return both token and user data for consistency with register
    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.instructor_id,
        username: user.username,
        email: user.email
      }
    });
  })(req, res, next);
});

// Google OAuth
router.get("/google", passport.authenticate("google"));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.instructor_id,
        username: req.user.username,
        email: req.user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Encode user data to pass it safely in URL
    const userData = encodeURIComponent(JSON.stringify({
      id: req.user.instructor_id,
      username: req.user.username,
      email: req.user.email
    }));

    // Redirect with both token and user data
    res.redirect(`http://localhost:5173/dashboard?token=${token}&user=${userData}`);
  }
);
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔔 /reset-password called with:", email);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/update-password`,
    });

    if (error) throw error;
    console.log("✅ resetPasswordForEmail response:", data);

    res.json({ message: "Password reset email sent!" });
  } catch (err) {
    console.error("❌ /reset-password error:", err);
    res.status(400).json({ error: err.message });
  }
});


// Update password after reset
router.post("/update-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) throw new Error("Missing reset token.");
    if (!newPassword) throw new Error("Missing new password.");

    // Verify and decode the JWT token using Supabase
    let decoded;
    try {
      // Use Supabase to verify the token properly
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error("Invalid or expired reset token.");
      }
      
      decoded = {
        sub: user.id,
        email: user.email
      };
    } catch (verifyError) {
      console.error("❌ Token verification error:", verifyError);
      throw new Error("Invalid or expired reset token.");
    }

    const userId = decoded.sub;
    const userEmail = decoded.email;
    if (!userId || !userEmail) throw new Error("Invalid or expired reset token.");

    console.log("🔄 Updating password for user:", userId, "email:", userEmail);

    // 1. Update user password in Supabase Auth using admin client
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    
    if (authError) {
      console.error("❌ Supabase admin error:", authError);
      throw new Error(authError.message);
    }

    console.log("✅ Password updated in Supabase Auth for user:", userId);

    // 2. Also update password in instructors table for consistency
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const { data: instructorData, error: instructorError } = await supabase
      .from("instructors")
      .update({ password_hash: hashedPassword })
      .eq("email", userEmail)
      .select()
      .single();

    if (instructorError) {
      console.error("❌ Instructor table update error:", instructorError);
      // This is not critical - the auth password is already updated
    } else {
      console.log("✅ Password also updated in instructors table");
    }

    // 3. Get the instructor data to create a proper login token
    const { data: instructor, error: fetchError } = await supabase
      .from("instructors")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (fetchError || !instructor) {
      console.error("❌ Could not fetch instructor data:", fetchError);
      // Still return success - password was updated
      return res.json({ 
        message: "Password updated successfully!" 
      });
    }

    // 4. Generate JWT token for the instructor so they can be logged in
    const loginToken = jwt.sign(
      { 
        id: instructor.instructor_id, 
        username: instructor.username, 
        email: instructor.email 
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Password updated successfully!",
      token: loginToken,
      user: {
        id: instructor.instructor_id,
        username: instructor.username,
        email: instructor.email
      }
    });
  } catch (err) {
    console.error("❌ /update-password error:", err.message);
    res.status(400).json({ error: err.message });
  }
});
// Protected route
router.get("/dashboard", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, you are in dashboard!`});
});

export default router;