var browserSync   = false;
try
{
  browserSync = require('browser-sync');
}
catch (e)
{
}
var config        = require('../util/loadConfig').jekyll;
var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var spawn         = require('cross-spawn');

gulp.task('jekyll-build', function(done) {
  // Spawn jekyll commands
  if (isProduction) {
    console.log('deploy environment: ' + process.env['DEPLOYBOT_ENVIRONMENT']);
    return spawn('bundle', ['exec', 'jekyll', 'build', '--config', '_config.yml,_config-' + process.env['DEPLOYBOT_ENVIRONMENT'] + '.yml'], {stdio: 'inherit'})
    .on('close', done);
  } else {
    if (browserSync)
    {
      browserSync.notify(config.notification);
    }
    return spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
    .on('close', done);
  }
});

gulp.task('jekyll-incremental', function(done) {
  if (browserSync)
  {
    browserSync.notify(config.notificationIncremental);
  }
  // Spawn jekyll commands
  return spawn('bundle', ['exec', 'jekyll', 'build', '--incremental', '--safe'], {stdio: 'inherit'})
  .on('close', done);
});
