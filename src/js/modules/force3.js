import Util from './util.js';

export default class Force3 {
  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.anchor = new THREE.Vector3();
    this.mass = 1;
  };
  updatePosition() {
    this.position.copy(this.velocity);
  };
  updateVelocity() {
    this.acceleration.divideScalar(this.mass);
    this.velocity.add(this.acceleration);
  };
  applyForce(vector) {
    this.acceleration.add(vector);
  };
  applyFriction(mu, normal) {
    const force = this.acceleration.clone();
    if (!normal) normal = 1;
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(mu);
    this.applyForce(force);
  };
  applyDrag(value) {
    const force = this.acceleration.clone();
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(this.acceleration.length() * value);
    this.applyForce(force);
  };
  applyHook(rest_length, k) {
    const force = this.velocity.clone().sub(this.anchor);
    const distance = force.length() - rest_length;
    force.normalize();
    force.multiplyScalar(-1 * k * distance);
    this.applyForce(force);
  };
};
