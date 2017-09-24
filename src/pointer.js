(function() {
  var size, clientX, clientY;

  var addEventListener = window.addEventListener;
  addEventListener('mousedown', pointerDownHandler);
  addEventListener('touchstart', pointerDownHandler);
  addEventListener('mouseup', pointerUpHandler);
  addEventListener('touchend', pointerUpHandler);
  addEventListener('blur', blurEventHandler);

  /**
   *
   */
  function pointerDownHandler(e) {
    if (e.type === 'mousedown') {
      size = 2;
      clientX = e.clientX;
      clientY = e.clientY;
    }
    else {
      size = 22px;  // recommended tap target size = 44px
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
  }

  /**
   * Reset pressed keys.
   * @private
   *
   * @param {Event} e
   */
  function blurEventHandler(e) {

  }

  /**
   * Object for using the pointer.
   */
  kontra.pointer = {

  };

  // modify sprite to add event listeners
  // by using calling one of these events it will add the sprite to a list of
  // objects to keep track of for eventing

  kontra.sprite.prototype.onPointerOver = function(fn) {
    // use the sprites canvas to determine offset
    sprite.context.canvas
  };

  kontra.sprite.prototype.onPointerOut = function(fn) {

  };

  kontra.sprite.prototype.onPointerDown = function(fn) {

  };

  kontra.sprite.prototype.onPointerUp = function(fn) {

  };
})();