import {Context, KinesisStreamEvent} from 'aws-lambda';
import {MiddleWareFunction, MiddleWareProvider} from "../../../middleware";
import {HandlerState} from "../../../runtime";

export default class KinesisEventParserMiddleware implements MiddleWareProvider<KinesisStreamEvent, Context>{

    middleWare(){
        return (state:HandlerState<KinesisStreamEvent, Context>)=>{

        }
    }
}
// let KinesisEventParserMiddleware: MiddleWareFunction<KinesisStreamEvent, Context>
// KinesisEventParserMiddleware = function KinesisEventParserMiddleware(state: HandlerState<KinesisStreamEvent, Context>) {
//
//
// }
