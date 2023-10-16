import { Float } from "../math/Float.js";
import { Polygon } from "../math/Polygon.js";
import { Vector, VectorE } from "../math/Vector.js";
import { Collisions } from "./Collisions.js";
import { Manifold } from "./Manifold.js";

export class World {
  constructor() {
    this.t = 0.2;
    this.totalIterations = 20;
    this.gravity = [0, 9.81];
    this.bodyList = new Set();
    this.stickList = [];
    this.contactPairs = [];
    this._arrayBodyList = [];
    this._arrayBodyListUpdateRequired = false;
  }
  get arrayBodyList() {
    if (this._arrayBodyListUpdateRequired) {
      this._arrayBodyList = Array.from(this.bodyList);
      this._arrayBodyListUpdateRequired = false;
    }
    return this._arrayBodyList;
  }
  addBody(body) {
    this.bodyList.add(body);
    this._arrayBodyListUpdateRequired = true;
  }
  removeBody(body) {
    this.bodyList.delete(body);
    this._arrayBodyListUpdateRequired = true;
  }

  resolveCollisionBasic({ bodyA, bodyB, normal }) {
    const relativeVel = Vector.sub(bodyB.linearVel, bodyA.linearVel);
    if (Vector.dot(relativeVel, normal) > 0) {
      return;
    }
    const e = Math.min(bodyA.restitution, bodyB.restitution);
    // const e = Float.mix(bodyA.restitution, bodyB.restitution, 0.5);
    const j = (-(1 + e) * Vector.dot(relativeVel, normal)) / (bodyA.invMass + bodyB.invMass);
    const impulse = Vector.scale(normal, j);
    VectorE.sub(bodyA.linearVel, Vector.scale(impulse, bodyA.invMass));
    VectorE.add(bodyB.linearVel, Vector.scale(impulse, bodyB.invMass));
  }
  resolveCollisionWithRotation({ bodyA, bodyB, normal, contactList }) {
    const contactCount = contactList.length;
    const e = Math.min(bodyA.restitution, bodyB.restitution);

    const impulseList = new Array(contactCount).fill().map(() => Vector.zero());
    const raList = new Array(contactCount).fill().map(() => Vector.zero());
    const rbList = new Array(contactCount).fill().map(() => Vector.zero());
    //console.log(contactCount);
    for (let i = 0; i < contactCount; i++) {
      const ra = Vector.sub(contactList[i], bodyA.pos);
      const rb = Vector.sub(contactList[i], bodyB.pos);

      raList[i] = ra;
      rbList[i] = rb;

      const raPerp = Vector.normal(ra);
      const rbPerp = Vector.normal(rb);

      const angularLinearVelA = Vector.scale(raPerp, bodyA.angularVel);
      const angularLinearVelB = Vector.scale(rbPerp, bodyB.angularVel);

      const relativeVel = Vector.sub(
        Vector.add(bodyB.linearVel, angularLinearVelB),
        Vector.add(bodyA.linearVel, angularLinearVelA)
      );

      const contactVelocityMag = Vector.dot(relativeVel, normal);

      if (contactVelocityMag > 0) {
        continue;
      }

      const raPerpDotN = Vector.dot(raPerp, normal);
      const rbPerpDotN = Vector.dot(rbPerp, normal);

      const denom =
        bodyA.invMass +
        bodyB.invMass +
        raPerpDotN * raPerpDotN * bodyA.invInertia +
        rbPerpDotN * rbPerpDotN * bodyB.invInertia;

      const j = (-(1 + e) * contactVelocityMag) / denom / contactCount;

      impulseList[i] = Vector.scale(normal, j);
    }
    for (let i = 0; i < contactCount; i++) {
      const impulse = impulseList[i];
      const ra = raList[i];
      const rb = rbList[i];
      VectorE.sub(bodyA.linearVel, Vector.scale(impulse, bodyA.invMass));
      bodyA.angularVel -= Vector.cross(ra, impulse) * bodyA.invInertia;

      VectorE.add(bodyB.linearVel, Vector.scale(impulse, bodyB.invMass));
      bodyB.angularVel += Vector.cross(rb, impulse) * bodyB.invInertia;
    }
  }
  resolveCollisionWithRotationAndFriction({ bodyA, bodyB, normal, contactList }) {
    const contactCount = contactList.length;
    const e = Math.min(bodyA.restitution, bodyB.restitution);

    const sf = (bodyA.staticFri + bodyB.staticFri) * 0.5;
    const df = (bodyA.dynamicFri + bodyB.dynamicFri) * 0.5;

    const impulseList = new Array(contactCount).fill().map(() => Vector.zero());
    const raList = new Array(contactCount).fill().map(() => Vector.zero());
    const rbList = new Array(contactCount).fill().map(() => Vector.zero());
    const friImpulseList = new Array(contactCount).fill().map(() => Vector.zero());
    const jList = new Array(contactCount).fill().map(() => 0);

    //console.log(contactCount);
    for (let i = 0; i < contactCount; i++) {
      const ra = Vector.sub(contactList[i], bodyA.pos);
      const rb = Vector.sub(contactList[i], bodyB.pos);

      raList[i] = ra;
      rbList[i] = rb;

      const raPerp = Vector.normal(ra);
      const rbPerp = Vector.normal(rb);

      const angularLinearVelA = Vector.scale(raPerp, bodyA.angularVel);
      const angularLinearVelB = Vector.scale(rbPerp, bodyB.angularVel);

      const relativeVel = Vector.sub(
        Vector.add(bodyB.linearVel, angularLinearVelB),
        Vector.add(bodyA.linearVel, angularLinearVelA)
      );

      const contactVelocityMag = Vector.dot(relativeVel, normal);

      if (contactVelocityMag > 0) {
        continue;
      }

      const raPerpDotN = Vector.dot(raPerp, normal);
      const rbPerpDotN = Vector.dot(rbPerp, normal);

      const denom =
        bodyA.invMass +
        bodyB.invMass +
        raPerpDotN * raPerpDotN * bodyA.invInertia +
        rbPerpDotN * rbPerpDotN * bodyB.invInertia;

      const j = (-(1 + e) * contactVelocityMag) / denom / contactCount;

      jList[i] = j;

      impulseList[i] = Vector.scale(normal, j);
    }
    for (let i = 0; i < contactCount; i++) {
      const impulse = impulseList[i];
      const ra = raList[i];
      const rb = rbList[i];
      VectorE.sub(bodyA.linearVel, Vector.scale(impulse, bodyA.invMass));
      bodyA.angularVel -= Vector.cross(ra, impulse) * bodyA.invInertia;

      VectorE.add(bodyB.linearVel, Vector.scale(impulse, bodyB.invMass));
      bodyB.angularVel += Vector.cross(rb, impulse) * bodyB.invInertia;
    }
    for (let i = 0; i < contactCount; i++) {
      const ra = Vector.sub(contactList[i], bodyA.pos);
      const rb = Vector.sub(contactList[i], bodyB.pos);

      raList[i] = ra;
      rbList[i] = rb;

      const raPerp = Vector.normal(ra);
      const rbPerp = Vector.normal(rb);

      const angularLinearVelA = Vector.scale(raPerp, bodyA.angularVel);
      const angularLinearVelB = Vector.scale(rbPerp, bodyB.angularVel);

      const relativeVel = Vector.sub(
        Vector.add(bodyB.linearVel, angularLinearVelB),
        Vector.add(bodyA.linearVel, angularLinearVelA)
      );

      let tangent = Vector.sub(relativeVel, Vector.scale(normal, Vector.dot(relativeVel, normal)));

      if (Vector.nearlyEqual(tangent, Vector.zero())) {
        continue;
      } else {
        tangent = Vector.normalize(tangent);
      }

      const raPerpDotT = Vector.dot(raPerp, tangent);
      const rbPerpDotT = Vector.dot(rbPerp, tangent);

      const denom =
        bodyA.invMass +
        bodyB.invMass +
        raPerpDotT * raPerpDotT * bodyA.invInertia +
        rbPerpDotT * rbPerpDotT * bodyB.invInertia;

      const jt = -Vector.dot(relativeVel, tangent) / denom / contactCount;

      let friImpulse;
      const j = jList[i];

      if (Math.abs(jt) <= j * sf) {
        friImpulse = Vector.scale(tangent, jt);
      } else {
        friImpulse = Vector.scale(tangent, -j * df);
      }
      friImpulseList[i] = friImpulse;
    }
    for (let i = 0; i < contactCount; i++) {
      const friImpulse = friImpulseList[i];
      const ra = raList[i];
      const rb = rbList[i];

      VectorE.sub(bodyA.linearVel, Vector.scale(friImpulse, bodyA.invMass));
      bodyA.angularVel -= Vector.cross(ra, friImpulse) * bodyA.invInertia;

      VectorE.add(bodyB.linearVel, Vector.scale(friImpulse, bodyB.invMass));
      bodyB.angularVel += Vector.cross(rb, friImpulse) * bodyB.invInertia;
    }
  }

