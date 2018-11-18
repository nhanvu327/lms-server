import { Request, Response, NextFunction } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import { getManager } from "typeorm";
import errorCodes from "../constants/errorCodes";
import User from "../entity/User";

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
        const userRepository = getManager().getRepository(User);
        const user: any = await userRepository.findOne(
          {
            email
          },
          { relations: ["profile"] }
        );
        if (!user) {
          return done(undefined, false, {
            message: `Email ${email} not exist.`,
            error_code: errorCodes.email_not_exist
          });
        }
        bcrypt.compare(
          password,
          user.password,
          (err: any, isMatch: boolean) => {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              return done(undefined, user);
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
