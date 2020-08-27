import Kinesis, {
    PutRecordInput,
    PutRecordOutput,
    PutRecordsInput,
    PutRecordsOutput,
    PutRecordsRequestEntry
} from "aws-sdk/clients/kinesis";
import stringify from 'fast-safe-stringify';
import {StructLog, StructuredLogger} from "../../../logging";
import {Serializable, Serializer} from "../../type-utils";
import {BaseException} from "../../../errors";

const MAX_BATCH_SIZE = 500;

interface KinesisProducerOptions {
    useExplicitHashKey?: boolean;
    serializer: Serializer;
    keyGenerator: Serializer;
}

class TooManyItemsForBatchException extends BaseException {
    constructor() {
        super('PutRecords only supports maximum of 500 items');
    }
}

class TooFewItemsForBatchException extends BaseException {
    constructor() {
        super('PutRecords requires at least 1 item');
    }
}

class KinesisProducer<T = Serializable> {

    public streamName: string;
    protected client: Kinesis;
    protected logger: StructuredLogger;
    protected options: KinesisProducerOptions;

    constructor(streamName: string, client?: Kinesis, logger?: StructuredLogger, options?: KinesisProducerOptions) {
        this.streamName = streamName;
        this.client = client || new Kinesis();
        this.logger = logger || new StructLog(streamName);
        this.options = Object.assign({}, this.getDefaultOptions(), options);
    }

    async put(item: T, key?: string, sequenceNumber?: string): Promise<PutRecordOutput> {
        const record: PutRecordInput = {
            StreamName: this.streamName,
            Data: this.options.serializer(item),
            PartitionKey: key || this.options.keyGenerator(item),
        }
        if (sequenceNumber) {
            record.SequenceNumberForOrdering = sequenceNumber;
        }
        if (this.options.useExplicitHashKey) {
            record.ExplicitHashKey = key;
        }
        this.logger.debug('KinesisProducer', 'PutRecord Init', {record})
        const result = this.client.putRecord(record).promise();
        this.logger.debug('KinesisProducer', 'PutRecord Complete', {result})
        return result;
    }

    async putBatch(items: T[], key?: string): Promise<PutRecordsOutput> {
        if (!items) {
            throw new TooFewItemsForBatchException();
        }
        if (items.length > MAX_BATCH_SIZE) {
            throw new TooManyItemsForBatchException();
        }
        const records: PutRecordsInput = {
            Records: items.map(item => {
                const record: PutRecordsRequestEntry = {
                    Data: this.options.serializer(item),
                    PartitionKey: key || this.options.keyGenerator(item),
                }
                if (this.options.useExplicitHashKey) {
                    record.ExplicitHashKey = this.options.keyGenerator(item);
                }
                return record
            }),
            StreamName: this.streamName,
        }


        this.logger.debug('KinesisProducer', 'PutRecords Init', {records})
        const result = this.client.putRecords(records).promise();
        this.logger.debug('KinesisProducer', 'PutRecords Complete', {result})
        return result;
    }

    protected getDefaultOptions(): KinesisProducerOptions {
        return {
            useExplicitHashKey: false,
            serializer: stringify,
            keyGenerator: () => 'DEFAULT',
        }
    }
}

export {KinesisProducer, KinesisProducerOptions, MAX_BATCH_SIZE};
