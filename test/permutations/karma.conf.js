const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: '',
    singleRun: true,
    autoWatch: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      {pattern: path.join(__dirname, '../../src/*.js'), type: 'module', included: false },
      {pattern: path.join(__dirname, 'gameObject.js'), type: 'module', included: false },
      {pattern: path.join(__dirname, 'gameObject.spec.js'), type: 'module' },
    ],
    proxies: {
      '/src': path.join('/absolute', __dirname, '../../src')
    },
    browsers: ['ChromeHeadless'],
    reporters: ['mocha']
  });
};
