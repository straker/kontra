import Vector from './vector.js';

/**
 * This is a private class that is used just to help make the GameObject class more manageable and smaller.
 *
 * It maintains everything that can be changed in the update function:
 * position
 * velocity
 * acceleration
 * ttl
 */

class Updatable {
  constructor(properties) {
    return this.init(properties);
  }

  init(properties = {}) {

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    this.position = Vector();

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_VELOCITY
    this.velocity = Vector();
    // @endif

    // @ifdef GAMEOBJECT_ACCELERATION
    this.acceleration = Vector();
    // @endif

    // @ifdef GAMEOBJECT_TTL
    this.ttl = Infinity;
    // @endif

    // add all properties to the object, overriding any defaults
    Object.assign(this, properties);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  set x(value) {
    this.position.x = value;
  }

  set y(value) {
    this.position.y = value;
  }

  update(dt) {
    // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
    this.advance(dt);
    // @endif
  }

  advance(dt) {
    // @ifdef GAMEOBJECT_VELOCITY
    // @ifdef GAMEOBJECT_ACCELERATION
    this.velocity = this.velocity.add(this.acceleration);
    // @endif
    // @endif

    // @ifdef GAMEOBJECT_VELOCITY
    this.position = this.position.add(this.velocity);
    // @endif

    // @ifdef GAMEOBJECT_TTL
    this.ttl--;
    // @endif
  }

  // --------------------------------------------------
  // velocity
  // --------------------------------------------------

  // @ifdef GAMEOBJECT_VELOCITY
  get dx() {
    return this.velocity.x;
  }

  get dy() {
    return this.velocity.y;
  }

  set dx(value) {
    this.velocity.x = value;
  }

  set dy(value) {
    this.velocity.y = value;
  }
  // @endif

  // --------------------------------------------------
  // acceleration
  // --------------------------------------------------

  // @ifdef GAMEOBJECT_ACCELERATION
  get ddx() {
    return this.acceleration.x;
  }

  get ddy() {
    return this.acceleration.y;
  }

  set ddx(value) {
    this.acceleration.x = value;
  }

  set ddy(value) {
    this.acceleration.y = value;
  }
  // @endif

  // --------------------------------------------------
  // ttl
  // --------------------------------------------------

  // @ifdef GAMEOBJECT_TTL
  isAlive() {
    return this.ttl > 0;
  }
  // @endif
}

export default Updatable;