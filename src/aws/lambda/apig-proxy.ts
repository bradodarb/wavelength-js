import * as _ from 'lodash';
import stringify from 'fast-safe-stringify';
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {HandlerState, Runtime} from "../../runtime";
import {BufferedLogger} from "../../logging";
import {MiddleWareFunction} from "../../middleware";
import attachTraceLogger from "./lambda-trace-logging";

function buildAPIGatewayProxyResult(
    state: HandlerState<APIGatewayProxyEvent, Context>, defaultStatusCode: number):
    APIGatewayProxyResult {
    return {
        body: _.isObject(state.value) ? stringify(state.value) : String(state.value),
        headers: state.responseHeaders || {},
        multiValueHeaders: state.multiValueHeaders || {},
        statusCode: state.statusCode || defaultStatusCode,
        isBase64Encoded: state.isBase64Encoded || false
    };
}

function formatApiResult(state: HandlerState<APIGatewayProxyEvent, Context>): APIGatewayProxyResult {
    return buildAPIGatewayProxyResult(state, 200);
}

function formatApiError(state: HandlerState<APIGatewayProxyEvent, Context>): APIGatewayProxyResult {
    return buildAPIGatewayProxyResult(state, 500);
}

export default function APIGatewayProxyApplication(
    name: string, middleWares: MiddleWareFunction<APIGatewayProxyEvent, Context>[] = []):
    Runtime<APIGatewayProxyEvent, Context, APIGatewayProxyResult, APIGatewayProxyResult> {

    const logger = new BufferedLogger(name);
    const app = new Runtime<APIGatewayProxyEvent, Context, APIGatewayProxyResult, APIGatewayProxyResult>
    (name, logger, formatApiResult, formatApiError);
    app.middleWare.use(middleWares);
    attachTraceLogger(app);

    return app;
}
