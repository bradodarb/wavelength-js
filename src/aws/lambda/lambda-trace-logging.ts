import {EventEmitter} from 'events';

export default function attachTraceLogger(runtime:EventEmitter):void{
    runtime.on('enter', (state) => {
        state.logger.info(
            'TRACE',
            {
                lambda_event: state.event,
                state: 'Invoked',
                context: state.context,
            }
        );
    });
    runtime.on('exit', (state) => {
        state.logger.info(
            'TRACE',
            {
                state: 'Completed',
                result: state.value,
            });
    });
    runtime.on('success', (state) => {
        state.logger.info(
            'Lambda Execution Success',
            {
                state: 'Success',
            });
    });
    runtime.on('failure', (state) => {
        state.logger.error(
            'Lambda Execution Failed',
            {
                state: 'Failed'
            });
    });
}
