import { Vector } from "../math/Vector.js";

export class Draw {
  constructor() {
    this.type = ["box", "circle"];
    this.center = true;
    this.aabb = false;
    this.linearVelText = false;
    this.dir = true;
    this.contact = true;
    this.collisions = true;
  }
  static drawPolygon(ctx, points) {
    ctx.beginPath();
    if (points.length > 1) {
      ctx.moveTo(...points[0]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i]);
      }
      ctx.lineTo(...points[0]);
    }
  }
  static drawLine(ctx, point0, point1) {
    ctx.beginPath();
    ctx.moveTo(...point0);
    ctx.lineTo(...point1);
  }
  static drawRect(ctx, pos, size) {
    ctx.beginPath();
    ctx.rect(...pos, ...size);
  }
  static drawCircle(ctx, pos, radius) {
    ctx.beginPath();
    ctx.arc(...pos, radius, 0, 2 * Math.PI);
  }
  static drawLine(ctx, posA, posB) {
    ctx.beginPath();
    ctx.moveTo(...posA);
    ctx.lineTo(...posB);
  }
  renderAABB(ctx, body, color = "#0000ff") {
    if (!this.aabb) return;
    const rect = body.aabb.rect;
    ctx.strokeStyle = color;
    Draw.drawRect(ctx, rect.pos, rect.size);
    ctx.stroke();
  }
  renderCenter(ctx, body, color = "#ffffff") {
    if (!this.center) return;
    ctx.fillStyle = color;
    Draw.drawCircle(ctx, body.pos, 3);
    ctx.fill();
  }
  renderLinearVelText(ctx, body, color = "#ffffff") {
    if (!this.linearVelText) return;
    ctx.font = "10px Noto Sans TC";
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    ctx.fillStyle = color;
    ctx.fillText(`${body.linearVel[0].toFixed(2)},${body.linearVel[1].toFixed(2)}`, ...body.pos);
  }
  renderDir(ctx, body, color = "#ffffff") {
    if (!this.dir) return;
    ctx.strokeStyle = color;
    const dir = [Math.cos(body.angle), Math.sin(body.angle)];
    Draw.drawLine(ctx, body.pos, Vector.add(body.pos, Vector.scale(dir, 20)));
    ctx.stroke();
  }
  renderShape(ctx, body, color = "#ffffff") {
    if (!this.type.includes(body.type)) return;
    if (body.type == "box") {
      ctx.strokeStyle = color;
      Draw.drawPolygon(ctx, body.transformedPoints);
      ctx.stroke();
    } else if (body.type == "circle") {
      ctx.strokeStyle = color;
      Draw.drawCircle(ctx, body.pos, body.radius);
      ctx.stroke();
    }
  }
  renderCollisions(ctx, contactPairs) {
    if (!this.collisions) return;
    contactPairs.forEach((manifold) => {
      this.renderShape(ctx, manifold.bodyA, "#ff0000");
      this.renderShape(ctx, manifold.bodyB, "#ff0000");
    });
  }
  renderContact(ctx, contactPairs, color = "#ffffff") {
    if (!this.contact) return;
    contactPairs.forEach((manifold) => {
      manifold.contactList.forEach((contact) => {
        ctx.fillStyle = "#999999";
        Draw.drawCircle(ctx, contact, 3);
        ctx.fill();
      });
    });
  }
  render(ctx, world) {
    const bodyList = world.arrayBodyList;
    bodyList.forEach((body) => {
      this.renderShape(ctx, body, body.isStatic ? "#666666" : "#00ff00");
      this.renderDir(ctx, body);
      this.renderAABB(ctx, body);
      if (!body.isStatic) {
        this.renderCenter(ctx, body);
        this.renderLinearVelText(ctx, body);
      }
    });
    this.renderCollisions(ctx, world.contactPairs);
    this.renderContact(ctx, world.contactPairs);
    world.stickList.forEach((stick) => {
      ctx.strokeStyle = "#ff00ff";
      Draw.drawLine(ctx, stick.A.pos, stick.B.pos);
      ctx.stroke();
    });
  }
}
