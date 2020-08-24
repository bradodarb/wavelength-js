import apigBodyMiddleware from './middleware/aws/lambda/event-body-middleware';
import lambdaWarmupMiddleware from './middleware/aws/lambda/warmup-detection-middleware';
import { apig } from './errors';
import { BufferedCloudWatchLogger, serializers } from './logging/aws/buffered-cloudwatch-logger';
import * as apigResponse from './response/aws/apig';
import { AWSAPIClient } from './test-utils/aws/lambda/integration/utils/aws-apig-runner';
import { Invoker } from './test-utils/aws/lambda/integration/utils/invoker';
import Context from './test-utils/aws/lambda/integration/utils/context';


const logging = {
  aws: {
    BufferedCloudWatchLogger,
    serializers,
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
      response: apigResponse.respond,
      error: apigResponse.error,
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
    Context,
    Invoker,
  },
};

export {
  logging,
  middleware,
  errors, output, test,

};
