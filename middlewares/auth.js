import passport from "passport";

export const requireJwt = passport.authenticate("jwt", { session: false });
export const googleAuth = passport.authenticate("google", { session: false });
export const googleAuthStart = passport.authenticate("google");
export const localAuth = passport.authenticate("local", { session: false });
