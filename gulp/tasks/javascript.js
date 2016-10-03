var $             = require('gulp-load-plugins')();
var browserSync = false;
try
{
  browserSync   = require('browser-sync');
}
catch (e)
{
}
var config        = require('../util/loadConfig').javascript;
var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var gulpif        = require('gulp-if');
var coffee        = require('gulp-coffee');
var sequence      = require('run-sequence');
var uglify        = require('gulp-uglify');

// MAIN JS IS LOADED IN THE BOTTOM OF <BODY>
gulp.task('mainJS', function(){
  return gulp.src(config.src)
    .pipe(gulpif(/[.]coffee$/, coffee()))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat(config.filename))
    .pipe($.if(isProduction, uglify({ mangle: false })))
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(config.dest))
    .pipe(gulp.dest(config.siteDest));
});

// INDEPENDENT JS
gulp.task('independentJS', function(){
  return gulp.src(config.independentJS)
    .pipe(gulpif(/[.]coffee$/, coffee()))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.if(isProduction, uglify({ mangle: false })))
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(config.dest))
    .pipe(gulp.dest(config.siteDest));
});

// COMPILE THE JS
gulp.task('javascript', function(done) {
  if (browserSync)
  {
    browserSync.notify(config.notification);
  }

  sequence('independentJS', 'mainJS', done);
});
