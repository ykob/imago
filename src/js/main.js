import Util from './modules/util.js';
import debounce from './modules/debounce.js';
import ForceCamera from './modules/force_camera.js';
import ForceLight from './modules/force_light.js';
import Introduction from './modules/introduction.js';
import Information from './modules/information.js';
import Pager from './modules/pager.js';
import Popup from './modules/popup.js';
import Force3 from './modules/force3.js';
import Bloom from './modules/bloom/bloom.js';

const glslify = require('glslify');
const canvas = document.getElementById('webgl-contents');
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
const render_base = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const scene_base = new THREE.Scene();
const camera_base = new ForceCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
const hemisphere_light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
const center_light = new THREE.PointLight(0xffffff, 0.4, 3000);
const move_light = new ForceLight(0xffffff, 0.6, 500);
const center_point = new THREE.Vector3();
const exhibits = [];
const exhibit_geometry = new THREE.PlaneGeometry(120, 120, 2, 2);
const introduction = new Introduction();
const information = new Information();
const pager = new Pager();
const bloom = new Bloom(render_base.texture);
const bloom_force = new Force3();

let sphere = null;
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
  const $counter_current = $('.c-introduction__counter-num--current');
  const $counter_all = $('.c-introduction__counter-num--all');
  let count = 0;

  $counter_all.text(array.length);
  for (var i = 0; i < array.length; i++) {
    let radius = 0;
    let rad1 = 0;
    let rad2 = 0;

    if (i < 2) {
      radius = 300;
      rad1 = Util.getRadian(90);
      rad2 = Util.getRadian(i % 2 * 180);
    } else if (i < 56) {
      radius = 800;
      rad1 = Util.getRadian(((i - 2) % 4) * 30 + 45);
      rad2 = Util.getRadian((i - 2) / (56 - 2 + 1) * 360);
    } else if (i < 114) {
      radius = 1300;
      rad1 = Util.getRadian(((i - 56) % 5) * 25 + 40);
      rad2 = Util.getRadian((i - 56) / (114 - 56 + 1) * 360);
    } else if (i < 138) {
      radius = 1800;
      rad1 = Util.getRadian(((i - 114) % 6) * 20 + 40);
      rad2 = Util.getRadian((i - 114) / (138 - 114 + 1) * 360);
    } else if (i < 217) {
      radius = 2300;
      rad1 = Util.getRadian(((i - 138) % 7) * 20 + 30);
      rad2 = Util.getRadian((i - 138) / (217 - 138 + 1) * 360);
    } else {
      radius = 2800;
      rad1 = Util.getRadian(((i - 217) % 8) * 20 + 20);
      rad2 = Util.getRadian((i - 217) / (295 - 217 + 1) * 360);
    }

    const loader = new THREE.TextureLoader();
    const index = i;
    setTimeout(() => {
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
          $counter_current.text(count);
          if (array.length == count) {
            mode = 1;
            for (var i = 0; i < exhibits.length; i++) {
              scene_base.add(exhibits[i]);
            }
            pager.setAllNum(exhibits.length);
            setTimeout(() => {
              introduction.finish();
            }, 1500);
          }
        }
      )
    }, 3000);
  }
};
const createSphere = () => {
  const geometry = new THREE.SphereGeometry(40, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
};
const moveCameraAuto = (radius) => {
  return Util.getPolar(
    Math.PI / 180 * (Math.sin(Math.PI / 180 * time / 40) + 1) * 45 + 45,
    Math.PI / 180 * (time / 20),
    radius
  );
};
const moveExhibit = (i) => {
  camera_base.move.anchor.copy(
    exhibits[i].position.clone().normalize().multiplyScalar(exhibits[i].position.length() - 200)
  );
  camera_base.look.anchor.copy(exhibits[i].position);
  pager.setCurrentNum(i + 1);
  bloom_force.anchor.set(0, 0, 0);
};
const moveNextExhibit = () => {
  if (information.is_viewed) return;
  current_id++;
  if (mode !== 2) {
    mode = 2;
    pager.visible();
  }
  if (current_id < exhibits.length) {
    moveExhibit(current_id);
  } else {
    backToPanorama();
  }
};
const movePrevExhibit = () => {
  if (information.is_viewed) return;
  current_id--;
  if (mode !== 2) {
    mode = 2;
    pager.visible();
  }
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
  if (information.is_viewed) return;
  current_id = -1;
  mode = 1;
  pager.hide();
  camera_base.look.anchor.set(0, 0, 0);
  bloom_force.anchor.set(1.5, 0, 0);
};
const resizeRenderer = function() {
  const body_width  = document.body.clientWidth;
  const body_height = document.body.clientHeight;
  renderer.setSize(body_width, body_height);
  camera_base.aspect = body_width / body_height;
  camera_base.updateProjectionMatrix();
};
const setEvent = () => {
  document.addEventListener('keydown', (event) => {
    if (mode < 1) return;
    switch (event.code) {
      case 'ArrowLeft':
        movePrevExhibit();
        break;
      case 'ArrowRight':
        moveNextExhibit();
        break;
      case 'KeyK':
        movePrevExhibit();
        break;
      case 'KeyJ':
        moveNextExhibit();
        break;
      case 'KeyI':
        information.toggle();
        break;
      case 'Escape':
        if (information.is_viewed) {
          information.toggle();
        } else {
          backToPanorama();
        }
        break;
      default:
        break;
    }
  });
  $('.c-information-btn').on('click', () => {
    information.toggle();
  });
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};
const setPopup = () => {
  const popups = [];
  $('.popup').each(function(i) {
    popups[i] = new Popup($(this));
  });
  popups[0].init('share facebook');
  popups[1].init('share twitter');
};
const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera_base.move.velocity.copy(moveCameraAuto(3000));
  camera_base.move.anchor.copy(moveCameraAuto(4000));
  camera_base.render();
  move_light.move.velocity.copy(camera_base.move.position);
  move_light.render();

  loadImage().then((array) => {
    initExhibit(array);
  });
  sphere = createSphere();

  scene_base.add(hemisphere_light);
  scene_base.add(center_light);
  scene_base.add(move_light);
  scene_base.add(sphere);
  bloom_force.anchor.set(1.5, 0, 0);

  introduction.start();
  renderLoop();
  setEvent();
  setPopup();
};
const render = () => {
  if (mode == 1) {
    time++;
    camera_base.move.anchor.copy(moveCameraAuto(4000 - Math.sin(time / 500) * 2000));
  }
  if (mode >= 1) {
    camera_base.render();
    move_light.move.anchor.copy(camera_base.move.position);
    move_light.render();
  }
  bloom_force.applyHook(0, 0.02);
  bloom_force.applyDrag(0.3);
  bloom_force.updateVelocity();
  bloom_force.updatePosition();
  bloom.plane.bloom.uniforms.strength.value = bloom_force.velocity.length();
  renderer.render(scene_base, camera_base, render_base);
  bloom.render(renderer);
};
const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};
init();
