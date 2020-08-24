const apigBodyMiddleware = require('./middleware/aws/lambda/event-body-middleware');
const lambdaWarmupMiddleware = require('./middleware/aws/lambda/warmup-detection-middleware');
const { apig } = require('./errors');
const { BufferedCloudWatchLogger } = require('./logging/aws/buffered-cloudwatch-logger');
const { respond: apigReponse, error: apigError } = require('./response/aws/apig');
const { AWSAPIClient } = require('./test-utils/aws/lambda/integration/utils/aws-apig-runner');
const { Invoker } = require('./test-utils/aws/lambda/integration/utils/invoker');
const contextMock = require('./test-utils/aws/lambda/integration/utils/context');


const logging = {
  aws: {
    BufferedCloudWatchLogger,
  },
};

const middleware = {
  aws: {
    apigBodyMiddleware,
    lambdaWarmupMiddleware,
  },
};
const errors = {
  aws: {
    apig,
  },
};
const output = {
  aws: {
    apig: {
      response: apigReponse,
      error: apigError,
    },
  },
};
const test = {
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
};

export {
  logging,
  middleware,
  errors, output, test,

};
