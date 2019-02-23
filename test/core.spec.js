// --------------------------------------------------
// kontra
// --------------------------------------------------
describe('kontra', function() {

  // --------------------------------------------------
  // kontra.on
  // --------------------------------------------------
  describe('on', () => {
    afterEach(() => {
      delete kontra._callbacks.foo;
    });

    it('should add the event to the callbacks object', () => {
      function func() {}
      kontra.on('foo', func);

      expect(kontra._callbacks.foo).to.be.an('array');
      expect(kontra._callbacks.foo[0]).to.equal(func);
    });

    it('should append the event if it already exists', () => {
      function func1() {}
      function func2() {}
      kontra.on('foo', func1);
      kontra.on('foo', func2);

      expect(kontra._callbacks.foo).to.be.an('array');
      expect(kontra._callbacks.foo[0]).to.equal(func1);
      expect(kontra._callbacks.foo[1]).to.equal(func2);
    });
  });





  // --------------------------------------------------
  // kontra.off
  // --------------------------------------------------
  describe('off', () => {
    function func() {}

    beforeEach(() => {
      kontra.on('foo', func);
    });

    afterEach(() => {
      delete kontra._callbacks.foo;
    });

    it('should remove the callback from the event', () => {
      kontra.off('foo', func);

      expect(kontra._callbacks.foo.length).to.equal(0);
    });

    it('should only remove the callback', () => {
      function func1() {}
      function func2() {}
      kontra.on('foo', func1);
      kontra.on('foo', func2);

      kontra.off('foo', func);

      expect(kontra._callbacks.foo.length).to.equal(2);
      expect(kontra._callbacks.foo[0]).to.equal(func1);
      expect(kontra._callbacks.foo[1]).to.equal(func2);
    });

    it('should not error if the callback was not added before', () => {
      function fn() {
        kontra.off('foo', () => {});
      }

      expect(fn).to.not.throw();
    });

    it('should not error if the event was not added before', () => {
      function fn() {
        kontra.off('myEvent', () => {});
      }

      expect(fn).to.not.throw();
    });
  });





  // --------------------------------------------------
  // kontra.emit
  // --------------------------------------------------
  describe('emit', () => {
    let func = sinon.spy();

    beforeEach(() => {
      func.resetHistory();
      kontra.on('foo', func);
    });

    afterEach(() => {
      delete kontra._callbacks.foo;
    });

    it('should call the callback', () => {
      kontra.emit('foo');

      expect(func.called).to.equal(true);
    });

    it('should pass all parameters to the callback', () => {
      kontra.emit('foo', 1, 2, 3);

      expect(func.calledWith(1,2,3)).to.equal(true);
    });

    it('should call the callbacks in order', () => {
      let func1 = sinon.spy();
      let func2 = sinon.spy();
      kontra.on('foo', func1);
      kontra.on('foo', func2);

      kontra.emit('foo');

      sinon.assert.callOrder(func, func1, func2);
    });

    it('should not error if the event was not added before', () => {
      function fn() {
        kontra.emit('myEvent', () => {});
      }

      expect(fn).to.not.throw();
    });
  });





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

    it('should emit the init event', () => {
      let stub = sinon.stub(kontra, 'emit');

      kontra.init();

      expect(stub.called).to.equal(true);
      expect(stub.calledWith('init', kontra)).to.equal(true);

      stub.restore();
    });

  });

});