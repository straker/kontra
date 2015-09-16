// Karma configuration
// Generated on Tue Apr 07 2015 23:14:35 GMT-0600 (MDT)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      // assets
      'kontra.js',
      'test/*.js'
    ],
    browsers: ['Chrome', 'Firefox', 'Safari', 'IE']
  });
};
