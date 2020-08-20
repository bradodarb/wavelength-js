/** @module aws-object-utils */

const _ = require('lodash');

/**
 * Retrieves the stage based on a few possible input(s):
 * 1) if stage declared in the event
 * 2) if stage prefixed in the function name in the context.
 * 3) if stage prefixed in the function name as an env variable.
 * @param context
 * @returns {string}
 */
function getStage(context) {
  let tokens = [];
  if (context) {
    tokens = context.functionName.split('-');
  } else {
    const envFunctionName = process.env.AWS_LAMBDA_FUNCTION_NAME || '';
    tokens = envFunctionName.split('-');
  }

  if (tokens.length > 1) {
    return tokens[tokens.length - 2];
  }
  return '';
}

module.exports = {
  getStage,
};
