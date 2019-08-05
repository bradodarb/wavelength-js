function setDefaults(options, type) {
  const defaultOptions = {
    'dynamo': {
      awsRegion: 'eu-west-1',
      eventSourceARN: 'arn:aws:dynamodb:us-west-2:account-id:table/ExampleTableWithStream/stream/2015-06-27T00:48:05.899',
      events: [{ type: 'INSERT', number: 1 }],
    },
    'sns': {
      message: 'default test message',
    },
    'api-gateway': {
      path: 'default/path',
      method: 'GET',
      headers: {
        'default-header': 'default',
      },
      queryStringParameters: {
        query: 'default',
      },
      pathParameters: {
        uuid: '1234',
      },
      stageVariables: {
        ENV: 'test',
      },
      body: 'default body',
    },
  };

  if (typeof options !== 'object') {
    return defaultOptions[type];
  }
  return Object.keys(defaultOptions[type]).reduce((opts, curr) => {
    opts[curr] = opts[curr] ? opts[curr] : defaultOptions[type][curr];
    return opts;
  }, options);
}
function createAPIGatewayEvent(opts) {
  const options = setDefaults(opts, 'api-gateway');

  return {
    resource: '/assets',
    path: options.path,
    httpMethod: options.method,
    headers: options.headers,
    queryStringParameters: options.queryStringParameters,
    pathParameters: options.pathParameters,
    stageVariables: options.stageVariables,
    requestContext: {
      accountId: '1234',
      resourceId: 'snmm5d',
      stage: 'test-invoke-stage',
      requestId: 'test-invoke-request',
      identity: {
        cognitoIdentityPoolId: null,
        accountId: '1234',
        cognitoIdentityId: null,
        caller: '1234',
        apiKey: 'test-invoke-api-key',
        sourceIp: 'test-invoke-source-ip',
        accessKey: '1234',
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: 'arn:aws:iam::1234:user/test_user',
        userAgent: 'Apache-HttpClient/4.5.x (Java/1.8.0)',
        user: '1234',
      },
      resourcePath: options.path,
      httpMethod: options.method,
      apiId: '1234',
    },
    body: options.body,
    isBase64Encoded: false,
  };
}
module.exports = { createAPIGatewayEvent };
