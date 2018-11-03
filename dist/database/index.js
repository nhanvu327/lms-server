"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const util_1 = __importDefault(require("util"));
const logger_1 = __importDefault(require("../utils/logger"));
const pool = mysql_1.default.createPool({
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
            logger_1.default.error("Database connection was closed.");
        }
        if (err.code === "ER_CON_COUNT_ERROR") {
            logger_1.default.error("Database has too many connections.");
        }
        if (err.code === "ECONNREFUSED") {
            logger_1.default.error("Database connection was refused.");
        }
    }
    if (connection)
        connection.release();
    return;
});
pool.query = util_1.default.promisify(pool.query);
exports.default = pool;
//# sourceMappingURL=index.js.map