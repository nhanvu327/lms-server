"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_validator_1 = __importDefault(require("express-validator"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const ResponseData_1 = __importDefault(require("./models/ResponseData"));
const userController = __importStar(require("./controllers/user"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const app = express_1.default();
// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_validator_1.default());
app.use(express_session_1.default({
    resave: true,
    saveUninitialized: true,
    secret: "nhanvu"
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
/**
 * Primary app routes.
 */
app.post("/register", userController.postRegister);
app.post("/login", userController.postLogin);
app.use((err, req, res, next) => {
    res.status(500).send(new ResponseData_1.default({
        success: false,
        error: {
            error_code: 500,
            message: err.message
        }
    }));
});
exports.default = app;
//# sourceMappingURL=app.js.map