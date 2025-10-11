import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oidc";
import {
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
} from "../models/instructor/authModel.js";
import dotenv from "dotenv";

dotenv.config();

export const configurePassport = () => {
  // Local Strategy
  passport.use(
    "local", 
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await findUserByEmail(email);
        if (!user) return done(null, false, { message: "Invalid email" });
        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return done(null, false, { message: "Invalid password" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // JWT Strategy
  passport.use(
    "jwt", 
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await findUserById(payload.id);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    "google", 
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_PATH,
        scope: ["profile", "email"],
      },
      
      async (issuer, profile, cb) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) return cb(null, false, { message: "No email from Google" });

          let user = await findUserByEmail(email);
          if (!user) {
            user = await createUser({
              username: profile.displayName || email.split("@")[0],
              email,
              password: null, // Google users have no password
            });
          }
          return cb(null, user);
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  // Serialize user for sessions
  passport.serializeUser((user, done) => {
    done(null, user.instructor_id || user.student_id || user.id);
  });

  // Deserialize user from sessions
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  return passport;
};