(function(kontra, addEventListener) {
  var pointer;

  // save each object as they are rendered to determine which object
  // is on top when multiple objects are the target of an event.
  // we'll always use the last frame's object order so we know
  // the finalized order of all objects, otherwise an object could ask
  // if it's being hovered when it's rendered first even if other objects
  // would block it later in the render order
  var thisFrameRenderOrder = [];
  var lastFrameRenderOrder = [];

  var callbacks = {};
  var trackedObjects = [];
  var pressedButtons = {}

  var buttonMap = {
    0: 'left',
    1: 'middle',
    2: 'right'
  };

  addEventListener('mousedown', pointerDownHandler);
  addEventListener('touchstart', pointerDownHandler);
  addEventListener('mouseup', pointerUpHandler);
  addEventListener('touchend', pointerUpHandler);
  addEventListener('blur', blurEventHandler);

  // update ~once every two frames
  addEventListener('mousemove', throttle(mouseMoveHandler, 32));

  /**
   * Throttle a function to only fire once every time limit.
   * @see https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
   * @private
   *
   * @param {function} func - Function to throttle.
   * @param {number} limit - Milliseconds to throttle.
   */
  /* istanbul ignore next */
  function throttle(func, limit) {
    var lastFunc, lastRan;
    return function() {
      var context = this;
      var args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {;
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  }

  /**
   * Detection collision between a rectangle and a circle.
   * @see https://yal.cc/rectangle-circle-intersection-test/
   * @private
   *
   * @param {object} object - Object to check collision against.
   */
  function circleRectCollision(object) {
    var dx = pointer.x - Math.max(object.x, Math.min(pointer.x, object.x + object.width));
    var dy = pointer.y - Math.max(object.y, Math.min(pointer.y, object.y + object.height));
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
    // use the first frame
    var frameOrder = (lastFrameRenderOrder.length ? lastFrameRenderOrder : thisFrameRenderOrder);

    var length = frameOrder.length - 1;
    for (var i = length; i >= 0; i--) {
      var object = frameOrder[i];
      var collides;

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
    var button = buttonMap[e.button];
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
    var button = buttonMap[e.button];
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

    var clientX, clientY;

    if (e.type.indexOf('mouse') !== -1) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    else {
      // touchstart uses touches while touchend uses changedTouches
      // @see https://stackoverflow.com/questions/17957593/how-to-capture-touchend-coordinates
      clientX = (e.touches[0] || e.changedTouches[0]).clientX;
      clientY = (e.touches[0] || e.changedTouches[0]).clientY;
    }

    pointer.x = clientX - kontra.canvas.offsetLeft;
    pointer.y = clientY - kontra.canvas.offsetTop;

    var object;
    if (e.target === kontra.canvas) {
      object = getCurrentObject();
      if (object && object[event]) {
        object[event]();
      }
    }

    if (callbacks[event]) {
      callbacks[event](e, object);
    }
  }

  /**
   * Object for using the pointer.
   */
  var pointer = kontra.pointer = {
    x: 0,
    y: 0,
    radius: 5,  // arbitrary size

    /**
     * Register object to be tracked by pointer events.
     * @memberof kontra.pointer
     *
     * @param {object|object[]} objects - Object or objects to track.
     */
    track: function track(objects) {
      objects = (Array.isArray(objects) ? objects : [objects]);

      for (var i = 0, object; object = objects[i]; i++) {
        // override the objects render function to keep track of render order
        if (!object._render) {
          object._render = object.render;

          object.render = function() {
            thisFrameRenderOrder.push(this);
            if (this._render) this._render();
          };
        }

        if (trackedObjects.indexOf(object) === -1) {
          trackedObjects.push(object);
        }
      }
    },

    /**
     * Remove object from being tracked by pointer events.
     * @memberof kontra.pointer
     *
     * @param {object|object[]} objects - Object or objects to stop tracking.
     */
    untrack: function untrack(objects) {
      objects = (Array.isArray(objects) ? objects : [objects]);

      for (var i = 0, object; object = objects[i]; i++) {

        // restore original render function to no longer track render order
        object.render = object._render;
        object._render = null;

        var index = trackedObjects.indexOf(object);
        if (index !== -1) {

          // remove an object from the array without returning a new array
          // through Array#splice to avoid garbage collection of the old array
          // @see http://jsperf.com/object-pools-array-vs-loop
          for (var j = index; j <= trackedObjects.length - 2; j++) {
            trackedObjects[j] = trackedObjects[j+1];
          }

          trackedObjects.length--;
        }
      }
    },

    /**
     * Returns whether a tracked object is under the pointer.
     * @memberof kontra.pointer
     *
     * @param {object} object - Object to check
     *
     * @returns {boolean}
     */
    over: function onOver(object) {
      if (trackedObjects.indexOf(object) === -1) return false;

      return getCurrentObject() === object;
    },

    /**
     * Register a function to be called on pointer down.
     * @memberof kontra.pointer
     *
     * @param {function} callback - Function to execute
     */
    onDown: function onDown(callback) {
      callbacks.onDown = callback;
    },

    /**
     * Register a function to be called on pointer up.
     * @memberof kontra.pointer
     *
     * @param {function} callback - Function to execute
     */
    onUp: function onUp(callback) {
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
    pressed: function pointerPressed(button) {
      return !!pressedButtons[button]
    }
  };

  // reset object render order on every new frame
  kontra._tick = function() {
    lastFrameRenderOrder.length = 0;

    thisFrameRenderOrder.forEach(function(object) {
      lastFrameRenderOrder.push(object);
    });

    thisFrameRenderOrder.length = 0;
  };
})(kontra, window.addEventListener);