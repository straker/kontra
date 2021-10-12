// Karma configuration
// Generated on Tue Apr 07 2015 23:14:35 GMT-0600 (MDT)
const DEBUG = process.argv.find(argv => argv === '--debug');

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
    preprocessors: DEBUG
      ? {}
      : {
          'src/*.js': ['karma-coverage-istanbul-instrumenter']
        },
    browsers: [DEBUG ? 'Chrome' : 'ChromeHeadless'],
    proxies: {
      '/imgs': '/base/test/imgs',
      '/audio': '/base/test/audio',
      '/data': '/base/test/data'
    },
    coverageIstanbulInstrumenter: {
      esModules: true
    },
    reporters: DEBUG ? ['mocha'] : ['mocha', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: 'coverage/'
    },
    client: {
      mocha: {
        timeout: 4000,
        reporter: 'html'
      }
    }
  });
};
