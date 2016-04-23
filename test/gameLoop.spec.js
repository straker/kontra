// --------------------------------------------------
// kontra.timestamp
// --------------------------------------------------
describe('kontra.timestamp', function() {

  it('should return a timestamp function that returns a number', function() {
    expect(kontra.timestamp).to.exist
    expect(typeof kontra.timestamp).to.equal('function');
    expect(typeof kontra.timestamp()).to.equal('number');
  });

});





// --------------------------------------------------
// kontra.gameLoop.init
// --------------------------------------------------
describe('kontra.gameLoop.init', function() {

  it('should log an error if not passed required functions', function() {
    sinon.stub(kontra, 'logError', kontra.noop);

    kontra.gameLoop();

    expect(kontra.logError.called).to.be.ok;

    kontra.logError.restore();
  });

  it('should let you prevent clearing the canvas', function() {
    var loop = kontra.gameLoop({
      update: kontra.noop,
      render: kontra.noop,
      clearCanvas: false
    });

    expect(loop._clearCanvas).to.equal(kontra.noop);
  });

});





// --------------------------------------------------
// kontra.gameLoop.start
// --------------------------------------------------
describe('kontra.gameLoop.start', function() {
  var requestAnimFrame;

  it('should call requestAnimationFrame', function() {
    requestAnimFrame = sinon.stub(window, 'requestAnimationFrame', kontra.noop);

    var loop = kontra.gameLoop({
      update: kontra.noop,
      render: kontra.noop
    })

    loop.start();

    expect(window.requestAnimationFrame.called).to.be.ok;

    window.requestAnimationFrame.restore();
  });

});





// --------------------------------------------------
// kontra.gameLoop.stop
// --------------------------------------------------
describe('kontra.gameLoop.stop', function() {
  var requestAnimFrame;

  it('should call cancelAnimationFrame', function() {
    requestAnimFrame = sinon.stub(window, 'cancelAnimationFrame', kontra.noop);

    var loop = kontra.gameLoop({
      update: kontra.noop,
      render: kontra.noop
    })

    loop.stop();

    expect(window.cancelAnimationFrame.called).to.be.ok;

    window.cancelAnimationFrame.restore();
  });

});





// --------------------------------------------------
// kontra.gameLoop._frame
// --------------------------------------------------
describe('kontra.gameLoop._frame', function() {

  it('should call the update function and pass it dt', function() {
    requestAnimFrame = sinon.stub(window, 'requestAnimationFrame', kontra.noop);

    var count = 0;
    var dt = 0;

    var loop = kontra.gameLoop({
      update: function(time) {
        count++;
        dt = time;
      },
      render: kontra.noop
    });

    // fake the first call to requestAnimationFrame, waiting 1 frame
    loop.start();
    loop._last -= loop._delta;
    loop._frame();

    expect(count).to.equal(1);
    expect(dt).to.be.above(0);

    window.requestAnimationFrame.restore();
  });

  it('should call the render function', function() {
    requestAnimFrame = sinon.stub(window, 'requestAnimationFrame', kontra.noop);

    var count = 0;

    var loop = kontra.gameLoop({
      update: kontra.noop,
      render: function() {
        count++;
      }
    });

    // fake the first call to requestAnimationFrame
    loop.start();
    loop._frame();

    expect(count).to.equal(1);

    window.requestAnimationFrame.restore();
  });

  it('should exit early if time elapsed is greater than 1000ms', function() {
    requestAnimFrame = sinon.stub(window, 'requestAnimationFrame', kontra.noop);

    var count = 0;

    var loop = kontra.gameLoop({
      update: function(time) {
        count++;
      },
      render: function() {
        count++;
      }
    });

    // fake the first call to requestAnimationFrame
    loop.start();
    loop._last -= 1500;
    loop._frame();

    expect(count).to.equal(0);

    window.requestAnimationFrame.restore();
  });

  it('should make multiple calls to the update function if enough time has elapsed', function() {
    requestAnimFrame = sinon.stub(window, 'requestAnimationFrame', kontra.noop);

    var count = 0;

    var loop = kontra.gameLoop({
      update: function(time) {
        count++;
      },
      render: kontra.noop
    });

    // fake the first call to requestAnimationFrame
    loop.start();
    loop._last -= loop._delta * 2.5;
    loop._frame();

    expect(count).to.equal(2);

    window.requestAnimationFrame.restore();
  });

});