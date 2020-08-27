import {APIGatewayProxyApplication} from "../../../src/aws/lambda";
import {BaseException} from "../../../src/errors";
const createEvent = require('aws-event-mocks');
const context = require('aws-lambda-mock-context');
let events: any[] = [];
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

// @ts-ignore
function logSnoop(...args) {
    events.push(...args);
}

describe("APIG Runtime tests", () => {
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

    it("should run APIG application", async () => {
        process.env.LOG_LEVEL = 'debug';

        const event = createEvent({
            template: 'aws:apiGateway',
            merge: {
                body: {
                    first_name: 'Sam',
                    last_name: 'Smith'
                }
            }
        });
        const hello = APIGatewayProxyApplication('Hello').handler(state => {
            if(state.event.queryStringParameters && state.event.queryStringParameters.boom){
                throw new BaseException('Boom goes the dynamite', 'Physics', 20);
            }else{
                return {goodThings: true};
            }
        });
       const result = await hello(event, context());
       expect(result).toBeDefined()
    });


});
