interface IData {
  success: Boolean;
  payload?: Object;
  error?: {
    error_code: Number;
    message: String | String[];
  };
}

class ResponseData {
  success: Boolean;
  payload?: Object;
  error?: {
    error_code: Number;
    message: String | String[];
  };

  constructor(data: IData) {
    this.success = data.success;

    if (this.success) {
      this.payload = data.payload;
    } else {
      this.error = {
        error_code: data.error.error_code || 500,
        message: data.error.message || "Internal Server Error"
      };
    }
  }
}

export default ResponseData;
