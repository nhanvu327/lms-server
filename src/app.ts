import express, { Request, Response, NextFunction, Express } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import path from "path";
import passport from "passport";
import cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";
import * as passportConfig from "./config/passport";
import ResponseData from "./models/ResponseData";
import * as userControllers from "./controllers/user";

const app: Express | any = express();
app.set("port", process.env.PORT || 3001);

createConnection({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "password",
  database: "lms",
  synchronize: true,
  logging: false,
  entities: [__dirname + "/entity/*.ts"]
})
  .then(() => {
    // Express configuration
    app.use(compression());
    app.use(bodyParser.json());

    app.use(
      cors({
        origin: true,
        credentials: true
      })
    );
    app.use(passport.initialize());
    app.use(
      express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
    );

    app.post("/register", userControllers.postRegister, userControllers.postLogin);

    app.post("/login", userControllers.postLogin);

    app.get(
      "/profile",
      passportConfig.isAuthenticated,
      userControllers.getProfile
    );

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
  })
  .catch(err => console.log("TypeORM connection error: ", err));

export default app;
