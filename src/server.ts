import app from "./app";
import https from "https";
import * as fs from "fs";
import * as path from "path";
import { ExpressPeerServer } from "peer";

/**
 * Start Express server.
 */

const options = {
  key: fs
    .readFileSync(path.join(__dirname, "../ssl/mockserver.key")),
  cert: fs
    .readFileSync(path.join(__dirname, "../ssl/mockserver.crt"))
};

const server = https.createServer(options, app).listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

const peerserver = ExpressPeerServer(server, {
  debug: true,
  port: 3001
});

app.use("/peerjs", peerserver);

export default server;
