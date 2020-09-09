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

  error:string;
  reason?:string;
  code?: string|number
  constructor(error:string, reason?:string, code?:string|number) {
    super(error);
    this.error = error;
    this.reason = reason;
    this.code = code;
  }

  getResponse() {
    return {
      error: {
        message: String(this),
        reason: this.reason,
        code: this.code,
      },
    };
  }
}

export class FailedExecutionException extends BaseException{
  constructor(message:string, error:string = 'Application Execution Exception') {
    super(error, message, 'FAILED EXECUTION');
  }
}

export { BaseException, CancelExecutionError };
