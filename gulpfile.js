const gulp = require('gulp');
const rename = require('gulp-rename');
const size = require('gulp-size');
const terser = require('gulp-terser');
const plumber = require('gulp-plumber');
const preprocess = require('gulp-preprocess');
const rollup = require('@rollup/stream');
const source = require('vinyl-source-stream');
require('./tasks/docs.js');
require('./tasks/typescript.js');

const context = {
  GAMEOBJECT_GROUP: true,
  GAMEOBJECT_ROTATION: true,
  GAMEOBJECT_VELOCITY: true,
  GAMEOBJECT_ACCELERATION: true,
  GAMEOBJECT_TTL: true,
  GAMEOBJECT_ANCHOR: true,
  GAMEOBJECT_SCALE: true,
  GAMEOBJECT_OPACITY: true,
  SPRITE_IMAGE: true,
  SPRITE_ANIMATION: true,
  TEXT_AUTONEWLINE: true,
  TEXT_NEWLINE: true,
  TEXT_RTL: true,
  TEXT_ALIGN: true,
  TEXT_STROKE: true,
  TILEENGINE_CAMERA: true,
  TILEENGINE_DYNAMIC: true,
  TILEENGINE_QUERY: true,
  TILEENGINE_TILED: true,
  VECTOR_SUBTRACT: true,
  VECTOR_SCALE: true,
  VECTOR_NORMALIZE: true,
  VECTOR_DOT: true,
  VECTOR_LENGTH: true,
  VECTOR_DISTANCE: true,
  VECTOR_ANGLE: true,
  VECTOR_DIRECTION: true,
  VECTOR_CLAMP: true
  // DEBUG and VISUAL_DEBUG are turned off
};

function buildIife() {
  return rollup({
    input: './src/kontra.defaults.js',
    output: {
      format: 'iife',
      name: 'kontra',
      strict: false
    }
  })
    .pipe(source('kontra.js'))
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('./docs/assets/js'));
}

function buildModule() {
  return rollup({
    input: './src/kontra.js',
    output: {
      format: 'es',
      strict: false
    }
  })
    .pipe(source('kontra.mjs'))
    .pipe(gulp.dest('.'));
}

function distIife() {
  return gulp
    .src('kontra.js')
    .pipe(preprocess({ context }))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./docs/assets/js'))
    .pipe(rename('kontra.min.js'))
    .pipe(
      size({
        showFiles: true
      })
    )
    .pipe(
      size({
        showFiles: true,
        gzip: true
      })
    )
    .pipe(gulp.dest('.'));
}

function distModule() {
  return gulp
    .src('kontra.mjs')
    .pipe(preprocess({ context }))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(rename('kontra.min.mjs'))
    .pipe(
      size({
        showFiles: true
      })
    )
    .pipe(
      size({
        showFiles: true,
        gzip: true
      })
    )
    .pipe(gulp.dest('.'));
}

gulp.task('build', gulp.series(buildIife, buildModule, 'build:docs', 'build:ts'));

gulp.task('dist', gulp.series('build', distIife, distModule));

gulp.task('watch', function () {
  gulp.watch('src/*.js', gulp.series('build', 'dist'));
});

gulp.task('default', gulp.series('build', 'watch'));
