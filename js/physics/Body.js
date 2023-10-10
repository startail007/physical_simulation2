import { Vector, VectorE } from "../math/Vector.js";
export class Body {
  constructor(x, y) {
    this.points = [];
    this.color = "#00ff00";
    this.pos = [x, y];
    this.type = "polygon";
  }
  update(dt) {
    this.updateCenter();
  }
  rotate(angle) {
    this.updateCenter();
    this.rotateFrom(angle, this.pos);
  }
  rotateFrom(angle, center) {
    this.points.forEach((el) => VectorE.set(el, Vector.rotateFrom(el, angle, center)));
  }
  move(vector) {
    VectorE.add(this.pos, vector);
    this.points.forEach((point) => {
      VectorE.add(point, vector);
    });
  }
  updateCenter() {
    if (!this.points.length) return;
    this.pos = Vector.average(this.points);
  }
  render(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    if (this.points.length > 1) {
      ctx.moveTo(...this.points[0]);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(...this.points[i]);
      }
      ctx.lineTo(...this.points[0]);
    }
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(...this.pos, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export class BodyBox extends Body {
  constructor(x, y, width = 100, height = 100) {
    super(x, y);
    this.size = [width, height];
    this.halfSize = Vector.scale(this.size, 0.5);
    this.points.push([x - this.halfSize[0], y - this.halfSize[1]]);
    this.points.push([x + this.halfSize[0], y - this.halfSize[1]]);
    this.points.push([x + this.halfSize[0], y + this.halfSize[1]]);
    this.points.push([x - this.halfSize[0], y + this.halfSize[1]]);
  }
}
export class BodyCircle extends Body {
  constructor(x, y, radius = 50) {
    super(x, y);
    this.type = "circle";
    this.radius = radius;
  }
  move(vector) {
    VectorE.add(this.pos, vector);
  }
  render(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.arc(...this.pos, this.radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(...this.pos, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}
