var $             = require('gulp-load-plugins')();
var autoprefixer  = require('gulp-autoprefixer');
var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').sass;
var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var sass          = require('gulp-sass');
var uglifycss     = require('gulp-uglifycss');

gulp.task('sass', function() {
  browserSync.notify(config.notification);

  return gulp.src(config.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass()
      .on('error', $.sass.logError))
    .pipe(autoprefixer(config.compatibility))
    .pipe($.if(isProduction, uglifycss()))
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(config.dest))
    .pipe(gulp.dest(config.siteDest))
    //auto-inject styles into browsers
    .pipe(browserSync.stream());
});
