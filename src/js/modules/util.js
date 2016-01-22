export default {
  getRandomInt: function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getDegree: function(radian) {
    return radian / Math.PI * 180;
  },
  getRadian: function(degrees) {
    return degrees * Math.PI / 180;
  },
  getPolar: function(rad1, rad2, r) {
    var x = Math.sin(rad1) * Math.cos(rad2) * r;
    var z = Math.sin(rad1) * Math.sin(rad2) * r;
    var y = Math.cos(rad1) * r;
    return new THREE.Vector3(x, y, z);
  }
};
