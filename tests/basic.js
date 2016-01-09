import assert from 'assert';
import {describe, it} from 'mocha';
import {generalizeFrom} from '../';

describe('basic object generalization', () => {

  // TODO: compare set values as sets, e.g., when type: string[]

  it('should generalize homogenous number types', () => {
    var actual = generalizeFrom(
      100,
      -90,
      45,
      3.14159,
    );
    assert.deepEqual(actual, {type: 'number'});
  });

  it('should generalize homogenous string types', () => {
    var actual = generalizeFrom(
      'I could',
      'not',
      'care',
      'less!',
    );
    assert.deepEqual(actual, {type: 'string'});
  });

  it('should generalize nullable string types', () => {
    var actual = generalizeFrom(
      'Hello',
      null,
      'world!',
      null,
    );
    assert.deepEqual(actual, {type: ['string', 'null']});
  });

  it('should generalize more than two distinct types', () => {
    var actual = generalizeFrom(
      null,
      'Hello',
      123,
    );
    assert.deepEqual(actual, {type: ['null', 'string', 'number']});
  });

  it('should ignore undefined instances', () => {
    var actual = generalizeFrom(
      1,
      2,
      undefined,
      3,
    );
    assert.deepEqual(actual, {type: 'number'});
  });

  it('should generalize identical object types', () => {
    var actual = generalizeFrom(
      { name: 'Curious George', age: 5 },
      { name: 'Mark Bedelman', age: 47 },
    );
    assert.deepEqual(actual, {
      type: 'object',
      properties: {
        name: {type: 'string'},
        age: {type: 'number'},
      },
    });
  });

  it('should build schema from distinct types', () => {
    var actual = generalizeFrom(
      'incredible',
      800,
    );
    assert.deepEqual(actual, {
      type: ['string', 'number'],
    });
  });

  it('should build schema from objects with distinct property sets', () => {
    var actual = generalizeFrom(
      { name: 'Curious George', age: 5 },
      { breed: 'Schnauzer', age: false },
    );
    assert.deepEqual(actual, {
      type: 'object',
      properties: {
        name: {type: 'string'},
        breed: {type: 'string'},
        age: {
          type: ['number', 'boolean'],
        },
      },
    });
  });

  it('should build schema from objects with identical object types but different lengths', () => {
    var actual = generalizeFrom(
      [
        { name: 'Curious George', email: 'cgeorge@example.org' },
      ],
      [
        { name: 'Bran Kurtz', email: 'bkurtz@example.org' },
        { name: 'Kev Bravado', email: 'kbravado@example.org' },
      ],
    );
    assert.deepEqual(actual, {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          email: {type: 'string'},
        },
      },
    });
  });

});
