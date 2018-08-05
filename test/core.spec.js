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
      function func() {
        kontra.init();
      }

      expect(func).to.throw();
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

});