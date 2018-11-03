import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { IVerifyOptions } from "passport-local";
import ResponseData from "../models/ResponseData";
import { UserModel } from "../models/User";
import pool from "../database";
import "../config/passport";

export const postRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.assert("email", "Email is not valid").isEmail();
  req
    .assert("password", "Password must be at least 4 characters long")
    .len({ min: 4 });
  req
    .assert("confirmPassword", "Passwords do not match")
    .equals(req.body.password);
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
  const errors: any = req.validationErrors();

  if (errors) {
    return next(new Error(errors.map((err: any) => err.msg)));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const userData = {
      email: req.body.email,
      password: hashedPassword,
      created: new Date(),
      modified: new Date()
    };
    const result: any = await pool.query("SELECT 1 FROM users WHERE email = ?", req.body.email);
    if (result.length === 0) {
      await pool.query("INSERT INTO users SET ?", userData);
      return res.status(201).json(
        new ResponseData({
          success: true
        })
      );
    } else {
      return res.status(400).json(
        new ResponseData({
          success: false,
          error: {
            error_code: 400,
            message: `Account with email ${userData.email} already exist`
          }
        })
      );
    }
  } catch (e) {
    next(e);
  }
};

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password cannot be blank").notEmpty();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    next(new Error(errors.map((err: any) => err.msg)));
  }

  passport.authenticate(
    "local",
    (err: Error, user: any, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new Error(info.message));
      }
      req.logIn(user, err => {
        if (err) {
          return next(err);
        }
        const payload: UserModel = {
          email: user.email
        };
        return res.status(201).json(
          new ResponseData({
            success: true,
            payload
          })
        );
      });
    }
  )(req, res, next);
};
