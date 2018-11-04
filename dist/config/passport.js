"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_local_1 = __importDefault(require("passport-local"));
const errorCodes_1 = __importDefault(require("../constants/errorCodes"));
const User_1 = __importDefault(require("../models/User"));
passport_1.default.serializeUser((user, done) => {
    done(undefined, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.queryProfile("SELECT * FROM users WHERE id = ?", id);
        done(undefined, user);
    }
    catch (err) {
        done(err);
    }
}));
/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
};
const LocalStrategy = passport_local_1.default.Strategy;
/**
 * Sign in using Email and Password.
 */
passport_1.default.use(new LocalStrategy({ usernameField: "email" }, function (email, password, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.query("SELECT * FROM users WHERE email = ?", email);
            if (!user.length) {
                return done(undefined, false, {
                    message: `Email ${email} not exist.`,
                    error_code: errorCodes_1.default.email_not_exist
                });
            }
            bcrypt_1.default.compare(password, user[0].password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }
                if (isMatch) {
                    return done(undefined, user[0]);
                }
                return done(undefined, false, {
                    message: "Password not correct.",
                    error_code: errorCodes_1.default.password_not_correct
                });
            });
        }
        catch (err) {
            return done(err);
        }
    });
}));
//# sourceMappingURL=passport.js.map