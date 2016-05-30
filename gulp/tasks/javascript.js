var $             = require('gulp-load-plugins')();
var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').javascript;
var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var gulpif        = require('gulp-if');
var coffee        = require('gulp-coffee');
var sequence      = require('run-sequence');
var uglify        = require('gulp-uglify');

// PRE JS IS LOADED FIRST (IN THE <HEAD>)
gulp.task('preJS', function(){
  return gulp.src(config.srcPreload)
    .pipe(gulpif(/[.]coffee$/, coffee()))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat(config.filenamePreload))
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest(config.dest))
    .pipe(gulp.dest(config.siteDest));
});

// MAIN JS IS LOADED IN THE BOTTOM OF <BODY>
gulp.task('mainJS', function(){
  return gulp.src(config.src)
    .pipe(gulpif(/[.]coffee$/, coffee()))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat(config.filename))
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest(config.dest))
    .pipe(gulp.dest(config.siteDest));
});

// COMPILE BOTH PRELOADED JS AND THE MAIN JS
gulp.task('javascript', function(done) {
  browserSync.notify(config.notification);

  sequence('preJS', 'mainJS', done);
});
