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
const exhibits = [];
const exhibit_geometry = new THREE.PlaneGeometry(250, 250, 2, 2);

let current_id = 0;
let time = 0;
let mode = 0;

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

const initExhibit = (array) => {
  let count = 0;
  for (var i = 0; i < array.length; i++) {
    let radius = 0;
    let rad1 = 0;
    let rad2 = 0;

    if (i < 2) {
      radius = 1000;
      rad1 = Util.getRadian(90);
      rad2 = Util.getRadian(i % 2 * 180);
    } else if (i < 57) {
      radius = 1500 + (i - 2) * 20;
      rad1 = Util.getRadian((i - 2) % 4 * 30 + 45);
      rad2 = Util.getRadian((i - 2) / (57 - 2) * 360);
    } else if (i < 115) {
      radius = 2500 + (i - 57) * 20;
      rad1 = Util.getRadian((i - 57) % 8 * 15 + 45);
      rad2 = Util.getRadian((i - 57) / (115 - 57) * 360);
    } else if (i < 139) {
      radius = 3500 + (i - 115) * 20;
      rad1 = Util.getRadian((i - 115) % 8 * 15 + 45);
      rad2 = Util.getRadian((i - 115) / (139 - 115) * 360);
    } else if (i < 221) {
      radius = 4500 + (i - 139) * 20;
      rad1 = Util.getRadian((i - 139) % 8 * 15 + 45);
      rad2 = Util.getRadian((i - 139) / (221 - 139) * 360);
    }

    const img = new Image();
    img.src = array[i];
    img.onload = () => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: THREE.ImageUtils.loadTexture(img.src),
        side: THREE.DoubleSide
      });
      const cube = new THREE.Mesh(exhibit_geometry, material);

      cube.position.copy(Util.getPolar(rad1, rad2, radius));
      cube.lookAt(center_point);
      scene.add(cube);
      count++;
    };
    if (array.length == count) {
      mode = 1;
    }
  }
};
const moveCameraAuto = (radius) => {
  return Util.getPolar(
    Math.PI / 180 * (Math.sin(Math.PI / 180 * time / 40) + 1) * 45 + 45,
    Math.PI / 180 * (time / 20),
    radius
  )
};

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.move.velocity.copy(moveCameraAuto(8000));
  camera.move.anchor.copy(moveCameraAuto(9000));

  loadImage().then((array) => {
    initExhibit(array);
  });

  scene.add(light);

  renderLoop();
};
const render = () => {
  time++;
  camera.move.anchor.copy(moveCameraAuto(9000 + Math.sin(time / 500) * 4500));
  camera.render();
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
