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
  requestAnimationFrame: function(callback){
    if (window.requestAnimationFrame) {
      requestAnimationFrame(callback)
    } else {
      setTimeout(callback, 1000 / 60);
    }
  }
};
