const { Wavelength } = require('../../../src');
const Context = require('../../util/lambda-context-mock');


const testContext = new Context();
describe('Testing Jest Reporter compatibility issues', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });

  jest.mock('../../../src')
  it('checks that BaseException.getResponse object is formatted correctly', () => {

    var wl= new Wavelength({name:'red', event:{}, context:testContext});

    expect(wl).toBeDefined()
  });

});
