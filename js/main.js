(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Util = require('./util');
var util = new Util();

var exports = function(){
  var Camera = function() {
    this.width = 0;
    this.height = 0;
    this.rad1 = 0;
    this.rad2 = 0;
    this.r = 1200;
    this.obj;
  };
  
  Camera.prototype.init = function(rad1, rad2, width, height) {
    this.width = width;
    this.height = height;
    this.rad1 = rad1;
    this.rad2 = rad2;
    this.obj = new THREE.PerspectiveCamera(35, this.width / this.height, 1, 10000);
    this.setPosition(this.rad1, this.rad2, this.r);
  };
  
  Camera.prototype.setPosition = function(rad1, rad2) {
    var points = util.getPointSphere(rad1, rad2, this.r);
    this.obj.position.set(points[0], points[1], points[2]);
    this.obj.up.set(0, 1, 0);
    this.obj.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
  };

  return Camera;
};

module.exports = exports();

},{"./util":7}],2:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],3:[function(require,module,exports){
var Util = require('./util');
var util = new Util();

var exports = function(){
  var HemiLight = function() {
    this.rad1 = 0;
    this.rad2 = 0;
    this.r = 0;
    this.obj;
  };
  
  HemiLight.prototype.init = function(scene, rad1, rad2, r, hex1, hex2, intensity) {
    this.r = r;
    this.obj = new THREE.HemisphereLight(hex1, hex2, intensity);
    this.setPosition(rad1, rad2);
    scene.add(this.obj);
  };
  
  HemiLight.prototype.setPosition = function(rad1, rad2) {
    var points = util.getPointSphere(rad1, rad2, this.r);
    this.obj.position.set(points[0], points[1], points[2]);
  };
  
  return HemiLight;
};

module.exports = exports();

},{"./util":7}],4:[function(require,module,exports){
var Util = require('./util');
var util = new Util();
var debounce = require('./debounce');
var Camera = require('./camera');
var PointLight = require('./pointLight');
var HemiLight = require('./hemiLight');
var Mesh = require('./mesh');

var body_width = document.body.clientWidth;
var body_height = document.body.clientHeight;
var fps = 60;
var last_time_render = Date.now();
var raycaster = new THREE.Raycaster();
var mouse_vector = new THREE.Vector2(-2, -2);
var intersects;

var canvas;
var renderer;
var scene;
var camera;
var light;
var images;

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(body_width, body_height);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0xeeeeee, 1.0);
  
  scene = new THREE.Scene();
};

var init = function() {
  initThree();
  
  camera = new Camera();
  camera.init(util.getRadian(20), util.getRadian(0), body_width, body_height);
  
  light = new HemiLight();
  light.init(scene, util.getRadian(30), util.getRadian(60), 1000, 0xeeeeff, 0x777700, 1);
  
  loadImages();
  
  renderloop();
  setEvent();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var loadImages = function() {
  var xmlhttp = new XMLHttpRequest();
  var url = 'images.json';
  
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      images = JSON.parse(xmlhttp.responseText);
    }
  }
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
};

var setEvent = function () {
  var mouse_down = new THREE.Vector2();
  var mouse_move = new THREE.Vector2();

  var eventTouchStart = function(x, y) {
    mouse_down.set(x, y);
    mouse_vector.x = (x / window.innerWidth) * 2 - 1;
    mouse_vector.y = - (y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse_vector, camera.obj);
    intersects = raycaster.intersectObjects(scene.children);
  };
  
  var eventTouchMove = function(x, y) {
    mouse_move.set(x, y);
    mouse_vector.x = (x / window.innerWidth) * 2 - 1;
    mouse_vector.y = - (y / window.innerHeight) * 2 + 1;
  };
  
  var eventTouchEnd = function(x, y) {
  };

  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    eventTouchStart(event.clientX, event.clientY);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    eventTouchMove(event.clientX, event.clientY);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    eventTouchStart(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    eventTouchMove(event.touches[0].clientX, event.touches[0].clientY);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });
};

