import { Vector, VectorE } from "../math/Vector.js";
export class Stick {
  constructor(A, B, target_dist) {
    this.A = A;
    this.B = B;
    this.target_dist = target_dist ?? Vector.distance(A.pos, B.pos);
    this.color = "#ffff00";
    this.restitution = 0.4;
  }
  update(dt) {
    const axis = Vector.sub(this.B.pos, this.A.pos);
    const dist = Math.max(Vector.length(axis), 0.001);

    const diff = this.target_dist - dist;
    const offset = Vector.scale(axis, dt * this.restitution * (diff / dist));
    if (!this.A.pinned && !this.B.pinned) {
      VectorE.sub(this.A.linearVel, Vector.scale(offset, 0.5));
      VectorE.add(this.B.linearVel, Vector.scale(offset, 0.5));
    } else if (this.A.pinned) {
      VectorE.add(this.B.linearVel, offset);
    } else if (this.B.pinned) {
      VectorE.sub(this.A.linearVel, offset);
    }
    let normal = Vector.normalize(axis);
    if (diff < 0) {
      normal = Vector.negate(normal);
    }
    const relativeVel = Vector.sub(this.B.linearVel, this.A.linearVel);
    if (Vector.dot(relativeVel, normal) > 0) {
      return;
    }
    const e = this.restitution;
    const j = (-(1 + e) * Vector.dot(relativeVel, normal)) / (1 + 1);
    const impulse = Vector.scale(normal, j);
    VectorE.sub(this.A.linearVel, Vector.scale(impulse, 1));
    VectorE.add(this.B.linearVel, Vector.scale(impulse, 1));
  }
}
