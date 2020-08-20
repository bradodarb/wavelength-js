const apigBodyMiddleware = require('./middleware/aws/lambda/event-body-middleware');
const lambdaWarmupMiddleware = require('./middleware/aws/lambda/warmup-detection-middleware');
const { apig } = require('./errors');
const {BufferedCloudWatchLogger} = require('./logging/aws/buffered-cloudwatch-logger')

module.exports = {
  logging:{
    aws:{
      BufferedCloudWatchLogger
    }
  },
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
