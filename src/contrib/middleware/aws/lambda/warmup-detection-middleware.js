import { get } from 'lodash';
import { CancelExecutionError } from '../../../../errors';

export default (state) => {
  let result = null;
  if (get(state, 'event.source') === 'serverless-plugin-warmup') {
    result = new CancelExecutionError();
    state.logger.info(
      'TRACE', 'serverless plugin warm-up invocation, skipping processing',
      { limitOutput: false, state: 'Skip' },
    );
  }
  return result;
};
