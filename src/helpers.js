const { parse, stringify } = require('flatted/cjs');

function isNullOrEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  if (obj === null) {
    return true;
  }
  // Check for an empty array too
  // eslint-disable-next-line no-prototype-builtins
  if (obj.hasOwnProperty('length')) {
    if (obj.length === 0) {
      return true;
    }
  }
  return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

// uses flatted library to allow stringifing on an object with circular references
// NOTE: This does not produce output similar to JSON.stringify, it has it's own format
// to allow you to stringify and parse and get back an object with circular references
function stringifySafe(obj) {
  return stringify(obj);
}

// this is the inverse of stringifySafe
// if converts a specially stringifyied string (created by stringifySafe) back into an object
function parseSafe(string) {
  return parse(string);
}

module.exports = {
  isNullOrEmpty,
  parseSafe,
  stringifySafe
};
