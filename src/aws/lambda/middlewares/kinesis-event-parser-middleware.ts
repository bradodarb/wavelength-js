import {Context, KinesisStreamEvent} from 'aws-lambda';
import {MiddleWareProvider} from "../../../middleware";
import {HandlerState} from "../../../runtime";
import {Deserializer, safeJsonParse, Serializable} from "../../../util";
import {KinesisIngestApplication} from "../index";

const passThrough = (x: Serializable) => {
    return x
};
export class KinesisEventParserMiddleware implements MiddleWareProvider<KinesisStreamEvent, Context> {

    parser: Deserializer;
    filter: Function;
    transform: Function;

    constructor(parser: Deserializer = safeJsonParse,
                filter: Function = passThrough, transform: Function = passThrough) {
        this.parser = parser;
        this.filter = filter;
        this.transform = transform;
    }

    middleWare() {
        return (state: HandlerState<KinesisStreamEvent, Context>) => {
            const records:Serializable[] = [];
            state.event.Records.forEach(record => {
                const payload = this.parser(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
                if(this.filter(payload)){
                    records.push(this.transform(payload));
                }
            })
            state.push({records});
        }
    }
}
