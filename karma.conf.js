// Karma configuration
// Generated on Tue Apr 07 2015 23:14:35 GMT-0600 (MDT)

module.exports = function(config) {
  config.set({
    basePath: '',
    singleRun: false,
    autoWatch: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // assets
      {pattern: 'test/audio/*.*', included: false, served: true },
      {pattern: 'test/css/*.*', included: false, served: true },
      {pattern: 'test/imgs/*.*', included: false, served: true },
      {pattern: 'test/js/*.*', included: false, served: true },
      {pattern: 'test/json/*.*', included: false, served: true },

      'src/core.js',
      'src/*.js',
      'test/*.js',
    ],
    browsers: ['Chrome'],
    // reporters: ['progress', 'coverage'],
    // preprocessors: {
    //   'src/*.js': ['coverage']
    // },
    // coverageReporter: {
    //   dir : 'coverage/',
    //   reporters: [
    //     {type: 'lcov', subdir: '.'},
    //     {type: 'text-summary'}
    //   ]
    // }
  });
};
