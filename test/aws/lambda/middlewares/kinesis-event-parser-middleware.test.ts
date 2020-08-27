import {KinesisEventParserMiddleware} from "../../../../src/aws/lambda/middlewares";
import {State} from "../../../../src/runtime";
import {Context, KinesisStreamEvent} from "aws-lambda";
import * as recordsEvent from '../test-data/kinesis-records-event.json';
import * as jsonRecordsEvent from '../test-data/kinesis-records-json-event.json';
import * as invalidJsonRecordsEvent from '../test-data/kinesis-records-invalid-json-event.json';
import {StructLog} from "../../../../src/logging/logger";

const context = require('aws-lambda-mock-context');


describe("Kinesis event parser middleware tests", () => {
    beforeAll((done) => {

        done();
    });
    beforeEach((done) => {
        done();
    });
    afterAll((done) => {
        done();
    });

    it("should parse records", async () => {
        const logger = new StructLog('Test')
        const ware = new KinesisEventParserMiddleware();
        const state = new State<KinesisStreamEvent, Context>(
            'Test',
            recordsEvent as KinesisStreamEvent,
            context(),
            logger
        )
        ware.middleWare()(state);

        expect(state.records).toBeDefined()
    });

    it("should parse JSON records", async () => {
        const logger = new StructLog('Test')
        const ware = new KinesisEventParserMiddleware();
        const state = new State<KinesisStreamEvent, Context>(
            'Test',
            jsonRecordsEvent as KinesisStreamEvent,
            context(),
            logger
        )
        ware.middleWare()(state);

        expect(state.records).toBeDefined()
    });

    it("should parse bad JSON records", async () => {
        const logger = new StructLog('Test')
        const ware = new KinesisEventParserMiddleware();
        const state = new State<KinesisStreamEvent, Context>(
            'Test',
            invalidJsonRecordsEvent as KinesisStreamEvent,
            context(),
            logger
        )
        ware.middleWare()(state);

        expect(state.records).toBeDefined()
    });
});
