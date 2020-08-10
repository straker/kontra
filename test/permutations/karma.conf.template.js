const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: '',
    singleRun: true,
    autoWatch: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      {pattern: path.join(__dirname, '__option__.spec.js'), type: 'module' },
    ],
    proxies: {
      '/src': path.join('/absolute', __dirname, '../../src')
    },
    browsers: ['ChromeHeadless'],
    reporters: ['mocha']
  });
};
