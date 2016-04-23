// --------------------------------------------------
// kontra.init
// --------------------------------------------------
describe('kontra.init', function() {
  var canvas;

  it('should log an error if no canvas element exists', function() {
    sinon.stub(kontra, 'logError', kontra.noop);

    kontra.init();

    expect(kontra.logError.called).to.be.ok;

    kontra.logError.restore();
  });

  it('should select the first canvas element on the page when no query parameters are passed', function() {
    canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    document.body.appendChild(canvas);

    kontra.init();

    expect(kontra.canvas).to.equal(canvas);
  });

  it('should set kontra.context to the canvas context', function() {
    expect(kontra.context.canvas).to.equal(canvas);
  });

  it('should set the game width and height to that of the canvas', function() {
    expect(kontra.game.width).to.equal(canvas.width);
    expect(kontra.game.height).to.equal(canvas.height);
  });

  it('should select a canvas that matches the passed id', function() {
    var c = document.createElement('canvas');
    c.width = 600;
    c.height = 600;
    c.id = 'game';
    document.body.appendChild(c);

    kontra.init({canvas: 'game'});

    expect(kontra.canvas).to.equal(c);
  });

  it('should set the canvas when passed a canvas element', function() {
    var c = document.createElement('canvas');
    c.width = 600;
    c.height = 600;
    c.id = 'game2';
    document.body.appendChild(c);

    kontra.init({canvas: c});

    expect(kontra.canvas).to.equal(c);
  });

});





// --------------------------------------------------
// kontra.isString
// --------------------------------------------------
describe('kontra.isString', function() {

  it('should correctly identify a string', function() {
    expect(kontra.isString(1)).to.be.false;
    expect(kontra.isString(true)).to.be.false;
    expect(kontra.isString({})).to.be.false;
    expect(kontra.isString(null)).to.be.false;
    expect(kontra.isString(undefined)).to.be.false;
    expect(kontra.isString(new Image())).to.be.false;
    expect(kontra.isString(document.createElement('img'))).to.be.false;
    expect(kontra.isString(document.createElement('canvas'))).to.be.false;
    expect(kontra.isString(function(){})).to.be.false;
    expect(kontra.isString([])).to.be.false;

    expect(kontra.isString('')).to.be.true;
  });

});





// --------------------------------------------------
// kontra.isNumber
// --------------------------------------------------
describe('kontra.isNumber', function() {

  it('should correctly identify a number', function() {
    expect(kontra.isNumber(true)).to.be.false;
    expect(kontra.isNumber({})).to.be.false;
    expect(kontra.isNumber(null)).to.be.false;
    expect(kontra.isNumber(undefined)).to.be.false;
    expect(kontra.isNumber([])).to.be.false;
    expect(kontra.isNumber(new Image())).to.be.false;
    expect(kontra.isNumber(document.createElement('img'))).to.be.false;
    expect(kontra.isNumber(document.createElement('canvas'))).to.be.false;
    expect(kontra.isNumber(function(){})).to.be.false;
    expect(kontra.isNumber('')).to.be.false;

    expect(kontra.isNumber(1)).to.be.true;
  });

});





// --------------------------------------------------
// kontra.isImage
// --------------------------------------------------
describe('kontra.isImage', function() {

  it('should correctly identify an image element', function() {
    expect(kontra.isImage(true)).to.be.false;
    expect(kontra.isImage({})).to.be.false;
    expect(kontra.isImage(null)).to.be.false;
    expect(kontra.isImage(undefined)).to.be.false;
    expect(kontra.isImage([])).to.be.false;
    expect(kontra.isImage('')).to.be.false;
    expect(kontra.isImage(1)).to.be.false;
    expect(kontra.isImage(document.createElement('canvas'))).to.be.false;
    expect(kontra.isImage(function(){})).to.be.false;

    expect(kontra.isImage(new Image())).to.be.true;
    expect(kontra.isImage(document.createElement('img'))).to.be.true;
  });

});





// --------------------------------------------------
// kontra.isCanvas
// --------------------------------------------------
describe('kontra.isCanvas', function() {

  it('should correctly identify a canvas element', function() {
    expect(kontra.isCanvas(true)).to.be.false;
    expect(kontra.isCanvas({})).to.be.false;
    expect(kontra.isCanvas(null)).to.be.false;
    expect(kontra.isCanvas(undefined)).to.be.false;
    expect(kontra.isCanvas([])).to.be.false;
    expect(kontra.isCanvas('')).to.be.false;
    expect(kontra.isCanvas(1)).to.be.false;
    expect(kontra.isCanvas(new Image())).to.be.false;
    expect(kontra.isCanvas(document.createElement('img'))).to.be.false;
    expect(kontra.isCanvas(function(){})).to.be.false;

    expect(kontra.isCanvas(document.createElement('canvas'))).to.be.true;
  });

});