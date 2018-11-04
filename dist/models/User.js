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
    queryProfile(queryStatement, info) {
        return database_1.default.query(queryStatement, info).then((res) => this.getProfile(res[0]));
    }
    getProfile(data) {
        return {
            profile: {
                id: data.id,
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: data.role
            }
        };
    }
}
exports.default = new User();
//# sourceMappingURL=User.js.map