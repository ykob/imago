import Util from './modules/util.js';
import resizeWindow from './modules/resize_window.js';
import ForceCamera from './modules/force_camera.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');
const scene = new THREE.Scene();
const camera = new ForceCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const light = new THREE.HemisphereLight(0xffffff, 0x333333, 1);

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.move.velocity.set(0, 0, 0);
  camera.move.anchor.set(6000, 6000, 6000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const center_point = new THREE.Vector3();
  const geometry = new THREE.PlaneGeometry(100, 100, 2, 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  for (var i = 0; i < 500; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(Util.getPolar(
      Util.getRadian(Util.getRandomInt(30, 150)),
      Util.getRadian(Util.getRandomInt(0, 359)),
      Util.getRandomInt(1500, 3000)
    ));
    cube.lookAt(center_point);
    scene.add(cube);
  }

  scene.add(light);

  renderLoop();
};
const render = () => {
  camera.render();
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
