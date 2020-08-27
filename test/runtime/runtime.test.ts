import {StructLog} from "../../src/logging/logger";
import {Runtime} from "../../src/runtime/runtime";

let events: any[] = [];
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

// @ts-ignore
function logSnoop(...args) {
    events.push(...args);
}

describe("Runtime tests", () => {
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

    it("should run application", async () => {
        process.env.LOG_LEVEL = 'debug';

        const logger = new StructLog('Test Logger');
        const app = new Runtime<any, any>('Test App',
            logger);
        const handler = app.handler((state) => {
            return 'bamboo';
        });
        const result = await handler({}, {})
        expect(result).toBeDefined();
    });


    it("should run application with middleware", async () => {
        process.env.LOG_LEVEL = 'debug';

        const logger = new StructLog('Test Logger');
        const app = new Runtime<any, any, any, any>('Test App',
            logger, (state) => {
                return {response: `Pandas mostly eat ${state.response}, but also really like ${state.treat}`};
            }, (state) => {
                return {error: 'sad panda'};
            });
        app.middleWare.use(state => {
            state.push({treat: 'candy'})
        });
        const handler = app.handler((state) => {
            return 'bamboo';
        });
        const result = await handler({}, {})
        expect(result).toBeDefined();
    });
});
