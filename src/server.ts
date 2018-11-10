import app from "./app";
import https from "https";
import http from "http";
import * as fs from "fs";
import * as path from "path";
import { ExpressPeerServer } from "peer";

/**
 * Start Express server.
 */

const isDev = process.env.NODE_ENV === "development";

const options = isDev
  ? {
      key: fs.readFileSync(path.join(__dirname, "../ssl/mockserver.key")),
      cert: fs.readFileSync(path.join(__dirname, "../ssl/mockserver.crt"))
    }
  : undefined;

const server = isDev
  ? http.createServer(app).listen(app.get("port"))
  : https.createServer(options, app).listen(app.get("port"), () => {
      console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });

const peerserver = ExpressPeerServer(server, {
  debug: true,
  port: 3001,
  allow_discovery: true
});

app.use("/peerjs", peerserver);
