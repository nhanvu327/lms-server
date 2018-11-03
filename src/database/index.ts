import mysql from "mysql";
import util from "util";
import logger from "../utils/logger";

const pool = mysql.createPool({
  connectionLimit: 100,
  host: "localhost",
  user: "root",
  password: "password",
  database: "lms",
  port: 3306,
  debug: false,
  multipleStatements: true
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      logger.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      logger.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      logger.error("Database connection was refused.");
    }
  }
  if (connection) connection.release();
  return;
});

pool.query = util.promisify(pool.query) as any;

export default pool;
