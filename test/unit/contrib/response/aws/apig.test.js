const Context = require('../../../../util/lambda-context-mock');
const { getStandardResponse } = require('../../../../../src/contrib/response/aws/apig');

describe('Testing AWS Object Utils', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });
  it('checks getStandardReponse', () => {
    const expected = {
      body: 'test123',
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 200,
    };
    expect(getStandardResponse({ body: 'test123', status: 200 })).toEqual(expected);
  });

  it('checks getStandardReponse300', () => {
    const expected = {
      body: 'test123',
      headers: {
        'header1': 'header_val_1',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 300,
    };
    expect(getStandardResponse({ body: 'test123', status: 300, headers: { header1: 'header_val_1' } })).toEqual(expected);
  });

  it('checks getStandardReponseNoCORS', () => {
    const expected = {
      body: 'test123',
      headers: { header1: 'header_val_1' },
      statusCode: 200,
    };
    expect(getStandardResponse({
      body: 'test123',
      status: 200,
      headers: { header1: 'header_val_1' },
      addCors: false,
    })).toEqual(expected);
  });
});
