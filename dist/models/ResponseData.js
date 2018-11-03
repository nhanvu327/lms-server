"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseData {
    constructor(data) {
        this.success = data.success;
        if (this.success) {
            this.payload = data.payload;
        }
        else {
            this.error = {
                error_code: data.error.error_code || 500,
                message: data.error.message || "Internal Server Error"
            };
        }
    }
}
exports.default = ResponseData;
//# sourceMappingURL=ResponseData.js.map