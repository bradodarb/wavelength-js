
const uuid = require('uuid');
const moment = require('moment');
const pkg = require('../../package.json');


class ContextMock {
  constructor(options) {
    const opts = Object.assign({
      region: 'us-west-1',
      account: '123456789012',
      functionName: pkg.name,
      functionVersion: '$LATEST',
      memoryLimitInMB: '128',
      timeout: 3,
    }, options);

    const id = uuid.v1();
    this.callbackWaitsForEmptyEventLoop = true;
    this.functionName = opts.functionName;
    this.functionVersion = opts.functionVersion;
    this.invokedFunctionArn = `arn:aws:lambda:${opts.region}:${opts.account}:function:${opts.functionName}:${opts.alias || opts.functionVersion}`;
    this.memoryLimitInMB = opts.memoryLimitInMB;
    this.awsRequestId = id;
    this.invokeid = id;
    this.logGroupName = `/aws/lambda/${opts.functionName}`;
    this.logStreamName = `${moment().format('YYYY/MM/DD')}/[${opts.functionVersion}]/${uuid.v4().replace(/-/g, '')}`;
  }

  getRemainingTimeInMillis() {
    const endTime = end || Date.now();
    const remainingTime = (opts.timeout * 1000) - (endTime - start);

    return Math.max(0, remainingTime);
  }

  succeed(result) {
    end = Date.now();

    deferred.resolve(result);
  }

  fail(err) {
    end = Date.now();

    if (typeof err === 'string') {
      err = new Error(err);
    }

    deferred.reject(err);
  }

  done(err, result) {
    if (err) {
      context.fail(err);
      return;
    }

    context.succeed(result);
  }
}

module.exports = ContextMock;
