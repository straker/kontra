// permutations script prepends this file with the test file
// so we need to rename this import so other files that import
// it don't import by the same name
import {
  init as initCore,
  _reset as resetCore
} from '../src/core.js';
import { _reset as resetAssets } from '../src/assets.js';
import { _reset as resetEvents } from '../src/events.js';
import { _reset as resetGesture } from '../src/gesture.js';
import { _reset as seedReset } from '../src/random.js';

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

  sinon.restore();

  resetAssets();
  resetCore();
  resetEvents();
  resetGesture();
  seedReset();
});
