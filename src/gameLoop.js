import { noop } from './utils.js'
import { emit } from './events.js'
import kontra from './core.js'

function clear({context, canvas}) {
  if (context) {
    context.clearRect(0,0,canvas.width,canvas.height);
  }
}

/**
 * Game loop that updates and renders the game every frame.
 * @memberof kontra
 *
 * @param {object}   properties - Properties of the game loop.
 * @param {number}   [properties.fps=60] - Desired frame rate.
 * @param {boolean}  [properties.clearCanvas=true] - Clear the canvas every frame.
 * @param {function} properties.update - Function called to update the game.
 * @param {function} properties.render - Function called to render the game.
 */
function gameLoop({fps = 60, clearCanvas = true, update, render}) {
  // check for required functions
  // @if DEBUG
  if ( !(update && render) ) {
    throw Error('You must provide update() and render() functions');
  }
  // @endif

  // animation variables
  let accumulator = 0;
  let delta = 1E3 / fps;  // delta between performance.now timings (in ms)
  let step = 1 / fps;

  // let clear = (clearCanvas === false ?
  //             noop :
  //             function clear() {
  //               kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height);
  //             });
  // let clear = noop;
  let last, rAF, now, dt, loop;

  /**
   * Called every frame of the game loop.
   */
  function frame() {
    rAF = requestAnimationFrame(frame);

    now = performance.now();
    dt = now - last;
    last = now;

    // prevent updating the game with a very large dt if the game were to lose focus
    // and then regain focus later
    if (dt > 1E3) {
      return;
    }

    emit('tick');
    accumulator += dt;

    while (accumulator >= delta) {
      loop.update(step);

      accumulator -= delta;
    }

    clear(kontra);
    loop.render();
  }

  // game loop object
  loop = {
    update,
    render,
    isStopped: true,

    /**
     * Start the game loop.
     * @memberof kontra.gameLoop
     */
    start() {
      last = performance.now();
      this.isStopped = false;
      requestAnimationFrame(frame);
    },

    /**
     * Stop the game loop.
     */
    stop() {
      this.isStopped = true;
      cancelAnimationFrame(rAF);
    },

    // expose properties for testing
    // @if DEBUG
    _frame: frame,
    set _last(value) {
      last = value;
    }
    // @endif
  };

  return loop;
};

export default gameLoop;