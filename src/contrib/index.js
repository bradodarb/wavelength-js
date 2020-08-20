const apigBodyMiddleware = require('./middleware/aws/lambda/event-body-middleware');
const lambdaWarmupMiddleware = require('./middleware/aws/lambda/warmup-detection-middleware');
const { apig } = require('./errors');
const { BufferedCloudWatchLogger } = require('./logging/aws/buffered-cloudwatch-logger');
const { respond: apigReponse, error: apigError } = require('./response/aws/apig');
const { AWSAPIClient } = require('./test-utils/aws/lambda/integration/utils/aws-apig-runner');
const { Invoker } = require('./test-utils/aws/lambda/integration/utils/invoker');
const contextMock = require('./test-utils/aws/lambda/integration/utils/context');

module.exports = {
  logging: {
    aws: {
      BufferedCloudWatchLogger,
    },
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
  output: {
    aws: {
      apig: {
        response: apigReponse,
        error: apigError,
      },
    },
  },
  test: {
    aws: {
      lambda: {
        integration: {

        },
      },
    },
    utils: {
      AWSAPIClient,
      contextMock,
      Invoker,
    },
  },
};
