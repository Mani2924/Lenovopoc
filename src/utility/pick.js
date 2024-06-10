const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // obj[key] = object[key];
      return { ...obj, [key]: object[key] };
    }
    return obj;
  }, {});
};

module.exports = pick;

module.exports = pick;
