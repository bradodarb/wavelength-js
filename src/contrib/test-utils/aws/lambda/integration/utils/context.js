function Context(options, cb) {
  return {
    succeed(result) {
      if (result === undefined) {
        return cb(null);
      }
      if (typeof result !== 'string') {
        return cb(JSON.stringify(result));
      }
      return cb(result);
    },
    fail(error) {
      if (error === undefined) {
        return cb(null);
      }
      return cb(error);
    },
    done(err, result) {
      if (err) {
        return this.fail(err);
      }
      return this.succeed(result);
    },
    getRemainingTimeInMillis() {
      if (typeof this.timeInMillis !== 'number') {
        return 0;
      }
      return this.timeInMillis;
    },
    functionName: options.functionName || '',
    functionVersion: options.functionVersion || '',
    invokedFunctionArn: options.invokedFunctionArn || '',
    memoryLimitInMB: options.memoryLimitInMB || '',
    awsRequestId: options.awsRequestId || '',
    logGroupName: options.logGroupName || '',
    logStreamName: options.logStreamName || '',
    identity: options.identity || {},
    clientContext: options.clientContext || {},
    timeInMillis: options.timeInMillis || 3000,
  };
}
export default
{
  Context,
};
