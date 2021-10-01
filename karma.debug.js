module.exports = function (config) {
  config.set({
    basePath: '',
    singleRun: false,
    autoWatch: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // setup
      { pattern: 'test/setup.js', type: 'module' },

      // assets
      { pattern: 'test/imgs/*.*', included: false, served: true },
      { pattern: 'test/audio/*.*', included: false, served: true },
      { pattern: 'test/data/*.*', included: false, served: true },

      { pattern: 'src/*.js', type: 'module', included: false },
      { pattern: 'test/unit/*.spec.js', type: 'module' },
      { pattern: 'test/integration/*.spec.js', type: 'module' }
    ],
    browsers: ['Chrome'],
    proxies: {
      '/imgs': '/base/test/imgs',
      '/audio': '/base/test/audio',
      '/data': '/base/test/data'
    },
    reporters: ['mocha'],
    client: {
      mocha: {
        timeout: 4000,
        reporter: 'html'
      }
    }
  });
};
