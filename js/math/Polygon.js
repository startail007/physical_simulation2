import { Vector } from "./Vector.js";

export class Polygon {
  // static inPolygon(vector, points) {
  //   let inside = false;
  //   const n = points.length;

  //   for (let i = 0, j = n - 1; i < n; j = i++) {
  //     const xi = points[i][0];
  //     const yi = points[i][1];
  //     const xj = points[j][0];
  //     const yj = points[j][1];
  //     console.log(vector[0], ((xj - xi) * (vector[1] - yi)) / (yj - yi) + xi);
  //     const intersect =
  //       yi > vector[1] !== yj > vector[1] && vector[0] < ((xj - xi) * (vector[1] - yi)) / (yj - yi) + xi;

  //     if (intersect) inside = !inside;
  //   }

  //   return inside;
  // }
  static inPolygon(point, points) {
    function isLeft(x0, y0, x1, y1, x, y) {
      return (x1 - x0) * (y - y0) - (x - x0) * (y1 - y0);
    }
    const x = point[0];
    const y = point[1];

    let wn = 0;

    for (let i = 0; i < points.length; i++) {
      const xi = points[i][0];
      const yi = points[i][1];

      const nextIndex = (i + 1) % points.length;
      const xj = points[nextIndex][0];
      const yj = points[nextIndex][1];
      const lt = [Math.min(xi, xj), Math.min(yi, yj)];
      const rb = [Math.max(xi, xj), Math.max(yi, yj)];
      //判斷是否在某個條線上
      if (x >= lt[0] && x <= rb[0] && y >= lt[1] && y <= rb[1]) {
        if (isLeft(xi, yi, xj, yj, x, y) == 0) {
          return false;
        }
      }
      if (yi <= y) {
        if (yj > y && isLeft(xi, yi, xj, yj, x, y) > 0) {
          wn++;
        }
      } else {
        if (yj <= y && isLeft(xi, yi, xj, yj, x, y) < 0) {
          wn--;
        }
      }
    }

    return wn !== 0;
  }
  static intersectPolygons(pointsA, pointsB) {
    let normal = [0, 0];
    let depth = Number.POSITIVE_INFINITY;

    const axes = [...Polygon.getNormals(pointsA), ...Polygon.getNormals(pointsB)];
    let bool = false;
    for (const axis of axes) {
      const projection1 = Polygon.projectPoints(pointsA, axis);
      const projection2 = Polygon.projectPoints(pointsB, axis);
      if (projection1.min > projection2.max || projection2.min > projection1.max) {
        return;
      }
      const axisDepth = Math.min(projection2.max - projection1.min, projection1.max - projection2.min);
      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
        bool = projection1.max > projection2.max;
      }
    }
    if (bool) {
      depth = -depth;
    }
    return { normal, depth };
  }

  static intersectCirclePolygon(circleCenter, circleRadius, points) {
    let normal = [0, 0];
    let depth = Number.POSITIVE_INFINITY;
    const axes = Polygon.getNormals(points);
    let bool = false;
    for (const axis of axes) {
      const projection1 = Polygon.projectPoints(points, axis);
      const projection2 = Polygon.projectCircle(circleCenter, circleRadius, axis);
      if (projection1.min > projection2.max || projection2.min > projection1.max) {
        return;
      }
      const axisDepth = Math.min(projection2.max - projection1.min, projection1.max - projection2.min);
      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
        bool = projection1.max > projection2.max;
      }
    }
    const cpIndex = Polygon.findClosestPointOnPolygon(circleCenter, points);
    const cp = points[cpIndex];

    const axis = Vector.normalize(Vector.sub(cp, circleCenter));
    const projection1 = Polygon.projectPoints(points, axis);
    const projection2 = Polygon.projectCircle(circleCenter, circleRadius, axis);
    if (projection1.min > projection2.max || projection2.min > projection1.max) {
      return;
    }
    const axisDepth = Math.min(projection2.max - projection1.min, projection1.max - projection2.min);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
      bool = projection1.max > projection2.max;
    }

    if (bool) {
      depth = -depth;
    }
    return { normal, depth };
  }
  static intersectCircles(centerA, radiusA, centerB, radiusB) {
    let normal = [0, 0];
    let depth = 0;

    const distance = Vector.distance(centerA, centerB);
    const radii = radiusA + radiusB;

    if (distance >= radii) {
      return;
    }

    normal = Vector.normalize(Vector.sub(centerB, centerA));
    depth = radii - distance;

    return { normal, depth };
  }
  static findClosestPointOnPolygon(circleCenter, points) {
    let result = -1;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < points.length; i++) {
      const v = points[i];
      const distance = Vector.distance(v, circleCenter);

      if (distance < minDistance) {
        minDistance = distance;
        result = i;
      }
    }

    return result;
  }

  static projectPoints(points, axis) {
    let min = Infinity;
    let max = -Infinity;

    points.forEach((point) => {
      const projected = Vector.dot(point, axis);
      min = Math.min(min, projected);
      max = Math.max(max, projected);
    });

    return { min, max };
  }
  static projectCircle(center, radius, axis) {
    const direction = Vector.normalize(axis);
    const directionAndRadius = Vector.scale(direction, radius);

    const p1 = Vector.add(center, directionAndRadius);
    const p2 = Vector.sub(center, directionAndRadius);

    let min = Vector.dot(p1, axis);
    let max = Vector.dot(p2, axis);

    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    return { min, max };
  }
  static getNormals(points) {
    const normals = [];

    for (let i = 0; i < points.length; i++) {
      const edge = [
        points[(i + 1) % points.length][0] - points[i][0],
        points[(i + 1) % points.length][1] - points[i][1],
      ];

      normals.push(Vector.normalize(Vector.normal(edge)));
    }

    return normals;
  }
  static collision_sat(pointsA, pointsB) {
    function overlap(projection1, projection2) {
      return projection1.min <= projection2.max && projection1.max >= projection2.min;
    }
    const axes = [...Polygon.getNormals(pointsA), ...Polygon.getNormals(pointsB)];

    for (const axis of axes) {
      const projection1 = Polygon.projectPoints(pointsA, axis);
      const projection2 = Polygon.projectPoints(pointsB, axis);
      if (!overlap(projection1, projection2)) {
        return false;
      }
    }

    return true;
  }
}
