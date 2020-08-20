/**
 * @class
 * Specific error type to signal execution should immediately stop
 */
class CancelExecutionError extends Error {
  getResponse() {
    return {
      cancelled: true,
    };
  }
}

/**
 * @class
 * Base level exception for expected errors
 */
class BaseException extends Error {
  /**
     *
     * @param error {string} Error message
     * @param reason {string} Extended error details
     * @param code {(string|number)} Friendly error code for client lookup
     */
  constructor(error, reason, code) {
    super(error);
    this.error = error;
    this.reason = reason;
    this.code = code;
  }


  /**
     * Generate the standard response format for an error
     * @param context {object} AWS lambda context object
     * @param status {(number|string)} HTTP status code
     * @returns {{statusCode: *, headers: {"Access-Control-Allow-Origin": string,
     * "Access-Control-Allow-Credentials": boolean}, body: string}}
     */
  getResponse(context) {
    return {
      error: {
        message: String(this),
        path: context.invokedFunctionArn,
        reason: this.reason,
        code: this.code,
      },
    };
  }
}


module.exports = {
  BaseException,
  CancelExecutionError,
};
