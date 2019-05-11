const gulp = require('gulp');
const rename = require('gulp-rename');
const size = require('gulp-size');
const terser = require('gulp-terser');
const plumber = require('gulp-plumber');
const preprocess = require('gulp-preprocess');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
require('./doc-tasks.js');

// Enables/Disables visual debugging in Kontra
const VISUAL_DEBUG = false;

// Enables/Disables DEBUG mode in Kontra
const DEBUG = false;

function buildIife() {
  return rollup({
    input: './src/kontra.defaults.js',
    format: 'iife',
    name: 'kontra'
  })
  .pipe(source('kontra.js'))
  .pipe(gulp.dest('.'));
}

function buildModule() {
  return rollup({
      input: './src/kontra.js',
      format: 'es'
    })
    .pipe(source('kontra.mjs'))
    .pipe(gulp.dest('.'));
}

function distIife() {
  return gulp.src('kontra.js')
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG }}))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./docs/assets/js'))
    .pipe(rename('kontra.min.js'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('.'));
}

function distModule() {
  return gulp.src('kontra.mjs')
    .pipe(preprocess({context: { DEBUG: DEBUG, VISUAL_DEBUG: VISUAL_DEBUG }}))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(rename('kontra.min.mjs'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('.'));
}

gulp.task('build', gulp.series(buildIife, buildModule, 'build:docs'));

gulp.task('dist', gulp.series(distIife, distModule));

gulp.task('watch', function() {
  gulp.watch('src/*.js', gulp.series('build', 'dist'));
});

gulp.task('default', gulp.series('build', 'watch'));
