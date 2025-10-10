import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// -------------------- PASSPORT STRATEGIES --------------------

// Local Strategy for Admin Login
passport.use(
  "admin-local",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const { data: user, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", email)
          .eq("is_active", true)
          .single();

        if (error || !user) {
          return done(null, false, { message: "Invalid email or account inactive" });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT Strategy for Admin Token Verification
passport.use(
  "admin-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "supersecret",
    },
    async (jwtPayload, done) => {
      try {
        const { data: user, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("admin_id", jwtPayload.id)
          .eq("is_active", true)
          .single();

        if (error || !user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// -------------------- MIDDLEWARE --------------------

// Middleware to verify admin JWT token
export const verifyAdminToken = passport.authenticate("admin-jwt", { session: false });

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// -------------------- ROUTES --------------------

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Admin auth routes working" });
});

// Admin Login
router.post("/login", (req, res, next) => {
  passport.authenticate("admin-local", { session: false }, async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ error: info?.message || "Login failed" });
    }

    try {
      // Update last login
      await supabase
        .from("admin_users")
        .update({ last_login: new Date().toISOString() })
        .eq("admin_id", user.admin_id);

      // Create JWT token
      const token = jwt.sign(
        {
          id: user.admin_id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set session
      req.session.adminId = user.admin_id;
      req.session.role = user.role;

      res.json({
        message: "Admin login successful",
        token,
        admin: {
          id: user.admin_id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          lastLogin: user.last_login
        }
      });
    } catch (sessionErr) {
      console.error("Session update error:", sessionErr);
      res.status(500).json({ error: "Login successful but session update failed" });
    }
  })(req, res, next);
});

// Public Admin Registration (for initial setup or new admins)
router.post("/register-public", async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, and password are required" });
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate admin ID
    const adminId = `admin-${Date.now()}`;

    // Insert admin user
    const { data, error } = await supabase
      .from("admin_users")
      .insert([{
        admin_id: adminId,
        email,
        username,
        password_hash: hashedPassword,
        full_name: fullName,
        role: 'admin'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Admin user created successfully",
      admin: {
        id: data.admin_id,
        email: data.email,
        username: data.username,
        fullName: data.full_name,
        role: data.role
      }
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Registration (only for super admins or initial setup)
router.post("/register", verifyAdminToken, requireAdmin, async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;

    // Check if user already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate admin ID
    const adminId = `admin-${Date.now()}`;

    // Insert admin user
    const { data, error } = await supabase
      .from("admin_users")
      .insert([{
        admin_id: adminId,
        email,
        username,
        password_hash: hashedPassword,
        full_name: fullName,
        role: 'admin'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Admin user created successfully",
      admin: {
        id: data.admin_id,
        email: data.email,
        username: data.username,
        fullName: data.full_name,
        role: data.role
      }
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get current admin profile
router.get("/profile", verifyAdminToken, async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("admin_id, email, username, full_name, role, last_login, created_at")
      .eq("admin_id", req.user.admin_id)
      .single();

    if (error) throw error;

    res.json({ admin });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Logout (clear session)
router.post("/logout", verifyAdminToken, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout session destroy error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Admin logout successful" });
  });
});

// Verify token endpoint
router.get("/verify", verifyAdminToken, (req, res) => {
  res.json({
    valid: true,
    admin: {
      id: req.user.admin_id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Change password
router.post("/change-password", verifyAdminToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const { data: user, error: fetchError } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("admin_id", req.user.admin_id)
      .single();

    if (fetchError) throw fetchError;

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: hashedNewPassword, updated_at: new Date().toISOString() })
      .eq("admin_id", req.user.admin_id);

    if (updateError) throw updateError;

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;