import {Context, KinesisStreamEvent} from 'aws-lambda';
import {MiddleWareProvider} from "../../../middleware";
import {HandlerState} from "../../../runtime";
import {Deserializer, safeJsonParse} from "../../../util";


export default class KinesisEventParserMiddleware implements MiddleWareProvider<KinesisStreamEvent, Context> {

    parser: Deserializer;

    constructor(parser: Deserializer = safeJsonParse) {
        this.parser = parser;
    }

    middleWare() {
        return (state: HandlerState<KinesisStreamEvent, Context>) => {
            const records = state.event.Records.map(record => {
                return this.parser(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
            })
            state.push({records});
        }
    }
}
