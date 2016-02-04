import Util from './modules/util.js';
import resizeWindow from './modules/resize_window.js';
import ForceCamera from './modules/force_camera.js';
import ForceLight from './modules/force_light.js';
import Pager from './modules/pager.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');
const scene = new THREE.Scene();
const camera = new ForceCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const hemisphere_light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
const center_light = new THREE.PointLight(0xffffff, 0.4, 3000);
const move_light = new ForceLight(0xffffff, 0.6, 500);
const center_point = new THREE.Vector3();
const exhibits = [];
const exhibit_geometry = new THREE.PlaneGeometry(120, 120, 2, 2);
const pager = new Pager();

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
      radius = 800;
      rad1 = Util.getRadian(((i - 2) % 4) * 30 + 45);
      rad2 = Util.getRadian((i - 2) / (57 - 2 + 1) * 360);
    } else if (i < 115) {
      radius = 1300;
      rad1 = Util.getRadian(((i - 57) % 6) * 20 + 45);
      rad2 = Util.getRadian((i - 57) / (115 - 57 + 1) * 360);
    } else if (i < 139) {
      radius = 1800;
      rad1 = Util.getRadian(((i - 115) % 8) * 15 + 45);
      rad2 = Util.getRadian((i - 115) / (139 - 115 + 1) * 360);
    } else if (i < 221) {
      radius = 2300;
      rad1 = Util.getRadian(((i - 139) % 12) * 10 + 45);
      rad2 = Util.getRadian((i - 139) / (221 - 139 + 1) * 360);
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
        count++;
        if (array.length == count) {
          mode = 1;
          setTimeout(() => {
            for (var i = 0; i < exhibits.length; i++) {
              scene.add(exhibits[i]);
            }
            pager.setAllNum(exhibits.length);
          }, 2000);
          setTimeout(() => {
            removeIntro();
          }, 2500);
        }
      }
    )
  }
};
const intro = () => {
  $('.c-introduction__text').each(function(index, el) {
    const $this = $(this);
    setTimeout(function() {
      $this.addClass('is-viewed');
    }, 200 * index);
  });
};
const removeIntro = () => {
  $('.c-introduction__bg').addClass('is-transparent');
  $('.c-introduction__text').each(function(index, el) {
    const $this = $(this);
    setTimeout(function() {
      $this.addClass('is-hidden');
    }, 200 * index);
  });
};
const moveCameraAuto = (radius) => {
  return Util.getPolar(
    Math.PI / 180 * (Math.sin(Math.PI / 180 * time / 40) + 1) * 45 + 45,
    Math.PI / 180 * (time / 20),
    radius
  );
};
const moveExhibit = (i) => {
  camera.move.anchor.copy(
    exhibits[i].position.clone().normalize().multiplyScalar(exhibits[i].position.length() - 200)
  );
  camera.look.anchor.copy(exhibits[i].position);
  pager.setCurrentNum(i + 1);
};
const moveNextExhibit = () => {
  if (mode !== 2) mode = 2;
  current_id++;
  if (current_id < exhibits.length) {
    moveExhibit(current_id);
  } else {
    backToPanorama();
  }
};
const movePrevExhibit = () => {
  if (mode !== 2) mode = 2;
  current_id--;
  if (current_id > -1) {
    moveExhibit(current_id);
  } else if(current_id <= -2) {
    current_id = exhibits.length - 1;
    moveExhibit(current_id);
  } else {
    backToPanorama();
  }
};
const backToPanorama = () => {
  current_id = -1;
  mode = 1;
  pager.setCurrentNum(0);
  camera.look.anchor.set(0, 0, 0);
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

  intro();
  renderLoop();
  setEvent();
};
const render = () => {
  if (mode == 1) {
    time++;
    camera.move.anchor.copy(moveCameraAuto(4000 - Math.sin(time / 500) * 2000));
  }
  if (mode >= 1) {
    camera.render();
    move_light.move.anchor.copy(camera.move.position);
    move_light.render();
  }
  renderer.render(scene, camera);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
