// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.fs = require('fs');
window.ini = require('ini');
window.grabber = require('./build/Release/grabber');
