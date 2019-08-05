const { serializer, safeString } = require('../../../src/utils/json-serializer');

describe('Testing JSON Serializer', () => {
  beforeAll((done) => {
    done();
  });
  beforeEach((done) => {
    done();
  });
  afterAll((done) => {
    done();
  });

  it('checks that circular refs are replaced', () => {
    let testObject = {
      email: 'test@emails.com',
      phone: '555-555-5555',
      street: '123 Fake Street',
    };
    testObject.ref = testObject;

    try {
      JSON.stringify(testObject);
      // fail('Type error should have been thrown');
    } catch (e) {
      expect(e instanceof TypeError).toBeTruthy();
    }

    const result = JSON.stringify(testObject, serializer());

    expect(result).toBe('{"email":"test@emails.com","phone":"555-555-5555","street":"123 Fake Street","ref":"[Circular]"}');
    testObject = JSON.parse(result);

    expect(testObject.ref).toBe('[Circular]');
  });


  it('checks that safeString works with objects', () => {
    const source = {
      abc: 123,
    };

    expect(safeString(source)).toBe('{"abc":123}');
  });

  it('checks that safeString works with strings', () => {
    const source = 'All your base';

    expect(safeString(source)).toBe(source);
  });

  it('checks that safeString works with numerics', () => {
    expect(safeString(0)).toBe('0');
    expect(safeString(2001)).toBe('2001');
  });


  it('checks that safeString works with booleans', () => {
    expect(safeString(true)).toBe('true');
    expect(safeString(false)).toBe('false');
  });
  it('checks that safeString works with null-ish objects', () => {
    expect(safeString(null)).toBe('');
    expect(safeString(undefined)).toBe('');
    expect(safeString()).toBe('');
  });
});
