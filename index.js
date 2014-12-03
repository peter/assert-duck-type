'use strict';

var toString = Object.prototype.toString;

var typeOf = function(value) {
  var type = typeof value;
  if (type === 'object') {
    if (value === null) {
      type = 'null';
    } else if (value === undefined) {
      type = 'undefined';
    } else if ((typeof value.length === 'number') && toString.call(value) === '[object Array]') {
      type = 'array';
    } else if (toString.call(value) === '[object Date]') {
      type = 'date';
    } else if (toString.call(value) === '[object RegExp]') {
      type = 'regexp';
    }
  }
  return type;
};

var duckType = function(type, value) {
  if (typeOf(type) === 'string') {
    if (type.indexOf('?') === (type.length-1)) {
      return typeOf(value) === type.substring(0, type.length-1) || value === null || value === undefined;
    } else {
      return typeOf(value) === type;
    }
  } else if (typeOf(type) === 'object') {
    var keys = Object.keys(type);
    for (var i = 0; i < keys.length; ++i) {
      if (!duckType(type[keys[i]], (value && value[keys[i]]))) {
        return false;
      }
    }
    return true;
  } else if (typeOf(type) === 'array') {
    if (typeOf(value) === 'array') {
      if (value.length === 0) return true;
      for (var i = 0; i < value.length; ++i) {
        if (!duckType(type[0], (value && value[i]))) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  } else {
    throw new Error("Cannot parse type " + type);
  }
};

var checkTypes = function(args, types) {
  var invalidTypes = [];
  for (var i = 0; i < types.length; ++i) {
    var type = types[i],
        value = args[i];
    if (!duckType(type, value)) {
      invalidTypes.push({i: i, type: type, value: value});
    }
  }
  if (invalidTypes.length > 0) {
    var message = "Invalid types: " + JSON.stringify(invalidTypes);
    var err = new Error(message);
    err.invalidTypes = invalidTypes;
    return err;
  } else {
    return null;
  }
};

var assertTypes = function(args) {
  var types = Array.prototype.slice.call(arguments, 1);
  var err = checkTypes(args, types);
  if (err) throw err;
};

assertTypes.typeOf = typeOf;
assertTypes.duckType = duckType;
assertTypes.checkTypes = checkTypes;

module.exports = assertTypes;
