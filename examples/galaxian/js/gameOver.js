let canvas = kontra.getCanvas();
let context = kontra.getContext();

let gameOverText = kontra.Text({
  color: '#FF7F00',
  text: 'Game Over',
  font: '28px Helvetica, sans-serif',
  anchor: { x: 0.5, y: 0.5 }
});

let restartButton = kontra.Button({
  padX: 15,
  padY: 15,
  anchor: { x: 0.5, y: 0.5 },

  // align center to the grid
  justifySelf: 'center',

  text: {
    text: 'Restart',
    color: '#FF7F00',
    font: '18px Helvetica, sans-serif',
    anchor: { x: 0.5, y: 0.5 }
  },

  render() {
    if (this.disabled) {
      this.textNode.color = '#999';
      return;
    }

    context.strokeStyle = 'white';
    context.strokeRect(1, 1, this.width - 2, this.height - 2);

    if (this.pressed) {
      this.textNode.color = 'white';
    } else if (this.focused || this.hovered) {
      this.textNode.color = '#62a2f9';
      canvas.style.cursor = 'pointer';
    } else {
      this.textNode.color = '#FF7F00';
      canvas.style.cursor = 'initial';
    }
  },

  onUp() {
    kontra.emit('startGame');
  }
});

// let the grid manager handle auto placing the controls
let grid = kontra.Grid({
  x: canvas.width / 2,
  y: canvas.height / 2,

  // put extra space between the button and text
  gapY: 40,
  anchor: { x: 0.5, y: 0.5 },
  children: [gameOverText, restartButton]
});

let gameOverScene = kontra.Scene({
  id: 'gameOver',
  objects: [grid]
});
export default gameOverScene;
