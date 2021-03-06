import {StructLog} from "../../src/logging/logger";
import BufferedLogger from "../../src/logging/buffered-logger";

let events: any[] = [];
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

// @ts-ignore
function logSnoop(...args) {
    events.push(...args);
}

describe("Logger tests", () => {
    beforeAll((done) => {
        // @ts-ignore
        process.stdout.write = (chunk, encoding, callback) => {
            logSnoop(chunk);
        };
        done();
    });
    beforeEach((done) => {
        delete process.env.LOG_LEVEL;
        events = [];
        done();
    });
    afterAll((done) => {
        process.stdout.write = originalStdoutWrite;
        done();
    });

    it("should create Logger and output to stdout", () => {
        process.env.LOG_LEVEL = 'debug';
        const logger = new StructLog('Test Logger');

        logger.debug('Test Event', {boom:'dynamite'});
        expect(logger.name).toBe('Test Logger');
        expect(events.length).toBe(1)
    });

    it("should create Logger with buffered stream", () => {
        process.env.LOG_LEVEL = 'DEBUG';
        const logger = new BufferedLogger('Test Logger');

        logger.debug('Test Event');
        logger.debug('Test Event', {'all_your_base': 123});
        expect(logger.name).toBe('Test Logger');
        expect(events.length).toBe(0);
        logger.close();

        expect(events.length).toBe(1);
        const logBuffer = JSON.parse(events[0])
        expect(logBuffer.items.length).toBe(2);
    });

    it("should append bindings on chained calls", () => {
        process.env.LOG_LEVEL = 'debug';
        const logger = new StructLog('Test Logger');

        logger.info('Some Event', 'The deets!', {smol:'thing'}).debug({big:[1,2,3,4,5,6,7,8,9,10]})

        expect(logger.name).toBe('Test Logger');
        expect(events.length).toBe(2)
        const logBuffer = JSON.parse(events[0])

    });

});
