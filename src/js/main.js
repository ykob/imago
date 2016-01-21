import Util from './modules/util.js';
import resizeWindow from './modules/resizeWindow.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const light = new THREE.HemisphereLight(0xffffff, 0x333333, 1);

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  //resizeWindow(canvas);

  camera.position.set(100, 100, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  scene.add(light);

  renderLoop();
};
const render = () => {
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
