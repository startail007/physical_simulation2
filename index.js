import { BodyBox, BodyCircle } from "./js/physics/Body.js";
import { Vector, VectorE } from "./js/math/Vector.js";
import { World } from "./js/physics/World.js";
import { FPS } from "./js/state.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;
const world = new World();
const body1 = new BodyBox([200, 80], [100, 100]);
body1.moveTo([300, 300]);
// body1.rotate(Math.PI * 0.25);
world.addBody(body1);
for (let i = 0; i < 10; i++) {
  const body = new BodyBox(
    [50 + Math.random() * 700, 50 + Math.random() * 500],
    [50 + Math.random() * 30, 50 + Math.random() * 30]
  );
  body.rotate(2 * Math.PI * Math.random());
  world.addBody(body);
}

world.addBody(new BodyCircle([310, 200], 25));
world.addBody(new BodyBox([200, 200], [50, 50]));
world.addBody(new BodyBox([240, 200], [50, 50]));
world.addBody(new BodyCircle([310, 240], 25));

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
  // body1.rotateFrom(0.02, [400, 300]);

  world.update();
  world.render(ctx);

  fps.update(t);
  fps.render(ctx);
};
requestAnimationFrame(animate);
