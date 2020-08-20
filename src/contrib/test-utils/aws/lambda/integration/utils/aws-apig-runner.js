const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
AWS.config.credentials = credentials;

const axios = require('axios');
const { getSecret } = require('./secrets');

async function getToken() {
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    params: {
      grant_type: 'client_credentials',
      scope: 'ipc/order.write',
    },
    url: await getSecret(process.env.COGNITO_URL),
    auth: {
      username: await getSecret(process.env.USER_POOL_ID),
      password: await getSecret(process.env.APP_CLIENT_SECRET),
    },
  };
  console.log('Retrieving Cognito Auth Token', { options });
  const token = await axios(options);

  return token.data.access_token;
}

function eventToRequest(basePath, event, auth) {
  const result = {
    url: `${basePath}${event.resource}`,
    method: event.method,
    params: event.queryStringParameters,
    headers: { ...event.headers, ...auth },
    data: event.body,
  };
  if (event.pathParameters) {
    Object.keys(event.pathParameters).forEach((key) => {
      result.url = result.url.replace(`{${key}}`, event.pathParameters[key]);
    });
  }
  return result;
}

class AWSAPIGClient {
  constructor(url = process.env.APIG) {
    this.url = url;
  }
  // eslint-disable-next-line class-methods-use-this
  async token() {
    if (!AWSAPIGClient.TOKEN) {
      AWSAPIGClient.TOKEN = await getToken();
    }
    return AWSAPIGClient.TOKEN;
  }

  async baseUrl() {
    if (!AWSAPIGClient.URL) {
      AWSAPIGClient.URL = await getSecret(this.url);
    }
    return AWSAPIGClient.URL;
  }

  async call(event) {
    console.info('API TEST CALL', { event });
    try {
      const token = await this.token();
      const auth = { Authorization: `Bearer ${token}` };
      const baseUrl = await this.baseUrl();
      const requestOptions = eventToRequest(baseUrl, event, auth);

      console.log('Sending API Request', { requestOptions });
      const response = await axios(requestOptions);
      console.info('API Execution Complete', {
        status: response.status,
        response: response.data,
      });
      const result = {
        body: response.data,
        statusCode: response.status,
        statusText: response.statusText,
      };
      console.log('API Response', { result });
      return result;
    } catch (error) {
      if (error.response) {
        const result = {
          body: error.response.data,
          statusCode: error.response.status,
          statusText: error.response.statusText,
          error: error.message,
        };
        console.error('API Error', result);
        return result;
      }
      console.error('Unhandled Error', error);
      return { statusCode: 500, body: error, statusText: 'Unhandled Invoker Error' };
    }
  }
}

module.exports = {
  AWSAPIClient: AWSAPIGClient,
  getToken,
  eventToRequest,
};

