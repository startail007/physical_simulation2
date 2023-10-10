import { Vector, VectorE } from "../math/Vector.js";
export class Body {
  constructor(pos, density = 0, option = {}) {
    this.type = "";
    this.color = "#00ff00";
    this.pos = Vector.clone(pos);
    this.lineVel = Vector.zero();
    this.angle = 0;
    this.angleVel = 0;
    this.density = density;
    this.mass = 0;
    this.restitution = 0;
    this.area = 0;
    this.inertia = 0;
    this.isStatic = false;
    this.points = [];
    this._transformedPoints = [];
    this._transformUpdateRequired = false;
    Object.assign(this, option);
  }
  get transformedPoints() {
    if (this._transformUpdateRequired) {
      this._transformedPoints = this.points.map((point) => Vector.add(Vector.rotate(point, this.angle), this.pos));
      this._transformUpdateRequired = false;
    }
    return this._transformedPoints;
  }
  update(dt) {}
  rotate(amount) {
    this.angle += amount;
    this._transformUpdateRequired = true;
  }
  rotateTo(angle) {
    this.angle = angle;
    this.transformUpdateRequired = true;
  }
  rotateFrom(amount, center) {
    this.angle += amount;
    const move = Vector.sub(Vector.rotateFrom(this.pos, amount, center), this.pos);
    VectorE.add(this.pos, move);
    this._transformUpdateRequired = true;
  }
  move(vector) {
    VectorE.add(this.pos, vector);
    this._transformUpdateRequired = true;
  }
  moveTo(vector) {
    VectorE.set(this.pos, vector);
    this._transformUpdateRequired = true;
  }
  render(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    const points = this.transformedPoints;
    if (points.length > 1) {
      ctx.moveTo(...points[0]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i]);
      }
      ctx.lineTo(...points[0]);
    }
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(...this.pos, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export class BodyBox extends Body {
  constructor(pos, size = [100, 100], density = 1, option = {}) {
    super(pos, density, option);
    this.size = Vector.clone(size);
    this.area = size[0] * size[1];
    this.mass = this.density * this.area;
    this.type = "box";
    const halfSize = Vector.scale(this.size, 0.5);
    this.points.push([-halfSize[0], -halfSize[1]]);
    this.points.push([halfSize[0], -halfSize[1]]);
    this.points.push([halfSize[0], halfSize[1]]);
    this.points.push([-halfSize[0], halfSize[1]]);
    this._transformUpdateRequired = true;
  }
}
export class BodyCircle extends Body {
  constructor(pos, radius = 50, density = 1, option = {}) {
    super(pos, density, option);
    this.radius = radius;
    this.area = radius * radius * Math.PI;
    this.mass = this.density * this.area;
    this.type = "circle";
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
