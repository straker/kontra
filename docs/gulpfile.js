var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('livereload', function() {
  return gulp.src('**/*.{html,css,js}')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('**/*.{html,css,js}', ['livereload']);
});

gulp.task('default', ['connect', 'watch']);