import {performance} from 'perf_hooks'
import * as _ from 'lodash';
import {Indexed, Serializable} from "../util";
import {Metric, MetricCollector, MetricsCounter, MetricsGauge, MetricsSet, MetricsTimer} from './util';


class GaugeMetric implements MetricsGauge {

    name: string;
    value: Indexed = {};
    private values: number[] = [];

    constructor(name: string, initialValue?: number) {
        this.name = name;
        if (initialValue) {
            this.update(initialValue);
        }
    }

    update(value: number): void {
        this.values.push(value);

        this.value = {
            min: Math.min(...this.values),
            max: Math.max(...this.values)
        }
    }

    format(): Indexed<number> {
        return this.value;
    }
}

class CounterMetric implements MetricsCounter {
    name: string;
    value: number;

    constructor(name: string, initialValue: number = 0) {
        this.name = name;
        this.value = initialValue;
    }

    static checkValue(value: number): boolean {
        return _.isFinite(value);
    }

    inc(value: number = 1): void {
        if (CounterMetric.checkValue(value)) {
            this.value += value;
        }
    }

    dec(value: number = 1): void {
        if (CounterMetric.checkValue(value)) {
            this.value -= value;
        }
    }

    format(): number {
        return this.value;
    }
}

class SetMetric<T = Serializable> implements MetricsSet<T> {
    name: string;
    value: Set<T>;

    constructor(name: string, initialValue: T[] = []) {
        this.name = name;
        this.value = new Set(initialValue);
    }

    update(value: T[] = []) {
        this.value = new Set(value);
    }

    append(value: T): void {
        this.value.add(value);
    }

    remove(value: T): void {
        this.value.delete(value);
    }

    reset(): void {
        this.value.clear();
    }

    format(): T[] {
        return [...this.value];
    }
}

class TimerMetric implements MetricsTimer {
    name: string;
    startTime: number;
    value: number;

    constructor(name: string) {
        this.name = name;
        this.startTime = performance.now();
        this.value = 0;
    }

    start() {
        this.startTime = performance.now();
        this.value = 0;
    }

    stop() {
        if (!this.startTime) {
            this.value = 0;
            return;
        }
        this.value = performance.now() - this.startTime;
        this.startTime = this.value;
    }

    format() {
        return this.value;
    }
}

class TimerGaugeMetric implements MetricsTimer  {
    name: string;
    startTime: number;
    value: number;
    private values: number[] = [];

    constructor(name: string) {
        this.name = name;
        this.startTime = performance.now();
        this.value = 0;
    }

    start() {
        this.startTime = performance.now();
        this.value = 0;
    }

    stop() {
        if (!this.startTime) {
            this.value = 0;
            return;
        }
        this.value = performance.now() - this.startTime;
        this.startTime = this.value;
        this.values.push(this.value);
    }

    format() {
        return {
            min: Math.min(...this.values),
            max: Math.max(...this.values)
        }
    }
}

class Metrics implements MetricCollector {

    private timers: Indexed<TimerMetric> = {};
    private counters: Indexed<CounterMetric> = {};
    private gauges: Indexed<GaugeMetric> = {};
    private sets: Indexed<SetMetric> = {};
    private timerGauges: Indexed<TimerGaugeMetric> = {};

    get result() {
        const metrics = {};
        if (!_.isEmpty(this.gauges)) {
            Object.assign(metrics, this.getCollection('gauges', this.gauges));
        }
        if (!_.isEmpty(this.counters)) {
            Object.assign(metrics, this.getCollection('counters', this.counters));
        }
        if (!_.isEmpty(this.timers)) {
            Object.assign(metrics, this.getCollection('timers', this.timers));
        }
        if (!_.isEmpty(this.sets)) {
            Object.assign(metrics, this.getCollection('sets', this.sets));
        }
        if (!_.isEmpty(this.timerGauges)) {
            Object.assign(metrics, this.getCollection('gauges', this.timerGauges));
        }

        return {
            metrics
        };
    }

    reset() {
        this.timers = {};
        this.counters = {};
        this.gauges = {};
        this.sets = {};
        this.timerGauges = {};
    }

    set(name: string, items?: Serializable[]) {
        if (!this.sets[name]) {
            this.sets[name] = new SetMetric(name, items);
        }
        return this.sets[name];
    }

    gauge(name: string) {
        if (!this.gauges[name]) {
            this.gauges[name] = new GaugeMetric(name);
        }
        return this.gauges[name];
    }

    timer(name: string) {
        if (!this.timers[name]) {
            this.timers[name] = new TimerMetric(name);
        }
        return this.timers[name];
    }

    timerGauge(name: string) {
        if (!this.timerGauges[name]) {
            this.timerGauges[name] = new TimerGaugeMetric(name);
        }
        return this.timerGauges[name];
    }
    counter(name: string) {
        if (!this.counters[name]) {
            this.counters[name] = new CounterMetric(name);
        }
        return this.counters[name];
    }

    protected getCollection(key: string, metrics: Indexed<Metric>): Indexed<Serializable> {
        const result: Indexed<Indexed> = {
            [key]: {}
        }
        const keys = Object.keys(metrics);
        keys.forEach(k => {
            result[key][k] = metrics[k].format();
        })

        return result;
    }
}

export {Metric, SetMetric, GaugeMetric, CounterMetric, TimerMetric, TimerGaugeMetric, Metrics};
