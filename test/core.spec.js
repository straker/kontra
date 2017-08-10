// --------------------------------------------------
// kontra
// --------------------------------------------------
describe('kontra', function() {

  // --------------------------------------------------
  // kontra.init
  // --------------------------------------------------
  describe('init', function() {
    var canvas;

    it('should log an error if no canvas element exists', function() {
      expect(kontra.init).to.throw();
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

    it('should select a canvas that matches the passed id', function() {
      var c = document.createElement('canvas');
      c.width = 600;
      c.height = 600;
      c.id = 'game';
      document.body.appendChild(c);

      kontra.init('game');

      expect(kontra.canvas).to.equal(c);
    });

    it('should set the canvas when passed a canvas element', function() {
      var c = document.createElement('canvas');
      c.width = 600;
      c.height = 600;
      c.id = 'game2';
      document.body.appendChild(c);

      kontra.init(c);

      expect(kontra.canvas).to.equal(c);
    });

  });





  // --------------------------------------------------
  // kontra._isString
  // --------------------------------------------------
  describe('_isString', function() {

    it('should correctly identify a string', function() {
      expect(kontra._isString(1)).to.be.false;
      expect(kontra._isString(true)).to.be.false;
      expect(kontra._isString({})).to.be.false;
      expect(kontra._isString(null)).to.be.false;
      expect(kontra._isString(undefined)).to.be.false;
      expect(kontra._isString(new Image())).to.be.false;
      expect(kontra._isString(document.createElement('img'))).to.be.false;
      expect(kontra._isString(document.createElement('canvas'))).to.be.false;
      expect(kontra._isString(function(){})).to.be.false;
      expect(kontra._isString([])).to.be.false;

      expect(kontra._isString('')).to.be.true;
    });

  });





  // --------------------------------------------------
  // kontra._isNumber
  // --------------------------------------------------
  describe('_isNumber', function() {

    it('should correctly identify a number', function() {
      expect(kontra._isNumber(true)).to.be.false;
      expect(kontra._isNumber({})).to.be.false;
      expect(kontra._isNumber(null)).to.be.false;
      expect(kontra._isNumber(undefined)).to.be.false;
      expect(kontra._isNumber([])).to.be.false;
      expect(kontra._isNumber(new Image())).to.be.false;
      expect(kontra._isNumber(document.createElement('img'))).to.be.false;
      expect(kontra._isNumber(document.createElement('canvas'))).to.be.false;
      expect(kontra._isNumber(function(){})).to.be.false;
      expect(kontra._isNumber('')).to.be.false;

      expect(kontra._isNumber(1)).to.be.true;
    });

  });





  // --------------------------------------------------
  // kontra._isImage
  // --------------------------------------------------
  describe('_isImage', function() {

    it('should correctly identify an image element', function() {
      expect(kontra._isImage(true)).to.be.false;
      expect(kontra._isImage({})).to.be.false;
      expect(kontra._isImage(null)).to.be.false;
      expect(kontra._isImage(undefined)).to.be.false;
      expect(kontra._isImage([])).to.be.false;
      expect(kontra._isImage('')).to.be.false;
      expect(kontra._isImage(1)).to.be.false;
      expect(kontra._isImage(function(){})).to.be.false;

      expect(kontra._isImage(new Image())).to.be.true;
      expect(kontra._isImage(document.createElement('img'))).to.be.true;
      expect(kontra._isImage(document.createElement('canvas'))).to.be.true;
    });

  });





  // --------------------------------------------------
  // kontra._isCanvas
  // --------------------------------------------------
  describe('_isCanvas', function() {

    it('should correctly identify a canvas element', function() {
      expect(kontra._isCanvas(true)).to.be.false;
      expect(kontra._isCanvas({})).to.be.false;
      expect(kontra._isCanvas(null)).to.be.false;
      expect(kontra._isCanvas(undefined)).to.be.false;
      expect(kontra._isCanvas([])).to.be.false;
      expect(kontra._isCanvas('')).to.be.false;
      expect(kontra._isCanvas(1)).to.be.false;
      expect(kontra._isCanvas(new Image())).to.be.false;
      expect(kontra._isCanvas(document.createElement('img'))).to.be.false;
      expect(kontra._isCanvas(function(){})).to.be.false;

      expect(kontra._isCanvas(document.createElement('canvas'))).to.be.true;
    });

  });

});