var render = function() {
  renderer.clear();
  renderer.render(scene, camera.obj);
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);

  if (now - last_time_render > 1000 / fps) {
    render();
    last_time_render = Date.now();
  }
};

var resizeRenderer = function() {
  body_width  = document.body.clientWidth;
  body_height = document.body.clientHeight;
  renderer.setSize(body_width, body_height);
  camera.init(util.getRadian(20), util.getRadian(0), body_width, body_height);
};

init();

},{"./camera":1,"./debounce":2,"./hemiLight":3,"./mesh":5,"./pointLight":6,"./util":7}],5:[function(require,module,exports){
var Util = require('./util');
var util = new Util();

var exports = function() {
  var Mesh = function() {
    this.id = 0;
    this.geometry;
    this.material;
    this.mesh;
  };

  Mesh.prototype.init = function(scene, geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.id = this.mesh.id;
    this.setPosition();
  };

  Mesh.prototype.setPosition = function() {
    this.mesh.position.set(0, 0, 0);
  };
  
  return Mesh;
};

module.exports = exports();

},{"./util":7}],6:[function(require,module,exports){
var Util = require('./util');
var util = new Util();

var exports = function(){
  var PointLight = function() {
    this.rad1 = 0;
    this.rad2 = 0;
    this.r = 0;
    this.obj;
  };
  
  PointLight.prototype.init = function(scene, rad1, rad2, r, hex, intensity, distance) {
    this.r = r;
    this.obj = new THREE.PointLight(hex, intensity, distance);
    this.setPosition(rad1, rad2);
    scene.add(this.obj);
  };
  
  PointLight.prototype.setPosition = function(rad1, rad2) {
    var points = get.pointSphere(rad1, rad2, this.r);
    this.obj.position.set(points[0], points[1], points[2]);
  };
  
  return PointLight;
};

module.exports = exports();

},{"./util":7}],7:[function(require,module,exports){
var exports = function(){
  var Util = function() {};
  
  Util.prototype.getRandomInt = function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  };
  
  Util.prototype.getDegree = function(radian) {
    return radian / Math.PI * 180;
  };
  
  Util.prototype.getRadian = function(degrees) {
    return degrees * Math.PI / 180;
  };
  
  Util.prototype.getPointSphere = function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return [x, y, z];
  };
  
  return Util;
};

