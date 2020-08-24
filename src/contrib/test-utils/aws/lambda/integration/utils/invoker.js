require('../../../../utils/local-env');

const AWS = require('aws-sdk');


if (!process.env.STAGE && process.env.DynamoOrderEndpoint) {
  AWS.config.dynamodb = { endpoint: process.env.DynamoOrderEndpoint };
}

const lambda = new AWS.Lambda({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
});
const { AWSAPIClient } = require('./aws-apig-runner');
const context = require('./context');

class Invoker {
  constructor({ resource, localFunction, config = {} }) {
    this.resource = resource;
    this.local = localFunction;
    this.config = config;
  }

  async invoke(event) {
    if (!process.env.STAGE) {
      return this.invokeLocal(event);
    }
    if (this.config.type.toLowerCase() === 'api') {
      return this.invokeAPI(event);
    }
    return this.invokeLambda(event);
  }

  async invokeLocal(event) {
    let localEvent = event;
    if (this.config.type.toLowerCase() === 'api') {
      localEvent = Object.assign({}, event, {
        path: this.resource,
        httpMethod: this.config.method,
      });
    }
    const result = this.local(localEvent, context(this.config.context || {}));
    if (result.body && typeof result.body === 'string') {
      try {
        result.body = JSON.parse(result.body);
      } catch (e) {
        console.log('Failed to convert body into object');
      }
    }
    return result;
  }
  async invokeLambda(event) {
    return lambda.invoke({
      FunctionName: this.resource,
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify(event, null, 2),
    }).promise();
  }
  async invokeAPI(event) {
    const eventSource = {
      resource: this.resource,
      method: this.config.method,
    };
    const client = new AWSAPIClient();
    return client.call(Object.assign({}, eventSource, event));
  }
}

export default { Invoker };
