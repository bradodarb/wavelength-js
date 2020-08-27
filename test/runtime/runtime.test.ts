import {StructLog} from "../../src/logging/logger";
import {Runtime} from "../../src/runtime/runtime";
import {HandlerState} from "../../src/runtime/state"
import {MiddleWareProvider} from '../../src/middleware';

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
        app.middleWare.use((state) => {
            state.push({treat: 'candy'})
        });
        const handler = app.handler((state) => {
            return 'bamboo';
        });
        const result = await handler({}, {})
        expect(result).toBeDefined();
        expect(result.response).toEqual('Pandas mostly eat undefined, but also really like candy')
    });

    it("should run application with middleware factory", async () => {
        process.env.LOG_LEVEL = 'debug';

        const logger = new StructLog('Test Logger');
        const app = new Runtime<any, any, any, any>('Test App',
            logger, (state) => {
                return {response: `Pandas mostly eat ${state.response}, but also really like ${state.treat}`};
            }, (state) => {
                return {error: 'sad panda'};
            });
        const factory = () => {
            return (state: HandlerState) => {
                state.push({treat: 'candy'})
            }
        }
        app.middleWare.use(factory);
        const handler = app.handler((state) => {
            return 'bamboo';
        });
        const result = await handler({}, {})
        expect(result).toBeDefined();
        expect(result.response).toEqual('Pandas mostly eat undefined, but also really like candy')
    });
    it("should run application with middleware provider", async () => {
        process.env.LOG_LEVEL = 'debug';

        const logger = new StructLog('Test Logger');
        const app = new Runtime<any, any, any, any>('Test App',
            logger, (state) => {
                return {response: `Pandas mostly eat ${state.response}, but also really like ${state.treat}`};
            }, (state) => {
                return {error: 'sad panda'};
            });

        class SampleMiddleWare implements MiddleWareProvider<any, any> {
            treat: string

            constructor(treat: string) {
                this.treat = treat;
            }

            middleWare() {
                const treat = this.treat;
                return (state: HandlerState) => {
                    state.push({treat})
                }
            }
        }

        app.middleWare.use(new SampleMiddleWare('candy'));
        const handler = app.handler((state) => {
            return 'bamboo';
        });
        const result = await handler({}, {})
        expect(result).toBeDefined();
        expect(result.response).toEqual('Pandas mostly eat undefined, but also really like candy')
    });
});
