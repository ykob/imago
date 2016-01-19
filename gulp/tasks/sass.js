const gulp = require('gulp');

const $ = require('../plugins');
const conf = require('../conf').sass;

gulp.task('sass', () => {
  return $.rubySass(conf.src, {
    style: 'compressed'
  })
  .on('error', $.rubySass.logError)
  .pipe(gulp.dest(conf.dst));
});
