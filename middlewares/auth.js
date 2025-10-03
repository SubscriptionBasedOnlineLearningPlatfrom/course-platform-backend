import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { findUserByEmail, verifyPassword } from "../models/student/authModel.js";

// ----- Local (email/password) -----
passport.use(
  "student-local",
  new LocalStrategy(
    {
      usernameField: "email",    // reads req.body.email
      passwordField: "password", // reads req.body.password
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await findUserByEmail(email);
        if (!user) return done(null, false, { message: "Invalid email or password" });

        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return done(null, false, { message: "Invalid email or password" });

        // success -> attach DB row as req.user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ----- JWT (protect /student/auth/dashboard, etc.) -----
passport.use(
  "student-google", 
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // you can optionally load the user here if you want
        return done(null, payload);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);



export const requireJwt = passport.authenticate("jwt", { session: false });
export const googleAuth = passport.authenticate("google", { session: false });
export const googleAuthStart = passport.authenticate("google");
export const localAuth = passport.authenticate("local", { session: false });
