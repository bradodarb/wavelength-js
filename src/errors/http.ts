import {BaseException} from "./base";
import {ReasonPhrases, StatusCodes} from "../util/http-status-codes";


class Base4xxException extends BaseException {

    constructor(reasonPhrase: string = ReasonPhrases.BAD_REQUEST,
                details?: string, statusCode: number = StatusCodes.BAD_REQUEST) {
        super(reasonPhrase, details, statusCode);

    }

}

class Base401Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.UNAUTHORIZED, details, StatusCodes.UNAUTHORIZED);

    }
}

class Base403Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.FORBIDDEN, details, StatusCodes.FORBIDDEN);

    }
}

class Base404Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.NOT_FOUND, details, StatusCodes.NOT_FOUND);

    }
}

class Base409Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.CONFLICT, details, StatusCodes.CONFLICT);

    }
}

class Base415Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.UNSUPPORTED_MEDIA_TYPE, details, StatusCodes.UNSUPPORTED_MEDIA_TYPE);

    }
}

class Base422Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.UNPROCESSABLE_ENTITY, details, StatusCodes.UNPROCESSABLE_ENTITY);

    }
}

class Base424Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.FAILED_DEPENDENCY, details, StatusCodes.FAILED_DEPENDENCY);

    }
}

class Base429Exception extends Base4xxException {
    constructor(details?: string) {
        super(ReasonPhrases.TOO_MANY_REQUESTS, details, StatusCodes.TOO_MANY_REQUESTS);

    }
}

class Base5xxException extends BaseException {
    constructor(details?: string) {
        super(ReasonPhrases.INTERNAL_SERVER_ERROR, details, StatusCodes.INTERNAL_SERVER_ERROR);

    }
}

export {

    BaseException,
    Base4xxException,
    Base401Exception,
    Base403Exception,
    Base404Exception,
    Base409Exception,
    Base415Exception,
    Base422Exception,
    Base424Exception,
    Base429Exception,
    Base5xxException,
};
