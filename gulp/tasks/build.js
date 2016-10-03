var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var sequence      = require('run-sequence');

gulp.task('build', function(done) {
  if(isProduction) {
    sequence('clean', 'jekyll-build', ['sass', 'javascript'], done);
  } else {
    sequence('clean', 'jekyll-build', ['sass', 'javascript'], done);
  }
});
