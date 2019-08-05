const humanJoin = require('../../../src/utils/string');

describe('Testing Retry', () => {
  it('should throw an error if the parameter is not an array', () => {
    try {
      humanJoin(null);
    } catch (e) {
      expect(e).toEqual(new Error('the first argument must be of type Array'));
    }
  });

  it('should throw an error if the parameter is null', () => {
    try {
      humanJoin(null);
    } catch (e) {
      expect(e).toEqual(new Error('the first argument must be of type Array'));
    }
  });

  it('should return the first element if the array if of length 1', () => {
    const res = humanJoin(['test']);
    expect(res).toEqual('test');
  });

  it('should combine the elements in the array', () => {
    const res = humanJoin(['hello', 'world']);
    expect(res).toEqual('hello and world');
  });
});
