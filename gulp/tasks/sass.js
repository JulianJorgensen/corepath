var $             = require('gulp-load-plugins')();
var autoprefixer  = require('gulp-autoprefixer');
var browserSync   = false;
try
{
  browserSync = require('browser-sync');
}
catch (e)
{
}
var config        = require('../util/loadConfig').sass;
var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var sass          = require('gulp-sass');
var uglifycss     = require('gulp-uglifycss');

gulp.task('sass', function() {
  if (browserSync)
  {
    browserSync.notify(config.notification);
  }

  var pipe = gulp.src(config.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass()
      .on('error', $.sass.logError))
    .pipe(autoprefixer(config.compatibility))
    .pipe($.if(isProduction, uglifycss()))
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(config.dest))
    .pipe(gulp.dest(config.siteDest));

  if (browserSync)
  {
    // auto-inject styles into browsers
    pipe = pipe.pipe(browserSync.stream());
  }

  return pipe;
});
