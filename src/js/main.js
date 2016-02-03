import Util from './modules/util.js';
import resizeWindow from './modules/resize_window.js';
import ForceCamera from './modules/force_camera.js';
import ForceLight from './modules/force_light.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');
const scene = new THREE.Scene();
const camera = new ForceCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const hemisphere_light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
const center_light = new THREE.PointLight(0xffffff, 0.4, 6000);
const move_light = new ForceLight(0xffffff, 0.4, 3000);
const center_point = new THREE.Vector3();
const exhibits = [];
const exhibit_geometry = new THREE.PlaneGeometry(120, 120, 2, 2);

let current_id = -1;
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
      radius = 300;
      rad1 = Util.getRadian(90);
      rad2 = Util.getRadian(i % 2 * 180);
    } else if (i < 57) {
      radius = 600 + (i - 2) * 40;
      rad1 = Util.getRadian((i - 2) % 4 * 20 + 50);
      rad2 = Util.getRadian((i - 2) / (57 - 2) * 360);
    } else if (i < 115) {
      radius = 600 + (57 - 2) * 40 + 300 + (i - 57) * 30;
      rad1 = Util.getRadian((i - 57) % 5 * 20 + 40);
      rad2 = Util.getRadian((i - 57) / (115 - 57) * 360);
    } else if (i < 139) {
      radius = 600 + (115 - 57) * 30 + 300 * 2 + (i - 115) * 20;
      rad1 = Util.getRadian((i - 115) % 6 * 20 + 30);
      rad2 = Util.getRadian((i - 115) / (139 - 115) * 360);
    } else if (i < 221) {
      radius = 600 + (139 - 115) * 20 + 300 * 3 + (i - 139) * 20;
      rad1 = Util.getRadian((i - 139) % 7 * 20 + 20);
      rad2 = Util.getRadian((i - 139) / (221 - 139) * 360);
    }

    const loader = new THREE.TextureLoader();
    const index = i;
    loader.load(
      array[index],
      (texture) => {
        const material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: texture,
          side: THREE.DoubleSide
        });
        const exhibit = new THREE.Mesh(exhibit_geometry, material);

        exhibit.position.copy(Util.getPolar(rad1, rad2, radius));
        exhibit.lookAt(center_point);
        exhibits[index] = exhibit;
        scene.add(exhibit);
        count++;
        if (array.length == count) {
          setTimeout(() => {
            mode = 1;
          }, 1000);
        }
      }
    )
  }
};
const moveCameraAuto = (radius) => {
  return Util.getPolar(
    Math.PI / 180 * (Math.sin(Math.PI / 180 * time / 40) + 1) * 45 + 45,
    Math.PI / 180 * (time / 20),
    radius
  )
};
const moveExhibit = (i) => {
  camera.move.anchor.copy(
    exhibits[i].position.clone().normalize().multiplyScalar(exhibits[i].position.length() - 200)
  );
  camera.look.anchor.copy(exhibits[i].position);
};
const moveNextExhibit = () => {
  if (mode !== 2) mode = 2;
  current_id++;
  moveExhibit(current_id);
};
const movePrevExhibit = () => {
  if (mode !== 2) mode = 2;
  current_id--;
  moveExhibit(current_id);
};
const setEvent = () => {
  document.addEventListener('keydown', (event) => {
    switch (event.keyIdentifier) {
      case 'Left':
        movePrevExhibit();
        break;
      case 'Right':
        moveNextExhibit();
        break;
      default:
        break;
    }
  });
};

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.move.velocity.copy(moveCameraAuto(3000));
  camera.move.anchor.copy(moveCameraAuto(4000));
  camera.render();
  move_light.move.velocity.copy(camera.move.position);
  move_light.render();

  loadImage().then((array) => {
    initExhibit(array);
  });

  scene.add(hemisphere_light);
  scene.add(center_light);
  scene.add(move_light);

  renderLoop();
  setEvent();
};
const render = () => {
  if (mode == 1) {
    time++;
    camera.move.anchor.copy(moveCameraAuto(4000 + Math.sin(time / 500) * 2000));
  }
  camera.render();
  move_light.move.anchor.copy(camera.move.position);
  move_light.render();
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
