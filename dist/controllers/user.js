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
const User_1 = __importDefault(require("../models/User"));
require("../config/passport");
const errorCodes_1 = __importDefault(require("../constants/errorCodes"));
exports.postRegister = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    req.assert("email", "Email is not valid").isEmail();
    req
        .assert("password", "Password must be at least 4 characters long")
        .len({ min: 4 });
    req
        .assert("confirmPassword", "Passwords do not match")
        .equals(req.body.password);
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
    req.assert("name", "Name cannot be blank").notEmpty();
    req.assert("phone", "Phone cannot be blank").notEmpty();
    req.assert("role", "Role cannot be blank").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400).json(new ResponseData_1.default({
            success: false,
            error: {
                error_code: errorCodes_1.default.input_not_valid,
                message: errors.map((err) => err.msg)
            }
        }));
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        const userData = {
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
            phone: req.body.phone,
            role: req.body.role,
            created: new Date(),
            modified: new Date()
        };
        const result = yield User_1.default.query("SELECT 1 FROM users WHERE email = ?", req.body.email);
        if (result.length === 0) {
            yield User_1.default.save(userData);
            return res.status(201).json(new ResponseData_1.default({
                success: true,
                payload: {
                    profile: {
                        email: req.body.email,
                        name: req.body.name,
                        phone: req.body.phone
                    }
                }
            }));
        }
        else {
            return res.status(400).json(new ResponseData_1.default({
                success: false,
                error: {
                    error_code: errorCodes_1.default.email_already_exist,
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
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
    req.assert("password", "Password cannot be blank").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400).json(new ResponseData_1.default({
            success: false,
            error: {
                error_code: errorCodes_1.default.input_not_valid,
                message: errors.map((err) => err.msg)
            }
        }));
    }
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json(new ResponseData_1.default({
                success: false,
                error: {
                    error_code: info.error_code,
                    message: info.message
                }
            }));
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            return res.status(201).json(new ResponseData_1.default({
                success: true,
                payload: User_1.default.getProfile(user)
            }));
        });
    })(req, res, next);
};
//# sourceMappingURL=user.js.map