module.exports = exports();

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2FtZXJhLmpzIiwic3JjL2pzL2RlYm91bmNlLmpzIiwic3JjL2pzL2hlbWlMaWdodC5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL21lc2guanMiLCJzcmMvanMvcG9pbnRMaWdodC5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciB1dGlsID0gbmV3IFV0aWwoKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgQ2FtZXJhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLndpZHRoID0gMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuICAgIHRoaXMucmFkMSA9IDA7XHJcbiAgICB0aGlzLnJhZDIgPSAwO1xyXG4gICAgdGhpcy5yID0gMTIwMDtcclxuICAgIHRoaXMub2JqO1xyXG4gIH07XHJcbiAgXHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ocmFkMSwgcmFkMiwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLnJhZDEgPSByYWQxO1xyXG4gICAgdGhpcy5yYWQyID0gcmFkMjtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDM1LCB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQsIDEsIDEwMDAwKTtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5yYWQxLCB0aGlzLnJhZDIsIHRoaXMucik7XHJcbiAgfTtcclxuICBcclxuICBDYW1lcmEucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocmFkMSwgcmFkMikge1xyXG4gICAgdmFyIHBvaW50cyA9IHV0aWwuZ2V0UG9pbnRTcGhlcmUocmFkMSwgcmFkMiwgdGhpcy5yKTtcclxuICAgIHRoaXMub2JqLnBvc2l0aW9uLnNldChwb2ludHNbMF0sIHBvaW50c1sxXSwgcG9pbnRzWzJdKTtcclxuICAgIHRoaXMub2JqLnVwLnNldCgwLCAxLCAwKTtcclxuICAgIHRoaXMub2JqLmxvb2tBdCh7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHo6IDBcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBDYW1lcmE7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGV2ZW50VHlwZSwgY2FsbGJhY2spe1xyXG4gIHZhciB0aW1lcjtcclxuXHJcbiAgb2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICBjYWxsYmFjayhldmVudCk7XHJcbiAgICB9LCA1MDApO1xyXG4gIH0sIGZhbHNlKTtcclxufTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIHV0aWwgPSBuZXcgVXRpbCgpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBIZW1pTGlnaHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkMSA9IDA7XHJcbiAgICB0aGlzLnJhZDIgPSAwO1xyXG4gICAgdGhpcy5yID0gMDtcclxuICAgIHRoaXMub2JqO1xyXG4gIH07XHJcbiAgXHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHJhZDEsIHJhZDIsIHIsIGhleDEsIGhleDIsIGludGVuc2l0eSkge1xyXG4gICAgdGhpcy5yID0gcjtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodChoZXgxLCBoZXgyLCBpbnRlbnNpdHkpO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbihyYWQxLCByYWQyKTtcclxuICAgIHNjZW5lLmFkZCh0aGlzLm9iaik7XHJcbiAgfTtcclxuICBcclxuICBIZW1pTGlnaHQucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocmFkMSwgcmFkMikge1xyXG4gICAgdmFyIHBvaW50cyA9IHV0aWwuZ2V0UG9pbnRTcGhlcmUocmFkMSwgcmFkMiwgdGhpcy5yKTtcclxuICAgIHRoaXMub2JqLnBvc2l0aW9uLnNldChwb2ludHNbMF0sIHBvaW50c1sxXSwgcG9pbnRzWzJdKTtcclxuICB9O1xyXG4gIFxyXG4gIHJldHVybiBIZW1pTGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIHV0aWwgPSBuZXcgVXRpbCgpO1xyXG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyk7XHJcbnZhciBDYW1lcmEgPSByZXF1aXJlKCcuL2NhbWVyYScpO1xyXG52YXIgUG9pbnRMaWdodCA9IHJlcXVpcmUoJy4vcG9pbnRMaWdodCcpO1xyXG52YXIgSGVtaUxpZ2h0ID0gcmVxdWlyZSgnLi9oZW1pTGlnaHQnKTtcclxudmFyIE1lc2ggPSByZXF1aXJlKCcuL21lc2gnKTtcclxuXHJcbnZhciBib2R5X3dpZHRoID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcclxudmFyIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQ7XHJcbnZhciBmcHMgPSA2MDtcclxudmFyIGxhc3RfdGltZV9yZW5kZXIgPSBEYXRlLm5vdygpO1xyXG52YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG52YXIgbW91c2VfdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoLTIsIC0yKTtcclxudmFyIGludGVyc2VjdHM7XHJcblxyXG52YXIgY2FudmFzO1xyXG52YXIgcmVuZGVyZXI7XHJcbnZhciBzY2VuZTtcclxudmFyIGNhbWVyYTtcclxudmFyIGxpZ2h0O1xyXG52YXIgaW1hZ2VzO1xyXG5cclxudmFyIGluaXRUaHJlZSA9IGZ1bmN0aW9uKCkge1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcclxuICAgIGFudGlhbGlhczogdHJ1ZVxyXG4gIH0pO1xyXG4gIGlmICghcmVuZGVyZXIpIHtcclxuICAgIGFsZXJ0KCdUaHJlZS5qc+OBruWIneacn+WMluOBq+WkseaVl+OBl+OBvuOBl+OBn+OAgicpO1xyXG4gIH1cclxuICByZW5kZXJlci5zZXRTaXplKGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcclxuICBjYW52YXMuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XHJcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweGVlZWVlZSwgMS4wKTtcclxuICBcclxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xyXG59O1xyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuICBpbml0VGhyZWUoKTtcclxuICBcclxuICBjYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XHJcbiAgY2FtZXJhLmluaXQodXRpbC5nZXRSYWRpYW4oMjApLCB1dGlsLmdldFJhZGlhbigwKSwgYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG4gIFxyXG4gIGxpZ2h0ID0gbmV3IEhlbWlMaWdodCgpO1xyXG4gIGxpZ2h0LmluaXQoc2NlbmUsIHV0aWwuZ2V0UmFkaWFuKDMwKSwgdXRpbC5nZXRSYWRpYW4oNjApLCAxMDAwLCAweGVlZWVmZiwgMHg3Nzc3MDAsIDEpO1xyXG4gIFxyXG4gIGxvYWRJbWFnZXMoKTtcclxuICBcclxuICByZW5kZXJsb29wKCk7XHJcbiAgc2V0RXZlbnQoKTtcclxuICBkZWJvdW5jZSh3aW5kb3csICdyZXNpemUnLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICByZXNpemVSZW5kZXJlcigpO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGxvYWRJbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHZhciB1cmwgPSAnaW1hZ2VzLmpzb24nO1xyXG4gIFxyXG4gIHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoeG1saHR0cC5yZWFkeVN0YXRlID09IDQgJiYgeG1saHR0cC5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgIGltYWdlcyA9IEpTT04ucGFyc2UoeG1saHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgfVxyXG4gIH1cclxuICB4bWxodHRwLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgeG1saHR0cC5zZW5kKCk7XHJcbn07XHJcblxyXG52YXIgc2V0RXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgdmFyIG1vdXNlX2Rvd24gPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG4gIHZhciBtb3VzZV9tb3ZlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuXHJcbiAgdmFyIGV2ZW50VG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIG1vdXNlX2Rvd24uc2V0KHgsIHkpO1xyXG4gICAgbW91c2VfdmVjdG9yLnggPSAoeCAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDIgLSAxO1xyXG4gICAgbW91c2VfdmVjdG9yLnkgPSAtICh5IC8gd2luZG93LmlubmVySGVpZ2h0KSAqIDIgKyAxO1xyXG4gICAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEobW91c2VfdmVjdG9yLCBjYW1lcmEub2JqKTtcclxuICAgIGludGVyc2VjdHMgPSByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhzY2VuZS5jaGlsZHJlbik7XHJcbiAgfTtcclxuICBcclxuICB2YXIgZXZlbnRUb3VjaE1vdmUgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICBtb3VzZV9tb3ZlLnNldCh4LCB5KTtcclxuICAgIG1vdXNlX3ZlY3Rvci54ID0gKHggLyB3aW5kb3cuaW5uZXJXaWR0aCkgKiAyIC0gMTtcclxuICAgIG1vdXNlX3ZlY3Rvci55ID0gLSAoeSAvIHdpbmRvdy5pbm5lckhlaWdodCkgKiAyICsgMTtcclxuICB9O1xyXG4gIFxyXG4gIHZhciBldmVudFRvdWNoRW5kID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gIH07XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaFN0YXJ0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZXZlbnRUb3VjaEVuZCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hTdGFydChldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudFRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50VG91Y2hFbmQoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICByZW5kZXJlci5jbGVhcigpO1xyXG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhLm9iaik7XHJcbn07XHJcblxyXG52YXIgcmVuZGVybG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJsb29wKTtcclxuXHJcbiAgaWYgKG5vdyAtIGxhc3RfdGltZV9yZW5kZXIgPiAxMDAwIC8gZnBzKSB7XHJcbiAgICByZW5kZXIoKTtcclxuICAgIGxhc3RfdGltZV9yZW5kZXIgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciByZXNpemVSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcclxuICBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xyXG4gIHJlbmRlcmVyLnNldFNpemUoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG4gIGNhbWVyYS5pbml0KHV0aWwuZ2V0UmFkaWFuKDIwKSwgdXRpbC5nZXRSYWRpYW4oMCksIGJvZHlfd2lkdGgsIGJvZHlfaGVpZ2h0KTtcclxufTtcclxuXHJcbmluaXQoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIHV0aWwgPSBuZXcgVXRpbCgpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgTWVzaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pZCA9IDA7XHJcbiAgICB0aGlzLmdlb21ldHJ5O1xyXG4gICAgdGhpcy5tYXRlcmlhbDtcclxuICAgIHRoaXMubWVzaDtcclxuICB9O1xyXG5cclxuICBNZXNoLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIGdlb21ldHJ5LCBtYXRlcmlhbCkge1xyXG4gICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsO1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcblxyXG4gICAgdGhpcy5pZCA9IHRoaXMubWVzaC5pZDtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcclxuICB9O1xyXG5cclxuICBNZXNoLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tZXNoLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcclxuICB9O1xyXG4gIFxyXG4gIHJldHVybiBNZXNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciB1dGlsID0gbmV3IFV0aWwoKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUG9pbnRMaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWQxID0gMDtcclxuICAgIHRoaXMucmFkMiA9IDA7XHJcbiAgICB0aGlzLnIgPSAwO1xyXG4gICAgdGhpcy5vYmo7XHJcbiAgfTtcclxuICBcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oc2NlbmUsIHJhZDEsIHJhZDIsIHIsIGhleCwgaW50ZW5zaXR5LCBkaXN0YW5jZSkge1xyXG4gICAgdGhpcy5yID0gcjtcclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoaGV4LCBpbnRlbnNpdHksIGRpc3RhbmNlKTtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24ocmFkMSwgcmFkMik7XHJcbiAgICBzY2VuZS5hZGQodGhpcy5vYmopO1xyXG4gIH07XHJcbiAgXHJcbiAgUG9pbnRMaWdodC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihyYWQxLCByYWQyKSB7XHJcbiAgICB2YXIgcG9pbnRzID0gZ2V0LnBvaW50U3BoZXJlKHJhZDEsIHJhZDIsIHRoaXMucik7XHJcbiAgICB0aGlzLm9iai5wb3NpdGlvbi5zZXQocG9pbnRzWzBdLCBwb2ludHNbMV0sIHBvaW50c1syXSk7XHJcbiAgfTtcclxuICBcclxuICByZXR1cm4gUG9pbnRMaWdodDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFV0aWwgPSBmdW5jdGlvbigpIHt9O1xyXG4gIFxyXG4gIFV0aWwucHJvdG90eXBlLmdldFJhbmRvbUludCA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XHJcbiAgfTtcclxuICBcclxuICBVdGlsLnByb3RvdHlwZS5nZXREZWdyZWUgPSBmdW5jdGlvbihyYWRpYW4pIHtcclxuICAgIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xyXG4gIH07XHJcbiAgXHJcbiAgVXRpbC5wcm90b3R5cGUuZ2V0UmFkaWFuID0gZnVuY3Rpb24oZGVncmVlcykge1xyXG4gICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gIH07XHJcbiAgXHJcbiAgVXRpbC5wcm90b3R5cGUuZ2V0UG9pbnRTcGhlcmUgPSBmdW5jdGlvbihyYWQxLCByYWQyLCByKSB7XHJcbiAgICB2YXIgeCA9IE1hdGguY29zKHJhZDEpICogTWF0aC5jb3MocmFkMikgKiByO1xyXG4gICAgdmFyIHogPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguc2luKHJhZDIpICogcjtcclxuICAgIHZhciB5ID0gTWF0aC5zaW4ocmFkMSkgKiByO1xyXG4gICAgcmV0dXJuIFt4LCB5LCB6XTtcclxuICB9O1xyXG4gIFxyXG4gIHJldHVybiBVdGlsO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiJdfQ==
