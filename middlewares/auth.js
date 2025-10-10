import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { findUserByEmail, verifyPassword } from "../models/student/authModel.js";
import { Strategy as GoogleStrategy } from "passport-google-oidc";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// --- Strategies ---

passport.use(
  "student-local",   // <-- NAME here
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await findUserByEmail(email);
        if (!user) return done(null, false, { message: "Invalid email or password" });

        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return done(null, false, { message: "Invalid email or password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  "student-jwt",   
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        return done(null, payload); 
      } catch (err) {
        return done(err, false);
      }
    }
  )
);


export const localAuth = passport.authenticate("student-local", { session: false });
export const requireJwt = passport.authenticate("student-jwt", { session: false });
