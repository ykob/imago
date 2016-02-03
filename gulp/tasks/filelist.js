const gulp = require('gulp');

const $ = require('../plugins');
const conf = require('../conf').filelist;

gulp.task('filelist', () => {
  return gulp.src(conf.src)
  .pipe($.filelist('filelist.json', { absolute: false }))
  .pipe(gulp.dest(conf.temp))
});
