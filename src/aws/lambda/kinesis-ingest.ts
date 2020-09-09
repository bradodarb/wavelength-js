import {KinesisStreamEvent, Context} from 'aws-lambda';
import {Runtime} from "../../runtime";
import {BufferedLogger} from "../../logging";
export default function KinesisIngestApplication(
    name: string, ):
    Runtime<KinesisStreamEvent, Context> {

    const logger = new BufferedLogger(name);
    return new Runtime<KinesisStreamEvent, Context>(name, logger);

}
