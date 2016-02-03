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
const center_point = new THREE.Vector3();

let time = 0;

const loadImage = () => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const array = JSON.parse(xhr.responseText);
          resolve(array);
      }
    };
    xhr.open('GET', 'json/filelist.json', true);
    xhr.send();
  });
};

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.move.velocity.copy(Util.getPolar(Math.PI / 180 * 45, Math.PI / 180 , 8000));
  camera.move.anchor.copy(Util.getPolar(Math.PI / 180 * 45, Math.PI / 180, 9000));

  loadImage().then((array) => {
    console.log(array);
  });

  const geometry = new THREE.PlaneGeometry(100, 100, 2, 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });
  for (var i = 0; i < 500; i++) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(Util.getPolar(
      Util.getRadian(Util.getRandomInt(45, 135)),
      Util.getRadian(Util.getRandomInt(0, 359)),
      Util.getRandomInt(1500, 4000)
    ));
    cube.lookAt(center_point);
    scene.add(cube);
  }

  scene.add(light);

  renderLoop();
};
const render = () => {
  time++;
  camera.move.anchor.copy(Util.getPolar(Math.PI / 180 * (time / 40 + 45), Math.PI / 180 * (time / 20), 9000));
  camera.render();
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
