const gulp = require('gulp');
const requireDir = require('require-dir');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const DIR = require('./gulp/conf').DIR;

requireDir('./gulp/tasks');

gulp.task('predefault', callback => {
  runSequence(
    ['jade', 'sass', 'watchify'],
    'serve',
    callback
  );
});

gulp.task('default', ['predefault'], () => {
  gulp.watch(
    [`./${DIR.SRC}/**/*.jade`],
    ['jade', reload]
  );
  gulp.watch(
    [`./${DIR.SRC}/**/*.{scss, sass}`],
    ['sass', reload]
  );
  gulp.watch(
    [`./${DIR.DST}/**/*.js`],
    reload
  );
});
