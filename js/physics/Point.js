import { Vector, VectorE } from "../math/Vector.js";
export class Point {
  constructor(pos, pinned = false) {
    this.pos = Vector.clone(pos);
    this.force = Vector.zero();
    this.linearVel = Vector.zero();
    this.pinned = pinned;
  }
  update(dt) {
    if (this.pinned) return;
    VectorE.add(this.linearVel, Vector.scale(this.force, dt));
    VectorE.add(this.pos, Vector.scale(this.linearVel, dt));
    this.force = Vector.zero();
  }
  addForce(amount) {
    this.force = amount;
  }
}
