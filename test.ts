import * as kontra from './kontra.js';

// initialize the game and setup the canvas
let { canvas, context } = kontra.init();

// create a custom sprite
class CustomSprite extends kontra.Sprite.class {
  constructor(properties) {
    super(properties);

    // add custom properties
    this.color = 'green';
    this.altColor = 'red';
    this.width = 20;
    this.height = 40;
  }

  // create custom functions
  stripe() {
    let pos = 0;

    this.context.fillStyle = this.altColor;
    while (pos < this.height) {
      this.context.fillRect(this.x, this.y + pos, this.width, 10);

      pos += 20;
    }
  }

  render() {
    this.draw();  // draw the sprite normally
    this.stripe();
  }
}

let sprite = new CustomSprite({
  x: 290,
  y: 180
});

sprite.render();