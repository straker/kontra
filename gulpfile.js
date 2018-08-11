var gulp = require('gulp');
var concat = require('gulp-concat-util');
var connect = require('gulp-connect');
var rename = require('gulp-rename');
var size = require('gulp-size');
var terser = require('gulp-terser');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var preprocess = require('gulp-preprocess');

var Server = require('karma').Server;
var package = require('./package.json');

// Enables/Disables visual debugging in Kontra
var VISUAL_DEBUG = false;

// Enables/Disables DEBUG mode in Kontra
var DEBUG = false;

gulp.task('scripts', function() {
  return gulp.src(['src/core.js', 'src/*.js'])
    .pipe(concat('kontra.js'))
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('./docs/js'))
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG}}))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(rename('kontra.min.js'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('.'))
    .pipe(connect.reload());
});

gulp.task('dist', function() {
  return gulp.src('src/*.js')
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG}}))
    .pipe(changed('./dist'))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['dist', 'scripts']);
});

gulp.task('test', function(done) {
  new Server({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // assets
      'test/phantom.polyfill.js',
      'src/*.js',
      'test/*.js'
    ],
    browsers: ['Chrome', 'Firefox', 'Safari', 'IE']
  }, done).start();
});

gulp.task('default', ['scripts', 'connect', 'watch']);
