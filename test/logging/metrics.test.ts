import {Metrics} from "../../src/logging";




describe("Metrics tests", () => {
    beforeAll((done) => {

        done();
    });
    beforeEach((done) => {

        done();
    });
    afterAll((done) => {
        done();
    });

    it("should create metrics and output in desired format", async () => {
        const metrics = new Metrics()
        metrics.counter('red').inc();
        metrics.gauge('blue').update(123.22);
        metrics.gauge('orange').update(555);
        metrics.timer('whenner').start();
        metrics.set('vals', [1, 1, 2, 2, 3, 3]);
        await new Promise(r => setTimeout(r, 123));
        metrics.timer('whenner').stop();
        metrics.set('vals').append(metrics.timer('whenner').value)
        expect(Object.keys(metrics.result.metrics)).toEqual(['gauges', 'counters', 'timers', 'sets']);

    });


});
