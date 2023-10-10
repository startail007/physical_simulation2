export class FPS {
  constructor(t = 0) {
    this.oldTime = t;
    this.delta = 0;
  }
  update(t) {
    this.delta = (t - this.oldTime) / 1000;
    this.oldTime = t;
  }
  render(ctx) {
    ctx.font = "18px Noto Sans TC";
    ctx.textAlign = "start";
    ctx.textBaseline = "hanging";
    ctx.fillStyle = "#ffffff";
    ctx.fillText((1 / this.delta).toFixed(1), 10, 10);
  }
}
