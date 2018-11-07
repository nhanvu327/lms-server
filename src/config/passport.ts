import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import passportLocal from "passport-local";
import errorCodes from "../constants/errorCodes";
import User from "../models/User";
import ResponseData from "../models/ResponseData";

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user: any = await User.queryProfile(
      "SELECT * FROM users WHERE id = ?",
      id
    );
    done(undefined, user);
  } catch (err) {
    done(err);
  }
});

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send(
    new ResponseData({
      success: false,
      error: {
        message: "Unauthorized",
        error_code: 401
      }
    })
  );
};

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, async function(
    email,
    password,
    done: any
  ) {
    try {
      const user: any = await User.query(
        "SELECT * FROM users WHERE email = ?",
        email
      );
      if (!user.length) {
        return done(undefined, false, {
          message: `Email ${email} not exist.`,
          error_code: errorCodes.email_not_exist
        });
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
            message: "Password not correct.",
            error_code: errorCodes.password_not_correct
          });
        }
      );
    } catch (err) {
      return done(err);
    }
  })
);
