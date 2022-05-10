class Actor {
  constructor({ maxspeed, maxforce, actorBehavior }) {
    this.position = createVector(windowWidth / 2, windowHeight / 2);
    this.velocity = createVector();
    this.acceleration = createVector();

    this.maxspeed = maxspeed;
    this.maxforce = maxforce;
    this.actorBehavior = actorBehavior;
  }

  seek(target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    this.applyForce(steer);
  }

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  arrive(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    let d = desired.mag();
    // Scale with arbitrary damping within 100 pixels
    if (d < 100) {
      var m = map(d, 0, 100, 0, this.maxspeed);
      desired.setMag(m);
    } else {
      desired.setMag(this.maxspeed);
    }

    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    this.applyForce(steer);
  }

  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  update({ target }) {
    if (this.actorBehavior == "seek") {
      this.seek(target);
    } else if (this.actorBehavior == "arrive") {
      this.arrive(target);
    }

    // BASIC PHYSICS
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  }

  draw() {
    fill(100);
    circle(this.position.x, this.position.y, 20);
  }
}
