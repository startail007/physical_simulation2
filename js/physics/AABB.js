import { Vector } from "../math/Vector.js";

export class AABB {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
  get rect() {
    return { pos: this.min, size: Vector.sub(this.max, this.min) };
  }
}
