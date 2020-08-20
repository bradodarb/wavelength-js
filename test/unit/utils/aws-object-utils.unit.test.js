const Context = require('../../util/lambda-context-mock');
const { getStage } = require('../../../src/utils/aws-object-utils');

const context = new Context({ functionName: 'stage-func' });
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

  it('checks that getStage returns stage name from context', () => {
    expect(getStage(context)).toBe('stage');
  });

  it('checks that getStage returns stage name from ENV VAR', () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'stage2-func';
    expect(getStage()).toBe('stage2');
  });
});
