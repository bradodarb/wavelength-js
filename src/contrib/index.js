const apigBodyMiddleware = require('./middleware/aws/lambda/event-body-middleware');
const lambdaWarmupMiddleware = require('./middleware/aws/lambda/warmup-detection-middleware');
const { apig } = require('./errors');

module.exports = {
  middleware: {
    aws: {
      apigBodyMiddleware,
      lambdaWarmupMiddleware,
    },
  },
  errors: {
    aws: {
      apig,
    },
  },
};
