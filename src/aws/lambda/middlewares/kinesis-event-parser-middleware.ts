import {Context, KinesisStreamEvent} from 'aws-lambda';
import {MiddleWareFunction} from "../../../middleware";
import {HandlerState} from "../../../runtime";

let KinesisEventParserMiddleware: MiddleWareFunction<KinesisStreamEvent, Context>
KinesisEventParserMiddleware = function KinesisEventParserMiddleware(state: HandlerState<KinesisStreamEvent, Context>) {


}
