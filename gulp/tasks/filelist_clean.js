const gulp = require('gulp');
const del = require('del');

const conf = require('../conf').filelist;

gulp.task('filelist-clean', () => {
  del([`${conf.temp}`]);
});
