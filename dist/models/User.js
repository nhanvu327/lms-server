"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
class User {
    query(queryStatement, info) {
        return database_1.default.query(queryStatement, info);
    }
    save(userData) {
        return this.query("INSERT INTO users SET ?", userData);
    }
    getProfile(queryStatement, info) {
        return database_1.default.query(queryStatement, info).then((res) => ({
            profile: {
                email: res[0].email,
                name: res[0].name,
                phone: res[0].phone
            }
        }));
    }
}
exports.default = new User();
//# sourceMappingURL=User.js.map