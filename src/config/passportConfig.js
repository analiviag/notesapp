import passport from "passport";
import User from "../models/user.js";

export function initializePassport(passport) {
  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
}
