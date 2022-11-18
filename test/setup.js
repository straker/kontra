// permutations script prepends this file with the test file
// so we need to rename this import so other files that import
// it don't import by the same name
import { init as initCore } from '../src/core.js';

// ensure canvas exists before each test
function setup() {
  let canvas = document.createElement('canvas');
  canvas.id = 'mainCanvas';
  canvas.width = canvas.height = 600;
  document.body.appendChild(canvas);
  initCore(canvas);
}

beforeEach(() => {
  setup();
});

afterEach(() => {
  document
    .querySelectorAll('canvas')
    .forEach(canvas => canvas.remove());
  document
    .querySelectorAll('[data-kontra]')
    .forEach(node => node.remove());
});
