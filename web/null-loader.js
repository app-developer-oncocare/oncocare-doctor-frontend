// null-loader.js
// A webpack loader shim that returns an empty module.
// Used to satisfy @react-navigation/elements' internal require('url-loader!...') calls
// which are not needed on the web platform.
module.exports = function nullLoader(source) {
  return 'module.exports = "";';
};
