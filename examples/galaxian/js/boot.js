let assets = [
  // images
  'ship.png',
  'bg.png',
  'bullet_enemy.png',
  'bullet.png',
  'enemy.png',

  // audios
  'explosion.mp3',
  'game_over.mp3',
  'kick_shock.mp3',
  'laser.mp3'
];

let canvas = kontra.getCanvas();
let context = kontra.getContext();

let loadingText = kontra.Text({
  color: '#FF7F00',
  text: 'Loading...',
  font: '18px Helvetica, sans-serif',
  anchor: { x: 0.5, y: 0.5 }
});

// create a progress bar
let loadingBar = kontra.Sprite({
  width: canvas.width / 2,
  height: 30,
  progress: 0,
  anchor: { x: 0.5, y: 0.5 },
  render() {
    context.strokeStyle = 'white';
    context.strokeRect(0, 0, this.width, this.height);

    context.fillStyle = 'green';
    context.fillRect(1, 1, this.width * (this.progress / assets.length) - 2, this.height - 2);
  }
});

let playButton = kontra.Button({
  padX: 15,
  padY: 15,
  anchor: { x: 0.5, y: 0.5 },

  // align center to the grid
  justifySelf: 'center',

  text: {
    text: 'Play',
    color: '#FF7F00',
    font: '28px Helvetica, sans-serif',
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
playButton.disable();

// let the grid manager handle auto placing the controls
let grid = kontra.Grid({
  x: canvas.width / 2,
  y: canvas.height / 2,

  // put extra space between the button and progress bar
  gapY: [0, 40],
  anchor: { x: 0.5, y: 0.5 },
  children: [loadingText, loadingBar, playButton]
});

let bootScene = kontra.Scene({
  id: 'boot',
  objects: [grid]
});

// set default asset paths
kontra.setImagePath('imgs/');
kontra.setAudioPath('sounds/');

// asset progress
kontra.on('assetLoaded', (asset, url) => {
  loadingBar.progress++;
});

// load assets
kontra.load(...assets).then(() => {
  kontra.emit('doneLoading');
  playButton.enable();
  playButton.focus();
});

export default bootScene;
