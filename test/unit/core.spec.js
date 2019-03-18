import * as core from '../../src/core.js'
import { on } from '../../src/events.js'

// --------------------------------------------------
// core
// --------------------------------------------------
describe('core', () => {

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    let canvas;

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
      canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      document.body.appendChild(canvas);

      core.init();

      expect(core.getCanvas()).to.equal(canvas);
    });

    it('should set the canvas when passed an id', () => {
      canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game';
      document.body.appendChild(canvas);

      core.init('game');

      expect(core.getCanvas()).to.equal(canvas);
    });

    it('should set the canvas when passed a canvas element', () => {
      canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      canvas.id = 'game2';
      document.body.appendChild(canvas);

      core.init(canvas);

      expect(core.getCanvas()).to.equal(canvas);
    });

    it('should set the context from the canvas', () => {
      expect(core.getContext().canvas).to.equal(canvas);
    });

    it('should emit the init event', done => {
      on('init', done);
      core.init();

      throw new Error('should not get here');
    });

  });

});