(function(kontra) {
  var size, clientX, clientY;

  // save each sprite as they are rendered to determine which sprite
  // is on top when multiple sprites are the target of an event
  var spriteOrder = [];

  var events = {
    onOver: [],
    onOut: [],
    onDown: [],
    onUp: []
  };

  var addEventListener = window.addEventListener;
  addEventListener('mousedown', pointerDownHandler);
  addEventListener('touchstart', pointerDownHandler);
  // addEventListener('mouseup', pointerUpHandler);
  // addEventListener('touchend', pointerUpHandler);
  addEventListener('mousemove', debounce(pointerOverHandler, 25));
  // addEventListener('mousemove', debounce(pointerOutHandler, 50));

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  function pointerDownHandler(e) {
    pointerHandler(e, 'onDown');
  }

  function pointerOverHandler(e) {
    pointerHandler(e, 'onOver');
  }

  /**
   *
   */
  function pointerHandler(e, eventName) {
    if (e.target !== kontra.canvas) return;

    if (e.type.indexOf('mouse') !== -1) {
      size = 5;
      clientX = e.clientX;
      clientY = e.clientY;
    }
    else {
      size = 10;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    var pointer = {
      clientX: clientX,
      clientY: clientY,
      type: e.type,
      x: clientX - kontra.canvas.offsetLeft - size / 2,
      y: clientY - kontra.canvas.offsetTop - size / 2,
      size: size
    };

    var collisions = [];

    events[eventName].forEach(function(event) {
      var collisionFn = event.collisionFn || collidesWith;

      if (collisionFn(pointer, event.sprite) && event.sprite.isAlive) {
        collisions.push(event);
      }
    });

    // if only one sprite was clicked we can just call the callback for it
    if (collisions.length === 1) {
      collisions[0].callback(pointer);
    }

    // otherwise we need to determine which sprite is on top
    else if (collisions.length > 1) {
      var highestIndex = -Infinity;
      var collisionIndex;
      collisions.forEach(function(event, i) {
        var index = spriteOrder.indexOf(event.sprite);
        if (index > highestIndex) {
          highestIndex = index;
          collisionIndex = i;
        }
      });

      collisions[collisionIndex].callback(pointer);
    }
  }

  function collidesWith(pointer, sprite) {
    return pointer.x < sprite.x + sprite.width &&
           pointer.x + pointer.size > sprite.x &&
           pointer.y < sprite.y + sprite.height &&
           pointer.y + pointer.size > sprite.y;
  }

  /**
   * Object for using the pointer.
   */
  kontra.pointer = {};

  /**
   * Add a callback for a pointer event.
   * @memberof kontra.pointer
   *
   * @param {kontra.sprite} sprite - sprite to add the event to
   * @param {function} callback - callback function
   * @param {function} [collisionfn] - function to determine how the pointer collides with the sprite. Defaults to a simple AABB collision test between two rectangles. Will be passed the pointer event.
   */
  ['onOver', 'onOut', 'onDown', 'onUp'].forEach(function(eventName) {
    kontra.pointer[eventName] = function(sprite, callback, collisionFn) {
      events[eventName].push({sprite: sprite, callback: callback, collisionFn: collisionFn});

      // keep track of the order in which sprites are rendered
      if (!sprite._render) {
        sprite._render = sprite.render;

        sprite.render = function() {
          spriteOrder.push(this);
          this._render();
        };
      }
    };
  });

  // reset sprite order on every new frame
  kontra._tick = function() {
    spriteOrder.length = 0;
  };
})(kontra);