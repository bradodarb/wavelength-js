import {Context} from 'aws-lambda';
import {HandlerState} from "../../../runtime";
import {Indexed} from "../../../util";


export default function LogLambdaMiddleware(state: HandlerState<Indexed, Context>) {
    state.logger.bind(
        {
            functionName: state.context.functionName,
            functionVersion: state.context.functionVersion,
            awsRequestId: state.context.awsRequestId,
        }
    )
}
