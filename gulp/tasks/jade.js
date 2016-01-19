const gulp = require('gulp');

const $ = require('../plugins');
const conf = require('../conf').jade;

gulp.task('jade', () => {
  return gulp.src(conf.src)
    .pipe($.plumber({
      errorHandler: $.notify.onError('<%= error.message %>')
    }))
    .pipe($.jade(conf.opts))
    .pipe($.rename(path => {
      path.dirname = path.dirname.replace('html', '.');
    }))
    .pipe(gulp.dest(conf.dst));
});
