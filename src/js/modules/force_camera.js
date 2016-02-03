import Force3 from './force3.js';

export default class ForceCamera extends THREE.PerspectiveCamera {
  constructor(fov, aspect, near, far) {
    super(fov, aspect, near, far);
    this.move = new Force3();
    this.look = new Force3();
  }
  render() {
    this.move.applyHook(0, 0.02);
    this.move.applyDrag(0.3);
    this.move.updateVelocity();
    this.move.updatePosition();
    this.position.copy(this.move.position);
    this.look.applyHook(0, 0.02);
    this.look.applyDrag(0.3);
    this.look.updateVelocity();
    this.look.updatePosition();
    this.lookAt(this.look.position);
  }
}
