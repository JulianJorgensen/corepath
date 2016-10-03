try
{
  var browserSync = require('browser-sync');
  var config      = require('../util/loadConfig').browsersync;
  var gulp        = require('gulp');

  gulp.task('browser-sync', function() {
    browserSync.init({
      notify: config.notify,
      open: config.open,
      host: config.url,
      proxy: config.url,
      startPath: config.startUrl,
      port: config.port,
      xip: config.xip
    });
  });
}
catch (e)
{
  // no browser-sync
}
