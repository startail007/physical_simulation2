import { Polygon } from "../math/Polygon.js";
import { Vector, VectorE } from "../math/Vector.js";

export class World {
  constructor() {
    this.bodyList = [];
  }
  addBody(body) {
    this.bodyList.push(body);
  }
  update() {
    for (let i = 0; i < this.bodyList.length; i++) {
      const body = this.bodyList[i];
      body.update();
    }
    for (let i = 0; i < this.bodyList.length - 1; i++) {
      for (let j = i + 1; j < this.bodyList.length; j++) {
        const bodyA = this.bodyList[i];
        const bodyB = this.bodyList[j];
        if (bodyA.type == "box" && bodyB.type == "box") {
          const info = Polygon.intersectPolygons(bodyA.transformedPoints, bodyB.transformedPoints);
          if (info) {
            const { normal, depth } = info;
            bodyA.move(Vector.scale(normal, -depth / 2));
            bodyB.move(Vector.scale(normal, depth / 2));
          }
        } else if (bodyA.type == "box" && bodyB.type == "circle") {
          const info = Polygon.intersectCirclePolygon(bodyB.pos, bodyB.radius, bodyA.transformedPoints);
          if (info) {
            const { normal, depth } = info;
            bodyA.move(Vector.scale(normal, -depth / 2));
            bodyB.move(Vector.scale(normal, depth / 2));
          }
        } else if (bodyB.type == "box" && bodyA.type == "circle") {
          const info = Polygon.intersectCirclePolygon(bodyA.pos, bodyA.radius, bodyB.transformedPoints);
          if (info) {
            const { normal, depth } = info;
            bodyB.move(Vector.scale(normal, -depth / 2));
            bodyA.move(Vector.scale(normal, depth / 2));
          }
        } else if (bodyA.type == "circle" && bodyB.type == "circle") {
          const info = Polygon.intersectCircles(bodyA.pos, bodyA.radius, bodyB.pos, bodyB.radius);
          if (info) {
            const { normal, depth } = info;
            bodyA.move(Vector.scale(normal, -depth / 2));
            bodyB.move(Vector.scale(normal, depth / 2));
          }
        }
      }
    }
  }
  render(ctx) {
    for (let i = 0; i < this.bodyList.length; i++) {
      const body = this.bodyList[i];
      body.render(ctx);
    }
  }
}
