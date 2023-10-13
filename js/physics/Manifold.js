export class Manifold {
  constructor(bodyA, bodyB, normal, depth, contactList) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.normal = normal;
    this.depth = depth;
    this.contactList = contactList;
  }
}
