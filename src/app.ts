import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import path from "path";
import session from "express-session";
import dotenv from "dotenv";
import passport from "passport";
import cors from "cors";

import ResponseData from "./models/ResponseData";
import * as userController from "./controllers/user";
import * as passportConfig from "./config/passport";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const app = express();

// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(compression());
app.use(bodyParser.json());

const whitelistOrigin: any = ["http://localhost:3000"];
app.use(
  cors({
    origin: function(origin, next) {
      if (whitelistOrigin.includes(origin)) {
        next(undefined, true);
      } else {
        next(new Error("Not allowed by CORS"));
      }
    }
  })
);
app.use(expressValidator());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "nhanvu"
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.post("/register", userController.postRegister);

app.post("/login", userController.postLogin);

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
