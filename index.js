import { ShapeBox } from "./js/shape.js";
import { Line, Vector, VectorE } from "./js/vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;

const shapes = [];
const shape1 = new ShapeBox(200, 80, 150, 50);
// shape1.rotate(Math.PI * 0.25);
shapes.push(shape1);
for (let i = 0; i < 10; i++) {
  const shape = new ShapeBox(
    50 + Math.random() * 700,
    50 + Math.random() * 500,
    50 + Math.random() * 30,
    50 + Math.random() * 30
  );
  shape.rotate(2 * Math.PI * Math.random());
  shapes.push(shape);
}
shapes.push(new ShapeBox(200, 200, 50, 50));
shapes.push(new ShapeBox(240, 200, 50, 50));

const getNormals = (points) => {
  const normals = [];

  for (let i = 0; i < points.length; i++) {
    const edge = [points[(i + 1) % points.length][0] - points[i][0], points[(i + 1) % points.length][1] - points[i][1]];

    normals.push(Vector.normalize(Vector.normal(edge)));
  }

  return normals;
};

const project = (points, axis) => {
  let min = Infinity;
  let max = -Infinity;

  points.forEach((point) => {
    const projected = Vector.dot(point, axis);
    min = Math.min(min, projected);
    max = Math.max(max, projected);
  });

  return { min, max };
};

const intersectPolygons = (verticesA, verticesB) => {
  let normal = [0, 0];
  let depth = Number.POSITIVE_INFINITY;

  const axes = [...getNormals(verticesA), ...getNormals(verticesB)];
  let bool = false;
  axes.forEach((axis) => {
    const projection1 = project(verticesA, axis);
    const projection2 = project(verticesB, axis);
    if (projection1.min > projection2.max || projection2.min > projection1.max) {
      return;
    }
    const axisDepth = Math.min(projection2.max - projection1.min, projection1.max - projection2.min);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
      bool = projection1.max > projection2.max;
    }
  });
  if (bool) {
    normal = Vector.negate(normal);
  }
  return { normal, depth };
};

const mPos = [0, 0];
const center = [0, 0];
canvas.addEventListener("mousemove", (ev) => {
  VectorE.set(mPos, [ev.offsetX, ev.offsetY]);
});
let oldTime = Date.now();
const animate = () => {
  requestAnimationFrame(animate);
  const nowTime = Date.now();
  const delta = (nowTime - oldTime) / 1000;
  oldTime = nowTime;
  ctx.clearRect(0, 0, cWidth, cHeight);

  VectorE.set(center, Vector.mix(center, mPos, 0.4));
  shape1.updateCenter();
  const move = Vector.sub(center, shape1.center);
  shape1.move(move);
  shape1.rotate(0.02);

  for (let i = 0; i < shapes.length - 1; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const shapeA = shapes[i];
      const shapeB = shapes[j];
      if (shapeA.SATCollision(shapeB)) {
        const { normal, depth } = intersectPolygons(
          shapeA.points.map((el) => el.pos),
          shapeB.points.map((el) => el.pos)
        );
        shapeA.move(Vector.scale(normal, -depth / 2));
        shapeB.move(Vector.scale(normal, depth / 2));
      }
    }
  }
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    shape.render(ctx);
  }

  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText((1 / delta).toFixed(1), 10, 10);
};
requestAnimationFrame(animate);
