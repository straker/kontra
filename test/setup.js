import { init } from '../src/core.js'

// ensure canvas exists before each test
function setup() {
  let canvas = document.createElement('canvas');
  canvas.id = 'mainCanvas';
  canvas.width = canvas.height = 600;
  document.body.appendChild(canvas);
  init(canvas);
}

beforeEach(() => {
  setup();
});

afterEach(() => {
  document.querySelectorAll('canvas').forEach(canvas => canvas.remove());
  document.querySelectorAll('[data-kontra]').forEach(node => node.remove());
});

setup();