  update(dt) {
    let points = new Set();
    this.stickList.forEach((stick) => {
      points.add(stick.A);
      points.add(stick.B);
    });
    points = Array.from(points);
    const stickList = this.stickList;
    const bodyList = this.arrayBodyList;
    for (let k = 0; k < this.totalIterations; k++) {
      points.forEach((point) => {
        point.addForce(this.gravity);
        point.update(dt / this.totalIterations);
      });
      stickList.forEach((stick) => {
        stick.update(dt / this.totalIterations);
      });

      bodyList.forEach((body) => {
        body.addForce(this.gravity);
        body.update(dt / this.totalIterations);
      });

      // this.contactPairs = [];
      const collisions = [];
      const move = new Array(bodyList.length).fill().map(() => []);
      for (let i = 0; i < bodyList.length - 1; i++) {
        const bodyA = bodyList[i];
        const bodyA_aabb = bodyA.aabb;
        for (let j = i + 1; j < bodyList.length; j++) {
          const bodyB = bodyList[j];
          const bodyB_aabb = bodyB.aabb;
          if (bodyA.isStatic && bodyB.isStatic) continue;
          if (!Collisions.intersectAABBs(bodyA_aabb, bodyB_aabb)) continue;
          const info = Collisions.collide(bodyA, bodyB);
          if (info) {
            const { normal, depth } = info;
            if (bodyB.isStatic) {
              move[i].push(Vector.scale(normal, -depth));
            } else if (bodyA.isStatic) {
              move[j].push(Vector.scale(normal, depth));
            } else {
              move[i].push(Vector.scale(normal, -depth * 0.5));
              move[j].push(Vector.scale(normal, depth * 0.5));
            }
            collisions.push({ bodyA, bodyB, normal, depth });
            // if (bodyB.isStatic) {
            //   bodyList[i].move(Vector.scale(normal, -depth));
            // } else if (bodyA.isStatic) {
            //   bodyList[j].move(Vector.scale(normal, depth));
            // } else {
            //   bodyList[i].move(Vector.scale(normal, -depth / 2));
            //   bodyList[j].move(Vector.scale(normal, depth / 2));
            // }
            // // this.resolveCollisionBasic({ bodyA, bodyB, normal });
            // const contactList = Collisions.findContactPoints(bodyA, bodyB);
            // this.resolveCollisionWithRotation({ bodyA, bodyB, normal, contactList });
            // const manifold = new Manifold(bodyA, bodyB, normal, depth, contactList);
            // this.contactPairs.push(manifold);
          }
        }
      }
      move.forEach((moves, i) => {
        if (!moves.length) return;
        const avgMove = Vector.average(moves);
        bodyList[i].move(avgMove);
      });
      this.contactPairs = collisions.map(({ bodyA, bodyB, normal, depth }) => {
        const contactList = Collisions.findContactPoints(bodyA, bodyB);
        //this.resolveCollisionBasic({ bodyA, bodyB, normal });
        // this.resolveCollisionWithRotation({ bodyA, bodyB, normal, contactList });
        this.resolveCollisionWithRotationAndFriction({ bodyA, bodyB, normal, contactList });
        const manifold = new Manifold(bodyA, bodyB, normal, depth, contactList);
        return manifold;
      });
    }
  }
}
