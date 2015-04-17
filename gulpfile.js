var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');

function swallowError(error) {
  // print error so we know that uglify task didn't complete
  console.log(error.toString());

  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter( 'jshint-stylish' ))
});

gulp.task('scripts', function() {
  return gulp.src(['node_modules/kontra-asset-loader/kontraAssetLoader.js', 'src/core.js', 'src/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('kontra.js'))
      .pipe(size())
      .pipe(gulp.dest('.'))
      .pipe(uglify())
      .on('error', swallowError)  // prevent uglify task from crashing watch on error
      .pipe(rename('kontra.min.js'))
      .pipe(size())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

gulp.task('default', ['lint', 'scripts', 'connect', 'watch']);