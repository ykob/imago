const gulp = require('gulp');

const $ = require('../plugins');
const conf = require('../conf').filelist;

gulp.task('filelist-replace', () => {
  return gulp.src(`${conf.temp}/filelist.json`)
  .pipe($.replace('dst', '.'))
  .pipe(gulp.dest(`${conf.dest}/`))
});
