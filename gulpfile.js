const gulp = require('gulp');
const rename = require('gulp-rename');
const size = require('gulp-size');
const terser = require('gulp-terser');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const preprocess = require('gulp-preprocess');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
// const gap = require('gulp-append-prepend');
// const replace = require('gulp-replace');
// const concat = require('gulp-concat');
// const path = require('path');

// Enables/Disables visual debugging in Kontra
const VISUAL_DEBUG = false;

// Enables/Disables DEBUG mode in Kontra
const DEBUG = false;

gulp.task('build', function() {
  return rollup({
    input: './src/kontra.defaults.js',
    format: 'iife',
    name: 'kontra'
  })
  .pipe(source('kontra.js'))
  .pipe(gulp.dest('.'))
});

// gulp.task('build:src', function() {
//   const externalId = path.resolve( __dirname, 'src/core.js' );

//   // first concat sprite and vector, and animation and spritesheet together
//   return rollup({
//     input: './src/sprite.js',
//     format: 'iife',
//     name: 'kontra.sprite',
//     external: [externalId],
//     globals: {
//       [externalId]: 'kontra'
//     }
//   })
//   .pipe(source('sprite.js'))
//   .pipe(gulp.dest('./build'))
// });

gulp.task('dist', function() {
  return gulp.src('kontra.js')
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG }}))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./docs/js'))
    .pipe(rename('kontra.min.js'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('.'))
});

// gulp.task('dist:src', function() {
//   return gulp.src(['src/*.js', '!src/index.js'])
//     .pipe(changed('./dist'))
//     .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG }}))
//     .pipe(replace('export default', function() {
//       return `kontra.${this.file.stem} = `;
//     }))
//     .pipe(gap.prependText('(function() {\n'))
//     .pipe(gap.appendText('})();'))
//     .pipe(plumber())
//     .pipe(terser())
//     .pipe(plumber.stop())
//     .pipe(size({
//       showFiles: true
//     }))
//     .pipe(size({
//       showFiles: true,
//       gzip: true
//     }))
//     .pipe(gulp.dest('./dist'));
// });

gulp.task('watch', function() {
  gulp.watch('src/*.js', gulp.series('build', 'dist'));
});

gulp.task('default', gulp.series('build', 'watch'));
