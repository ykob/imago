import Util from './modules/util.js';
import resizeWindow from './modules/resizeWindow.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');

const init = () => {
  resizeWindow(canvas);

};
init();
