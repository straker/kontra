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
      { pattern: 'test/imgs/**/*.*', included: false, served: true },
      { pattern: 'test/audio/**/*.*', included: false, served: true },
      { pattern: 'test/data/**/*.*', included: false, served: true },

      { pattern: 'src/*.js', type: 'module', included: false },
      { pattern: 'test/utils.js', type: 'module', included: false },
      { pattern: 'test/unit/*.spec.js', type: 'module' },
      { pattern: 'test/integration/*.spec.js', type: 'module' }
    ],
    browsers: [DEBUG ? 'Chrome' : 'ChromeHeadless'],
    proxies: {
      '/imgs': '/base/test/imgs',
      '/audio': '/base/test/audio',
      '/data': '/base/test/data'
    },
    reporters: ['mocha', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      check: {
        emitWarning: false,
        global: {
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95
        }
      },
      type: 'html',
      dir : 'coverage/'
    },
    client: {
      mocha: {
        timeout: 4000,
        reporter: 'html'
      }
    }
  });
};
