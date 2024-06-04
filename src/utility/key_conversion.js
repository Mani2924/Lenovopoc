/* eslint-disable no-unsafe-optional-chaining */
const KeyConversion = {};

KeyConversion.convertCamelCase = (postData) => {
  const extractedKey = postData
    ?.replace(/[^a-zA-Z0-9\s]/g, '')
    ?.toLowerCase()
    ?.split(' ');
  const resultKey = extractedKey?.map((val, index) => {
    if (index === 0) {
      return val;
    }
    return val?.charAt(0)?.toUpperCase() + val?.slice(1);
  });
  return resultKey?.join('');
};

KeyConversion.capitalizeFirstLetter = (data) => {
  return data.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
};

KeyConversion.convertHypen = (str) => {
  return str
    .toLowerCase() // Convert the string to lowercase
    .trim() // Remove whitespace from both sides of the string
    .replace(/[^\w\s-]/g, '') // Remove all non-word characters (punctuation, spaces, etc.)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

module.exports = KeyConversion;
