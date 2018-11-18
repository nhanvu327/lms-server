import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import jwt from "jsonwebtoken";
import { IVerifyOptions } from "passport-local";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import ResponseData from "../models/ResponseData";
import "../config/passport";
import User from "../entity/User";
import errorCodes from "../constants/errorCodes";
import { toSecondTimestamp } from "../helpers";

export const postRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    let newUser = new User();
    newUser = {
      email: req.body.email,
      password: hashedPassword,
      is_active: 1,
      created_at: toSecondTimestamp(new Date()),
      profile: {
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        role: req.body.role,
        created_at: toSecondTimestamp(new Date())
      }
    };
    const errors: any = await validate(newUser);
    if (errors.length) {
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
    const userRepository = getManager().getRepository(User);
    const result: any = await userRepository.findOne({
      email: req.body.email
    });
    if (!result) {
      await userRepository.save(newUser);
      return next();
      // return res.status(201).json(
      //   new ResponseData({
      //     success: true,
      //     payload: {
      //       profile: newUser.profile
      //     }
      //   })
      // );
    } else {
      return res.status(400).json(
        new ResponseData({
          success: false,
          error: {
            error_code: errorCodes.email_already_exist,
            message: `Account with email ${req.body.email} already exist`
          }
        })
      );
    }
  } catch (e) {
    return next(e);
  }
};

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
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
              profile: user.profile,
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
  const userRepository = getManager().getRepository(User);
  const payload = await userRepository.findOne(req.user.id);
  return res.status(200).json(
    new ResponseData({
      success: true,
      payload
    })
  );
};
