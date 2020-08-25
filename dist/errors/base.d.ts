/**
 * @class
 * Specific error type to signal execution should immediately stop
 */
declare class CancelExecutionError extends Error {
    getResponse(): {
        cancelled: boolean;
    };
}
/**
 * @class
 * Base level exception for expected errors
 */
declare class BaseException extends Error {
    error: string;
    reason: string;
    code: string | number;
    constructor(error: string, reason: string, code: string | number);
    getResponse(): {
        error: {
            message: string;
            reason: string;
            code: string | number;
        };
    };
}
export { BaseException, CancelExecutionError };
