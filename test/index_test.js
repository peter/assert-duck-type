'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    assertTypes = require('../index'),
    typeOf = assertTypes.typeOf,
    duckType = assertTypes.duckType,
    checkTypes = assertTypes.checkTypes;

describe('assert-duck-type', function() {
  describe('typeOf', function() {
    it('works with null and undefined', function() {
      assert.equal(typeOf(null), 'null');
      assert.equal(typeOf(), 'undefined');
      assert.equal(typeOf(undefined), 'undefined');
    });

    it('works with primitive types', function() {
      assert.equal(typeOf(5), 'number');
      assert.equal(typeOf(6.34), 'number');
      assert.equal(typeOf(true), 'boolean');
      assert.equal(typeOf(false), 'boolean');
      assert.equal(typeOf('foobar'), 'string');
    });

    it('works with arrays, plain objects, and functions', function() {
      assert.equal(typeOf({}), 'object');
      assert.equal(typeOf({foo: 1}), 'object');
      assert.equal(typeOf([]), 'array');
      assert.equal(typeOf(function() {}), 'function');
    });

    it('works with RegExp and Date', function() {
      assert.equal(typeOf(new Date()), 'date');
      assert.equal(typeOf(/foobar/), 'regexp');
    });
  });

  describe('duckType', function() {
    it('works with string types', function() {
      assert.equal(duckType('string', 'foobar'), true);
      assert.equal(duckType('string', 5), false);

      assert.equal(duckType('number', 5), true);
      assert.equal(duckType('number', '5'), false);

      assert.equal(duckType('boolean', true), true);
      assert.equal(duckType('boolean', false), true);
      assert.equal(duckType('boolean', 'true'), false);

      assert.equal(duckType('object', {}), true);
      assert.equal(duckType('object', {foo: 1}), true);
      assert.equal(duckType('object', function() {}), false);
      assert.equal(duckType('object', new Date()), false);
      assert.equal(duckType('object', /foobar/), false);

      assert.equal(duckType('function', function() {}), true);
      assert.equal(duckType('array', []), true);
      assert.equal(duckType('array', [1, 2]), true);
    });

    it('works with optional string types that also allow null/undefined', function() {
      assert.equal(duckType('string?', 'foobar'), true);
      assert.equal(duckType('string?', null), true);
      assert.equal(duckType('string?', undefined), true);
      assert.equal(duckType('string?', 5), false);
      assert.equal(duckType('string?', true), false);

      assert.equal(duckType('number?', 5), true);
      assert.equal(duckType('number?', null), true);
      assert.equal(duckType('number?', '5'), false);

      assert.equal(duckType('boolean?', true), true);
      assert.equal(duckType('boolean?', false), true);
      assert.equal(duckType('boolean?', null), true);
      assert.equal(duckType('boolean?', undefined), true);
      assert.equal(duckType('boolean?', 'true'), false);
    });

    it('works with object types', function() {
      assert.equal(duckType({foo: 'string'}, {foo: 'bar'}), true)
      assert.equal(duckType({foo: 'string'}, {foo: 'bar', baz: 1}), true)
      assert.equal(duckType({foo: 'string'}, {foo: null}), false)
      assert.equal(duckType({foo: 'string'}, {}), false)

      assert.equal(duckType({foo: {bar: 'boolean'}}, {foo: {bar: true}}), true)
      assert.equal(duckType({foo: {bar: 'array'}}, {foo: {bar: []}}), true)
      assert.equal(duckType({foo: {bar: {baz: 'array'}}}, {foo: {bar: {baz: {}}}}), false)

      assert.equal(duckType({foo: 'string'}, {foo: 5}), false)
      assert.equal(duckType({foo: 'string'}, {bar: 'bar'}), false)
      assert.equal(duckType({foo: 'string'}, {}), false)
      assert.equal(duckType({foo: 'string'}, ['bar']), false)
    });

    it('works with array types', function() {
      assert.equal(duckType([{foo: 'string'}], [{foo: '5'}]), true)
      assert.equal(duckType([{foo: 'string'}], [{foo: 5}]), false)
      assert.equal(duckType([{foo: 'string'}], [{}]), false)
      assert.equal(duckType([{foo: 'string'}], undefined), false)
      assert.equal(duckType([{foo: 'string'}], null), false)
      assert.equal(duckType([{foo: 'string'}], []), true)
      assert.equal(duckType([{foo: 'string'}], ['bar']), false)
      assert.equal(duckType([{foo: 'string'}], {foo: 'bar'}), false)

      assert.equal(duckType(['string'], ['foo']), true);
      assert.equal(duckType(['string'], [null]), false);
      assert.equal(duckType(['string'], [{}]), false);

      assert.equal(duckType(['string'], []), true);

      assert.equal(duckType([{foo: [{bar: 'boolean'}]}], [{foo: [{bar: true}]}]), true)
      assert.equal(duckType([{foo: [{bar: 'boolean'}]}], [{foo: [{bar: true, baz: 1}]}]), true)
      assert.equal(duckType([{foo: [{bar: 'boolean'}]}], [{foo: [{bar: false}]}]), true)
      assert.equal(duckType([{foo: [{bar: 'boolean'}]}], [{foo: [{bar: 'true'}]}]), false)
      assert.equal(duckType([{foo: [{bar: 'boolean'}]}], [{foo: [{bars: true}]}]), false)
    });
  });

  describe('checkTypes', function() {
    it('does a duckType check on a number of values and returns an error or null', function() {
      var err = checkTypes([{name: 'Joe'}], [{name: 'string', created_at: 'date?'}, 'function?']);
      assert.equal(err, null);

      err = checkTypes([{name: 'Joe'}, function() {}], [{name: 'string', created_at: 'date?'}, 'function?']);
      assert.equal(err, null);

      err = checkTypes([{name: 'Joe'}, 5], [{name: 'string', created_at: 'date?'}, 'function?']);
      assert(err instanceof Error);
      assert(err.message.indexOf('Invalid types') > -1);
      assert.equal(err.invalidTypes, [{i: 1, type: 'function?', value: 5}]);

      err = checkTypes([{names: 'Joe'}, 5], [{name: 'string'}, 'function?']);
      assert(err instanceof Error);
      assert(err.message.indexOf('Invalid types') > -1);
      assert.equal(err.invalidTypes, [
        {i: 0, type: {name: 'string'}, value: {names: 'Joe'}},
        {i: 1, type: 'function?', value: 5}]);
    });
  });

  describe('assertTypes', function() {
    var fn = function() {};
    fn.find = function() {};
    assertTypes([fn, 5, true], {find: 'function'}, 'number', 'boolean', 'date?');
    assertTypes([fn, 5, true, new Date()], {find: 'function'}, 'number', 'boolean', 'date?');

    assert.throws(
      function() {
        assertTypes([{bar: function() {}}], {foo: 'function'});
      },
      function(err) {
        return err.invalidTypes.length === 1;
      }
    );

    assertTypes([{foo: 5, bar: 1}], {foo: 'number'});
    assertTypes([{foo: '5'}], {foo: 'string'});
    assert.throws(
      function() {
        assertTypes([{foo: 5}], {foo: 'string'});
      },
      function(err) {
        return err.invalidTypes.length === 1;
      }
    );
  });
});
