let canvas = kontra.getCanvas();

let startButton = kontra.Button({
  color: 'white',
  font: '30px Monospace',
  anchor: { x: 0.5, y: 0.5 },
  text: 'Start',
  x: canvas.width / 2,
  y: canvas.height / 2,
  onFocus() {
    this.color = 'green';
    canvas.style.cursor = 'pointer';
  },
  onBlur() {
    this.color = 'white';
    canvas.style.cursor = 'initial';
  },
  onDown() {
    this.color = 'red';
  },
  onUp() {
    this.color = this.focused ? 'green' : 'white';
    kontra.emit('navigate', this.text);
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

menuScene.add(startButton);

export default menuScene;