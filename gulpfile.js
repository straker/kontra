var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter( 'jshint-stylish' ));
});

gulp.task('scripts', function() {
  return gulp.src(['node_modules/assetLoader/assetLoader.js', 'src/core.js', 'src/*.js'])
    .pipe(concat('kontra.js'))
    .pipe(gulp.dest('.'))
    .pipe(rename('kontra.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

gulp.task('default', ['lint', 'scripts', 'watch']);