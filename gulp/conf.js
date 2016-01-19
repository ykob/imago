// 設定ファイル
// 対象パスやオプションを指定

const DIR = module.exports.DIR = {
  PATH: '',
  SRC: 'src',
  DST: 'dst'
};

module.exports.serve = {
  notify: false,
  startPath: `${DIR.PATH}`,
  ghostMode: false,
  server: {
    baseDir: DIR.DST,
    index: 'index.html',
    routes: {
      [DIR.PATH]: `${DIR.DST}${DIR.PATH}/`
    }
  }
};

module.exports.jade = {
  src: [
    `${DIR.SRC}/**/*.jade`,
    `!${DIR.SRC}/**/_**/*.jade`,
    `!${DIR.SRC}/**/_*.jade`
  ],
  dst: `${DIR.DST}${DIR.PATH}`,
  opts: {
    pretty: true
  }
};

module.exports.sass = {
  src: [`${DIR.SRC}/css/main.scss`],
  dst: `${DIR.DST}/css/`
};

module.exports.scripts = {
  entryFiles: [
    `./${DIR.SRC}/js/main.js`,
  ],
  browserifyOpts: {
    transform: [
      ['babelify', {
        babelrc: false,
        presets: ['es2015']
      }],
      'glslify'
    ]
  },
  dest: `${DIR.DST}${DIR.PATH}/js`
};
