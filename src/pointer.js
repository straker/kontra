(function() {
  let pointer;

  // save each object as they are rendered to determine which object
  // is on top when multiple objects are the target of an event.
  // we'll always use the last frame's object order so we know
  // the finalized order of all objects, otherwise an object could ask
  // if it's being hovered when it's rendered first even if other objects
  // would block it later in the render order
  let thisFrameRenderOrder = [];
  let lastFrameRenderOrder = [];

  let callbacks = {};
  let trackedObjects = [];
  let pressedButtons = {};

  let buttonMap = {
    0: 'left',
    1: 'middle',
    2: 'right'
  };

  /**
   * Detection collision between a rectangle and a circle.
   * @see https://yal.cc/rectangle-circle-intersection-test/
   * @private
   *
   * @param {object} object - Object to check collision against.
   */
  function circleRectCollision(object) {
    let x = object.x;
    let y = object.y;
    if (object.anchor) {
      x -= object.width * object.anchor.x;
      y -= object.height * object.anchor.y;
    }

    let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + object.width));
    let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + object.height));
    return (dx * dx + dy * dy) < (pointer.radius * pointer.radius);
  }

  /**
   * Get the first on top object that the pointer collides with.
   * @private
   *
   * @returns {object} First object to collide with the pointer.
   */
  function getCurrentObject() {

    // if pointer events are required on the very first frame or without a game loop,
    // use the current frame order array
    let frameOrder = (lastFrameRenderOrder.length ? lastFrameRenderOrder : thisFrameRenderOrder);
    let length = frameOrder.length - 1;
    let object, collides;

    for (let i = length; i >= 0; i--) {
      object = frameOrder[i];

      if (object.collidesWithPointer) {
        collides = object.collidesWithPointer(pointer);
      }
      else {
        collides = circleRectCollision(object);
      }

      if (collides) {
        return object;
      }
    }
  }

  /**
   * Execute the onDown callback for an object.
   * @private
   *
   * @param {Event} e
   */
  function pointerDownHandler(e) {

    // touchstart should be treated like a left mouse button
    let button = e.button !== undefined ? buttonMap[e.button] : 'left';
    pressedButtons[button] = true;
    pointerHandler(e, 'onDown');
  }

  /**
   * Execute the onUp callback for an object.
   * @private
   *
   * @param {Event} e
   */
  function pointerUpHandler(e) {
    let button = e.button !== undefined ? buttonMap[e.button] : 'left';
    pressedButtons[button] = false;
    pointerHandler(e, 'onUp');
  }

  /**
   * Track the position of the mouse.
   * @private
   *
   * @param {Event} e
   */
  function mouseMoveHandler(e) {
    pointerHandler(e, 'onOver');
  }

  /**
   * Reset pressed buttons.
   * @private
   *
   * @param {Event} e
   */
  function blurEventHandler(e) {
    pressedButtons = {};
  }

  /**
   * Find the first object for the event and execute it's callback function
   * @private
   *
   * @param {Event} e
   * @param {string} event - Which event was called.
   */
  function pointerHandler(e, event) {
    if (!kontra.canvas) return;

    let pageX, pageY;

    if (e.type.indexOf('mouse') !== -1) {
      pageX = e.pageX;
      pageY = e.pageY;
    }
    else {
      // touchstart uses touches while touchend uses changedTouches
      // @see https://stackoverflow.com/questions/17957593/how-to-capture-touchend-coordinates
      pageX = (e.touches[0] || e.changedTouches[0]).pageX;
      pageY = (e.touches[0] || e.changedTouches[0]).pageY;
    }

    let x = pageX - kontra.canvas.offsetLeft;
    let y = pageY - kontra.canvas.offsetTop;
    let el = kontra.canvas;

    while ( (el = el.offsetParent) ) {
      x -= el.offsetLeft;
      y -= el.offsetTop;
    }

    // take into account the canvas scale
    let scale = kontra.canvas.offsetHeight / kontra.canvas.height;
    x /= scale;
    y /= scale;

    pointer.x = x;
    pointer.y = y;

    let object;
    if (e.target === kontra.canvas) {
      e.preventDefault();
      object = getCurrentObject();
      if (object && object[event]) {
        object[event](e);
      }
    }

    if (callbacks[event]) {
      callbacks[event](e, object);
    }
  }

  /**
   * Object for using the pointer.
   */
  pointer = kontra.pointer = {
    x: 0,
    y: 0,
    radius: 5,  // arbitrary size

    /**
     * Register object to be tracked by pointer events.
     * @memberof kontra.pointer
     *
     * @param {object|object[]} objects - Object or objects to track.
     */
    track(objects) {
      [].concat(objects).map(function(object) {

        // override the objects render function to keep track of render order
        if (!object._r) {
          object._r = object.render;

          object.render = function() {
            thisFrameRenderOrder.push(this);
            this._r();
          };

          trackedObjects.push(object);
        }
      });
    },

    /**
     * Remove object from being tracked by pointer events.
     * @memberof kontra.pointer
     *
     * @param {object|object[]} objects - Object or objects to stop tracking.
     */
    untrack(objects, undefined) {
      [].concat(objects).map(function(object) {

        // restore original render function to no longer track render order
        object.render = object._r;
        object._r = undefined;

        let index = trackedObjects.indexOf(object);
        if (index !== -1) {
          trackedObjects.splice(index, 1);
        }
      })
    },

    /**
     * Returns whether a tracked object is under the pointer.
     * @memberof kontra.pointer
     *
     * @param {object} object - Object to check
     *
     * @returns {boolean}
     */
    over(object) {
      if (trackedObjects.indexOf(object) === -1) return false;

      return getCurrentObject() === object;
    },

    /**
     * Register a function to be called on pointer down.
     * @memberof kontra.pointer
     *
     * @param {function} callback - Function to execute
     */
    onDown(callback) {
      callbacks.onDown = callback;
    },

    /**
     * Register a function to be called on pointer up.
     * @memberof kontra.pointer
     *
     * @param {function} callback - Function to execute
     */
    onUp(callback) {
      callbacks.onUp = callback;
    },

    /**
     * Returns whether the button is pressed.
     * @memberof kontra.pointer
     *
     * @param {string} button - Button to check for press.
     *
     * @returns {boolean}
     */
    pressed(button) {
      return !!pressedButtons[button]
    }
  };

  // reset object render order on every new frame
  kontra._tick = function() {
    lastFrameRenderOrder.length = 0;

    thisFrameRenderOrder.map(function(object) {
      lastFrameRenderOrder.push(object);
    });

    thisFrameRenderOrder.length = 0;
  };

  // After the canvas is chosen, add events to it
  kontra._init = function() {
    kontra.canvas.addEventListener('mousedown', pointerDownHandler);
    kontra.canvas.addEventListener('touchstart', pointerDownHandler);
    kontra.canvas.addEventListener('mouseup', pointerUpHandler);
    kontra.canvas.addEventListener('touchend', pointerUpHandler);
    kontra.canvas.addEventListener('blur', blurEventHandler);
    kontra.canvas.addEventListener('mousemove', mouseMoveHandler);
    kontra.canvas.addEventListener('touchmove', mouseMoveHandler);
  }
})();
