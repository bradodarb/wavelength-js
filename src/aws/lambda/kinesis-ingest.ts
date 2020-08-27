import * as _ from 'lodash';
import stringify from 'fast-safe-stringify';
import {KinesisStreamEvent, Context} from 'aws-lambda';
import {HandlerState, Runtime} from "../../runtime";
import {BufferedLogger} from "../../logging";
import {MiddleWareFunction} from "../../middleware";
import attachTraceLogger from "./lambda-trace-logging";


export default function KinesisIngestApplication(
    name: string, middleWares: MiddleWareFunction<KinesisStreamEvent, Context>[] = []):
    Runtime<KinesisStreamEvent, Context> {

    const logger = new BufferedLogger(name);
    const app = new Runtime<KinesisStreamEvent, Context>(name, logger);
    app.middleWare.use(middleWares);
    attachTraceLogger(app);

    return app;
}
