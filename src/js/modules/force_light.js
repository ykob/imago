import Force3 from './force3.js';

export default class ForceLight extends THREE.PointLight {
  constructor(hex, intensity, distance, decay) {
    super(hex, intensity, distance, decay);
    this.move = new Force3();
  }
  render() {
    this.move.applyHook(0, 0.02);
    this.move.applyDrag(0.3);
    this.move.updateVelocity();
    this.move.updatePosition();
    this.position.copy(this.move.position);
  }
}
