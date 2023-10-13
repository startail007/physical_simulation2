import { Polygon } from "../math/Polygon.js";
import { Vector } from "../math/Vector.js";

export class Collisions {
  constructor() {}
  static collide(bodyA, bodyB) {
    if (bodyA.type == "box") {
      if (bodyB.type == "box") {
        return Polygon.intersectPolygons(bodyA.transformedPoints, bodyB.transformedPoints);
      } else if (bodyB.type == "circle") {
        return Polygon.intersectCirclePolygon(bodyB.pos, bodyB.radius, bodyA.transformedPoints);
      }
    } else if (bodyA.type == "circle") {
      if (bodyB.type == "box") {
        const info = Polygon.intersectCirclePolygon(bodyA.pos, bodyA.radius, bodyB.transformedPoints);
        if (info) {
          info.normal = Vector.negate(info.normal);
          return info;
        }
      } else if (bodyB.type == "circle") {
        return Polygon.intersectCircles(bodyA.pos, bodyA.radius, bodyB.pos, bodyB.radius);
      }
    }
  }
  static findContactPoints(bodyA, bodyB) {
    if (bodyA.type == "box") {
      if (bodyB.type == "box") {
        return Polygon.findPolygonsContactPoints(bodyA.transformedPoints, bodyB.transformedPoints);
      } else if (bodyB.type == "circle") {
        return Polygon.findCirclePolygonContactPoint(bodyB.pos, bodyB.radius, bodyA.transformedPoints);
      }
    } else if (bodyA.type == "circle") {
      if (bodyB.type == "box") {
        return Polygon.findCirclePolygonContactPoint(bodyA.pos, bodyA.radius, bodyB.transformedPoints);
      } else if (bodyB.type == "circle") {
        return Polygon.findCirclesContactPoint(bodyA.pos, bodyA.radius, bodyB.pos, bodyB.radius);
      }
    }
  }
  static intersectAABBs(a, b) {
    if (a.max[0] <= b.min[0] || b.max[0] <= a.min[0] || a.max[1] <= b.min[1] || b.max[1] <= a.min[1]) {
      return false;
    }
    return true;
  }
}
