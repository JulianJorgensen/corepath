var gulp          = require('gulp');
var config        = require('../util/loadConfig').images;
var imagemin      = require('gulp-imagemin');
var pngquant      = require('imagemin-pngquant');

/** Minify images */
gulp.task('minify-images', function() {
  return gulp.src(config.src)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(config.dest));
});
