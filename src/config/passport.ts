import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import passportLocal from "passport-local";
import User from "../models/User";

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user: any = await User.getProfile("SELECT * FROM users WHERE id = ?", id);
    done(undefined, user);
  } catch (err) {
    done(err);
  }
});

/**
 * Login Required middleware.
 */
export let isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
};

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, async function(
    email,
    password,
    done
  ) {
    try {
      const user: any = await User.query(
        "SELECT * FROM users WHERE email = ?",
        email
      );
      if (!user.length) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }
      bcrypt.compare(
        password,
        user[0].password,
        (err: any, isMatch: boolean) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(undefined, user[0]);
          }
          return done(undefined, false, {
            message: "Invalid password."
          });
        }
      );
    } catch (err) {
      return done(err);
    }
  })
);
