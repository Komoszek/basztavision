// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.fs = require('fs');
window.ini = require('ini');
window.base64 = require('file-base64');
window.child_process = require('child_process');
