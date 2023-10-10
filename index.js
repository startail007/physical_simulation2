import { Polygon } from "./js/math/Polygon.js";
import { BodyBox, BodyCircle } from "./js/physics/Body.js";
import { Vector, VectorE } from "./js/math/Vector.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;

const bodyList = [];
const body1 = new BodyBox(200, 80, 100, 100);
// body1.rotate(Math.PI * 0.25);
bodyList.push(body1);
for (let i = 0; i < 10; i++) {
  const body = new BodyBox(
    50 + Math.random() * 700,
    50 + Math.random() * 500,
    50 + Math.random() * 30,
    50 + Math.random() * 30
  );
  body.rotate(2 * Math.PI * Math.random());
  bodyList.push(body);
}

bodyList.push(new BodyCircle(310, 200, 25));
bodyList.push(new BodyBox(200, 200, 50, 50));
bodyList.push(new BodyBox(240, 200, 50, 50));
bodyList.push(new BodyCircle(310, 240, 25));

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
  body1.updateCenter();
  const move = Vector.sub(center, body1.pos);
  body1.move(move);
  // body1.rotate(0.02);
  for (let i = 0; i < bodyList.length - 1; i++) {
    for (let j = i + 1; j < bodyList.length; j++) {
      const bodyA = bodyList[i];
      const bodyB = bodyList[j];
      if (bodyA.type == "polygon" && bodyB.type == "polygon") {
        const info = Polygon.intersectPolygons(bodyA.points, bodyB.points);
        if (info) {
          const { normal, depth } = info;
          bodyA.move(Vector.scale(normal, -depth / 2));
          bodyB.move(Vector.scale(normal, depth / 2));
        }
      } else if (bodyA.type == "polygon" && bodyB.type == "circle") {
        const info = Polygon.intersectCirclePolygon(bodyB.pos, bodyB.radius, bodyA.points);
        if (info) {
          const { normal, depth } = info;
          bodyA.move(Vector.scale(normal, -depth / 2));
          bodyB.move(Vector.scale(normal, depth / 2));
        }
      } else if (bodyB.type == "polygon" && bodyA.type == "circle") {
        const info = Polygon.intersectCirclePolygon(bodyA.pos, bodyA.radius, bodyB.points);
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
  for (let i = 0; i < bodyList.length; i++) {
    const body = bodyList[i];
    body.render(ctx);
  }

  ctx.font = "18px Noto Sans TC";
  ctx.textAlign = "start";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#ffffff";
  ctx.fillText((1 / delta).toFixed(1), 10, 10);
};
requestAnimationFrame(animate);
