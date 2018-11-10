import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import jwt from "jsonwebtoken";
import { IVerifyOptions } from "passport-local";
import ResponseData from "../models/ResponseData";
import User from "../models/User";
import "../config/passport";
import errorCodes from "../constants/errorCodes";

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
  req.assert("name", "Name cannot be blank").notEmpty();
  req.assert("phone", "Phone cannot be blank").notEmpty();
  req.assert("role", "Role cannot be blank").notEmpty();

  const errors: any = req.validationErrors();

  if (errors) {
    return res.status(400).json(
      new ResponseData({
        success: false,
        error: {
          error_code: errorCodes.input_not_valid,
          message: errors.map((err: any) => err.msg)
        }
      })
    );
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const userData = {
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      phone: req.body.phone,
      role: req.body.role,
      created: new Date(),
      modified: new Date()
    };
    const result: any = await User.query(
      "SELECT 1 FROM users WHERE email = ?",
      req.body.email
    );
    if (result.length === 0) {
      await User.save(userData);
      return res.status(201).json(
        new ResponseData({
          success: true,
          payload: {
            profile: {
              email: req.body.email,
              name: req.body.name,
              phone: req.body.phone
            }
          }
        })
      );
    } else {
      return res.status(400).json(
        new ResponseData({
          success: false,
          error: {
            error_code: errorCodes.email_already_exist,
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
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
  req.assert("password", "Password cannot be blank").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json(
      new ResponseData({
        success: false,
        error: {
          error_code: errorCodes.input_not_valid,
          message: errors.map((err: any) => err.msg)
        }
      })
    );
  }

  passport.authenticate(
    "local",
    { session: false },
    (err: Error, user: any, info: IVerifyOptions & { error_code: Number }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json(
          new ResponseData({
            success: false,
            error: {
              error_code: info.error_code,
              message: info.message
            }
          })
        );
      }
      req.logIn(user, { session: false }, err => {
        if (err) {
          return next(err);
        }
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "8h"
          }
        );
        return res.status(200).json(
          new ResponseData({
            success: true,
            payload: {
              ...User.getProfile(user),
              token
            }
          })
        );
      });
    }
  )(req, res, next);
};

/**
 * GET /profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = await User.queryProfile(
    "SELECT * FROM users WHERE id = ?",
    req.user.id
  );
  return res.status(200).json(
    new ResponseData({
      success: true,
      payload
    })
  );
};
