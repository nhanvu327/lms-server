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
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const ResponseData_1 = __importDefault(require("../models/ResponseData"));
const database_1 = __importDefault(require("../database"));
require("../config/passport");
exports.postRegister = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    req.assert("email", "Email is not valid").isEmail();
    req
        .assert("password", "Password must be at least 4 characters long")
        .len({ min: 4 });
    req
        .assert("confirmPassword", "Passwords do not match")
        .equals(req.body.password);
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
    const errors = req.validationErrors();
    if (errors) {
        return next(new Error(errors.map((err) => err.msg)));
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        const userData = {
            email: req.body.email,
            password: hashedPassword,
            created: new Date(),
            modified: new Date()
        };
        const result = yield database_1.default.query("SELECT 1 FROM users WHERE email = ?", req.body.email);
        if (result.length === 0) {
            yield database_1.default.query("INSERT INTO users SET ?", userData);
            return res.status(201).json(new ResponseData_1.default({
                success: true
            }));
        }
        else {
            return res.status(400).json(new ResponseData_1.default({
                success: false,
                error: {
                    error_code: 400,
                    message: `Account with email ${userData.email} already exist`
                }
            }));
        }
    }
    catch (e) {
        next(e);
    }
});
/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert("email", "Email is not valid").isEmail();
    req.assert("password", "Password cannot be blank").notEmpty();
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
    const errors = req.validationErrors();
    if (errors) {
        next(new Error(errors.map((err) => err.msg)));
    }
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error(info.message));
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            const payload = {
                email: user.email,
            };
            return res.status(201).json(new ResponseData_1.default({
                success: true,
                payload: user
            }));
        });
    })(req, res, next);
};
//# sourceMappingURL=user.js.map