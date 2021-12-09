import * as core from '../../src/core.js';
import { on } from '../../src/events.js';

// --------------------------------------------------
// core
// --------------------------------------------------
describe('core', () => {
  // ensure no canvas exists since these tests set it up
  beforeEach(() => {
    document
      .querySelectorAll('canvas')
      .forEach(canvas => canvas.remove());
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should export api', () => {
      expect(core.init).to.be.an('function');
      expect(core.getCanvas).to.be.an('function');
      expect(core.getContext).to.be.an('function');
    });

    it('should log an error if no canvas element exists', () => {
      function func() {
        core.init();
      }

      expect(func).to.throw();
    });

    it('should set the canvas when passed no arguments', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      document.body.appendChild(canvas);

      core.init();

      expect(core.getCanvas()).to.equal(canvas);
    });

    it('should set the canvas when passed an id', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game';
      document.body.appendChild(canvas);

      core.init('game');

      expect(core.getCanvas()).to.equal(canvas);
    });

    it('should set the canvas when passed a canvas element', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      core.init(canvas);

      expect(core.getCanvas()).to.equal(canvas);
    });

    it('should set the context from the canvas', () => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      core.init(canvas);

      expect(core.getContext().canvas).to.equal(canvas);
    });

    it('should emit the init event', done => {
      let canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      on('init', done);
      core.init();

      throw new Error('should not get here');
    });

    it('should return the canvas and context', () => {
      let c = document.createElement('canvas');
      c.width = 600;
      c.height = 600;
      c.id = 'game2';
      document.body.appendChild(c);

      let { canvas, context } = core.init();

      expect(canvas).to.equal(c);
      expect(context).to.equal(c.getContext('2d'));
    });

    it('should allow contextless option', () => {
      let { canvas, context } = core.init(null, {
        contextless: true
      });

      expect(canvas._proxy).to.be.true;
      expect(context._proxy).to.be.true;

      function fn() {
        canvas.getContext('2d');
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(0, 0);
        context.globalAlpha = 10;
        context.restore();
        context.doesNotExist();
      }

      expect(fn).to.not.throw();
    });
  });
});
