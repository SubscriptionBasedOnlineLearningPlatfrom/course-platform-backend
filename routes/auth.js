// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import passport from "passport";
// import { Strategy as LocalStrategy } from "passport-local";
// import { Strategy as GoogleStrategy } from "passport-google-oidc";

// import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
// import { createClient } from "@supabase/supabase-js";
// import dotenv from "dotenv";
// dotenv.config();

// const router = express.Router();
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// router.get("/test-supabase", async (req, res) => {
//   const { data, error } = await supabase.from("instructors").select("*").limit(2);
//   if (error) return res.status(500).json({ error: error.message });
//   res.json({ data });
// });
// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// // -------------------- PASSPORT STRATEGIES --------------------

// // Local Strategy (login with email + password)
// passport.use(
//   new LocalStrategy(
//     { usernameField: "email" },
//     async (email, password, done) => {
//       try {
//         const { data: user, error } = await supabase
//           .from("instructors")
//           .select("*")
//           .eq("email", email)
//           .single();

//         if (error || !user) return done(null, false, { message: "Invalid email" });

//         const validPassword = await bcrypt.compare(password, user.password_hash);        if (!validPassword) return done(null, false, { message: "Invalid password" });

//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

// // JWT Strategy (protect routes)
// passport.use(
//   new JwtStrategy(
//     {
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: JWT_SECRET,
//     },
//     async (jwtPayload, done) => {
//       try {
//         const { data: user, error } = await supabase
//           .from("instructors")
//           .select("*")
//           .eq("instructor_id", jwtPayload.id)
//           .single();

//         if (error || !user) return done(null, false);

//         return done(null, user);
//       } catch (err) {
//         return done(err, false);
//       }
//     }
//   )
// );
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     async (issuer, profile, cb) => {
//       try {
//         // 1. Check if user already exists in instructors by email
//         const { data: user, error } = await supabase
//           .from("instructors")
//           .select("*")
//           .eq("email", profile.emails[0].value)
//           .single();

//         if (user) {
//           return cb(null, user); // existing user
//         }

//         // 2. Otherwise, create a new instructor
//         const { data: newUser, error: insertError } = await supabase
//           .from("instructors")
//           .insert([
//             {
//               username: profile.displayName,
//               email: profile.emails[0].value,
//               password_hash: "", // no password, since Google auth
//             },
//           ])
//           .select()
//           .single();

//         if (insertError) return cb(insertError);

//         return cb(null, newUser);
//       } catch (err) {
//         return cb(err);
//       }
//     }
//   )
// );

// // -------------------- ROUTES --------------------

// // SIGNUP
// router.post("/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // check if exists
//     const { data: existing } = await supabase
//       .from("instructors")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (existing) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // insert user
//     const { data, error } = await supabase
//       .from("instructors")
//       .insert([{ username, email, password_hash: hashedPassword }])
//       .select()
//       .single();

//     if (error) throw error;

//     // create JWT
//     const token = jwt.sign(
//       { id: data.instructor_id, username: data.username, email: data.email },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ message: "Signup successful", token });
//   } catch (err) {
//     console.error("Signup error:", err); // Add this line
//     res.status(500).json({ error: err.message });
//   }
// });

// // LOGIN
// router.post("/login", (req, res, next) => {
//   passport.authenticate("local", { session: false }, (err, user, info) => {
//     if (err) return next(err);
//     if (!user) return res.status(400).json({ error: info?.message || "Login failed" });

//     // create JWT
//     const token = jwt.sign(
//       { id: user.instructor_id, username: user.username, email: user.email },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ message: "Login successful", token });
//   })(req, res, next);
// });
// // Step 1: Redirect user to Google
// router.get("/auth/google", passport.authenticate("google"));

// // Step 2: Handle Google callback
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { session: false, failureRedirect: "/login" }),
//   (req, res) => {
//     // Generate a JWT for the user
//     const token = jwt.sign(
//       {
//         id: req.user.instructor_id,
//         username: req.user.username,
//         email: req.user.email,
//       },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // Send token as JSON or redirect with token
//     res.json({ message: "Google login successful", token });
//   }
// );


// // PROTECTED DASHBOARD
// router.get(
//   "/dashboard",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     res.json({ message: `Welcome ${req.user.username}, you are in dashboard!` });
//   }
// );

// export default router;





import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oidc";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { createClient } from "@supabase/supabase-js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ must be service role, not anon
);
// const supabaseAdmin = createClient(
//    process.env.SUPABASE_URL,
//  process.env.SUPABASE_SERVICE_ROLE_KEY
// )

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// -------------------- PASSPORT STRATEGIES --------------------

// Local Strategy (login with email + password)
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const { data: user, error } = await supabase
        .from("instructors")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !user) return done(null, false, { message: "Invalid email" });

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) return done(null, false, { message: "Invalid password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const { data: user, error } = await supabase
          .from("instructors")
          .select("*")
          .eq("instructor_id", jwtPayload.id)
          .single();

        if (error || !user) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (issuer, profile, cb) => {
      try {
        // Check if user exists
        const { data: user } = await supabase
          .from("instructors")
          .select("*")
          .eq("email", profile.emails[0].value)
          .single();

        if (user) return cb(null, user);

        // Insert new instructor
        const { data: newUser, error: insertError } = await supabase
          .from("instructors")
          .insert([
            {
              username: profile.displayName,
              email: profile.emails[0].value,
              password_hash: "", // Google login → no password
            },
          ])
          .select()
          .single();

        if (insertError) return cb(insertError);

        return cb(null, newUser);
      } catch (err) {
        console.error("Signup/Login error:", err); // This will show the real error in your terminal
        res.status(500).json({ error: err.message || "Something went wrong!" });
      }
    }
  )
);

// -------------------- ROUTES --------------------

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if exists
    const { data: existing } = await supabase
      .from("instructors")
      .select("instructor_id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert instructor
    const { data, error } = await supabase
      .from("instructors")
      .insert([{ username, email, password_hash: hashedPassword }])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: data.instructor_id, username: data.username, email: data.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Signup successful", token });
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

    res.json({ message: "Login successful", token });
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

    // res.json({ message: "Google login successful", token });
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);

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

    // Use the token directly to fetch user session
    const { data: session, error: sessionError } =
      await supabase.auth.setSession({ access_token: token, refresh_token: "" });

    if (sessionError) throw sessionError;

    const userId = session?.user?.id;
    if (!userId) throw new Error("Invalid or expired reset token.");

    // Update user password using admin client
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) throw error;

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("❌ /update-password error:", err.message);
    res.status(400).json({ error: err.message });
  }
});
// Protected route
router.get("/dashboard", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, you are in dashboard!` });
});

export default router;