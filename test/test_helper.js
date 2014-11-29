'use strict';

var _assert = require('assert'),
    _ = require('lodash');

var assert = function(value, message) {
  return _assert.ok(value, message);
};

// Node.js assert.equal and assert.deepEqual are both sloppy (i.e. they use == instead of ===) so instead
// we can use this function to get nested strict equality.
assert.equal = function(actual, expected, message) {
  var explain = "test_helper.assert.equal actual=" + JSON.stringify(actual) + " is not equal to " + JSON.stringify(expected);
  if (message) explain = explain + ": " + JSON.stringify(message);
  if (!_.isEqual(actual, expected)) {
    throw new Error(explain);
    // FIXME: I get no stack trace from mocha when I use AssertionError, why?
    //throw new _assert.AssertionError({actual: actual, expected: expected, message: message});
  }
};

assert.throws = _assert.throws;

module.exports = {
  assert: assert
};
