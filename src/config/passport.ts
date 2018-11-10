import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import errorCodes from "../constants/errorCodes";
import User from "../models/User";
import ResponseData from "../models/ResponseData";

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false })(req, res, next);
};

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function(email: string, password: string, done: any) {
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
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    function(jwtPayload, done) {
      return done(undefined, jwtPayload);
    }
  )
);
