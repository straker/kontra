let canvas = kontra.getCanvas();

let startButton = kontra.Button({
  text: {
    color: 'white',
    font: '30px Monospace',
    text: 'Start',
    anchor: { x: 0.5, y: 0.5 }
  },
  anchor: { x: 0.5, y: 0.5 },
  x: canvas.width / 2,
  y: canvas.height / 2,
  onUp() {
    kontra.emit('navigate', this.text);
  },
  render() {
    this.draw();

    if (this.focused || this.hovered) {
      this.textNode.color = 'red';
    } else {
      this.textNode.color = 'white';
    }
  }
});

kontra.track(startButton);

let menuScene = kontra.Scene({
  id: 'menu',
  onShow() {
    startButton.text = 'Resume';
    startButton.focus();
  },
  focus() {
    startButton.focus();
  }
});

menuScene.addChild(startButton);

export default menuScene;
