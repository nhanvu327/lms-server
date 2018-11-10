import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import path from "path";
import dotenv from "dotenv";
import passport from "passport";
import cors from "cors";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import * as passportConfig from "./config/passport";
import ResponseData from "./models/ResponseData";
import * as userController from "./controllers/user";

const app = express();
const isProd = process.env.NODE_ENV === "production";

// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(compression());
app.use(bodyParser.json());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(expressValidator());
app.use(passport.initialize());
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.post("/register", userController.postRegister);

app.post("/login", userController.postLogin);

app.get("/profile", passportConfig.isAuthenticated, userController.getProfile);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send(
    new ResponseData({
      success: false,
      error: {
        error_code: 500,
        message: err.message
      }
    })
  );
});

export default app;
