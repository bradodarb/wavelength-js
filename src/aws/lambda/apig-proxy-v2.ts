import * as _ from 'lodash';
import stringify from 'fast-safe-stringify';
import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from 'aws-lambda';
import {HandlerState, Runtime} from "../../runtime";
import {BufferedLogger} from "../../logging";
import {MiddleWareFunction} from "../../middleware";
import attachTraceLogger from "./lambda-trace-logging";

function buildAPIGatewayProxyResultV2(
    state: HandlerState<APIGatewayProxyEventV2, Context>, defaultStatusCode: number):
    APIGatewayProxyResultV2 {
    return {
        body: _.isObject(state.value) ? stringify(state.value) : String(state.value),
        headers: state.responseHeaders || {},
        statusCode: state.statusCode || _.get(state, 'value.error.code') || defaultStatusCode,
        isBase64Encoded: state.isBase64Encoded || false,
        cookies: state.cookies || []
    };
}

function formatApiResult(state: HandlerState<APIGatewayProxyEventV2, Context>): APIGatewayProxyResultV2 {
    return buildAPIGatewayProxyResultV2(state, 200);
}

function formatApiError(state: HandlerState<APIGatewayProxyEventV2, Context>): APIGatewayProxyResultV2 {
    return buildAPIGatewayProxyResultV2(state, 500);
}

export default function APIGatewayProxyApplication(
    name: string, middleWares: MiddleWareFunction<APIGatewayProxyEventV2, Context>[] = []):
    Runtime<APIGatewayProxyEventV2, Context, APIGatewayProxyResultV2, APIGatewayProxyResultV2> {

    const logger = new BufferedLogger(name);
    const app = new Runtime<APIGatewayProxyEventV2, Context, APIGatewayProxyResultV2, APIGatewayProxyResultV2>
    (name, logger, formatApiResult, formatApiError);
    app.middleWare.use(middleWares);
    attachTraceLogger(app);
    app.state.throwOnError = false;
    return app;
}
