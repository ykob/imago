import Util from './modules/util.js';
import resizeWindow from './modules/resizeWindow.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const light = new THREE.HemisphereLight(0xffffff, 0x333333, 1);

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(5000, 5000, 5000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const geometry = new THREE.PlaneGeometry(100, 100, 2, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  for (var i = 0; i < 500; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(Util.getPolar(
      Util.getRadian(Util.getRandomInt(0, 359)),
      Util.getRadian(Util.getRandomInt(0, 359)),
      3000
    ));
    scene.add(cube);
  }

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
