import { BodyBox, BodyCircle } from "./js/physics/Body.js";
import { Vector, VectorE } from "./js/math/Vector.js";
import { World } from "./js/physics/World.js";
import { FPS } from "./js/state.js";
import { Draw } from "./js/physics/Draw.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;
const world = new World();
const body1 = new BodyBox([200, 80], [50, 50], { isStatic: true });
body1.moveTo([300, 300]);
// body1.rotate(Math.PI * 0.25);
world.addBody(body1);
// for (let i = 0; i < 10; i++) {
//   const body = new BodyBox(
//     [50 + Math.random() * 700, 50 + Math.random() * 500],
//     [50 + Math.random() * 30, 50 + Math.random() * 30]
//   );
//   body.rotate(2 * Math.PI * Math.random());
//   world.addBody(body);
// }

world.addBody(new BodyCircle([350, 100], 25));
world.addBody(new BodyCircle([350, 240], 25));
world.addBody(new BodyBox([320, 100], [50, 50]));
world.addBody(new BodyCircle([310, 280], 25));
world.addBody(new BodyCircle([310, 320], 25));
world.addBody(new BodyCircle([400, 320], 25));
world.addBody(new BodyBox([200, 100], [50, 50]));
world.addBody(new BodyBox([200, 240], [50, 50]));
world.addBody(new BodyBox([200, 280], [50, 50]));
world.addBody(new BodyBox([80, 200], [50, 50]));
world.addBody(new BodyBox([80, 240], [50, 50]));
world.addBody(new BodyBox([280, 200], [150, 50]));
world.addBody(new BodyBox([280, 240], [50, 50]));
world.addBody(new BodyBox([80, 280], [50, 50]));
world.addBody(new BodyBox([180, 240], [50, 50], { angle: 0.25 * Math.PI }));

world.addBody(new BodyBox([500, 700], [1000, 100], { isStatic: true }));
world.addBody(new BodyBox([0, 350], [100, 700], { isStatic: true }));
world.addBody(new BodyBox([1000, 350], [100, 700], { isStatic: true }));

world.addBody(new BodyBox([400, 300], [400, 50], { isStatic: true, angle: 0.05 * Math.PI }));
// world.addBody(new BodyBox([600, 300], [300, 50], { isStatic: true }));
const draw = new Draw();

const mPos = [0, 0];
const center = [0, 0];
canvas.addEventListener("mousemove", (ev) => {
  VectorE.set(mPos, [ev.offsetX, ev.offsetY]);
});
const fps = new FPS();
const animate = (t) => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, cWidth, cHeight);

  VectorE.set(center, Vector.mix(center, mPos, 0.1));
  const move = Vector.sub(center, body1.pos);
  body1.move(move);
  // VectorE.set(body1.linearVel, move);
  // body1.rotateFrom(0.02, [400, 300]);

  world.update(world.t);
  // world.render(ctx);
  draw.render(ctx, world);

  fps.update(t);
  fps.render(ctx);
};
requestAnimationFrame(animate);
