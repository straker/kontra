import * as events from '../../src/events.js';

// --------------------------------------------------
// on
// --------------------------------------------------
describe('events', () => {
  it('should export api', () => {
    expect(events.on).to.be.an('function');
    expect(events.off).to.be.an('function');
    expect(events.emit).to.be.an('function');
  });

  // --------------------------------------------------
  // on
  // --------------------------------------------------
  describe('on', () => {
    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should add the event to the callbacks object', () => {
      function func() {}
      events.on('foo', func);

      expect(events.callbacks.foo).to.be.an('array');
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func,
        once: false
      });
    });

    it('should append the event if it already exists', () => {
      function func1() {}
      function func2() {}
      events.on('foo', func1);
      events.on('foo', func2);

      expect(events.callbacks.foo).to.be.an('array');
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func1,
        once: false
      });
      expect(events.callbacks.foo[1]).to.deep.equal({
        fn: func2,
        once: false
      });
    });
  });

  // --------------------------------------------------
  // on(once)
  // --------------------------------------------------
  describe('on(once)', () => {
    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should add the event to the callbacks object', () => {
      function func() {}
      events.on('foo', func, true);

      expect(events.callbacks.foo).to.be.an('array');
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func,
        once: true
      });
    });

    it('should append the event if it already exists', () => {
      function func1() {}
      function func2() {}
      events.on('foo', func1, true);
      events.on('foo', func2, true);

      expect(events.callbacks.foo).to.be.an('array');
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func1,
        once: true
      });
      expect(events.callbacks.foo[1]).to.deep.equal({
        fn: func2,
        once: true
      });
    });

    it('should remove the event after emit', () => {
      let func = sinon.spy();
      events.on('foo', func, true);
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func,
        once: true
      });

      events.emit('foo');
      expect(func.called).to.equal(true);
      expect(events.callbacks.foo.length).to.equal(0);
    });

    it('should call multiple functions with mix once type', () => {
      let func1 = sinon.spy();
      let func2 = sinon.spy();
      let func3 = sinon.spy();
      let func4 = sinon.spy();
      events.on('foo', func1);
      events.on('foo', func2, true);
      events.on('foo', func3);
      events.on('foo', func4, true);

      events.emit('foo');
      expect(func1.called).to.equal(true);
      expect(func2.called).to.equal(true);
      expect(func3.called).to.equal(true);
      expect(func4.called).to.equal(true);

      expect(events.callbacks.foo.length).to.equal(2);
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func1,
        once: false
      });
      expect(events.callbacks.foo[1]).to.deep.equal({
        fn: func3,
        once: false
      });
    });
  });

  // --------------------------------------------------
  // off
  // --------------------------------------------------
  describe('off', () => {
    function func() {}

    beforeEach(() => {
      events.on('foo', func);
    });

    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should remove the callback from the event', () => {
      events.off('foo', func);

      expect(events.callbacks.foo.length).to.equal(0);
    });

    it('should only remove the callback', () => {
      function func1() {}
      function func2() {}
      events.on('foo', func1);
      events.on('foo', func2);

      events.off('foo', func);

      expect(events.callbacks.foo.length).to.equal(2);
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func1,
        once: false
      });
      expect(events.callbacks.foo[1]).to.deep.equal({
        fn: func2,
        once: false
      });
    });

    it('should remove callback added as once', () => {
      delete events.callbacks.foo;

      function func2() {}
      events.on('foo', func2, true);

      expect(events.callbacks.foo.length).to.equal(1);

      events.off('foo', func2, true);

      expect(events.callbacks.foo.length).to.equal(0);
    });

    it('should not remove callback added as once if not passed once param', () => {
      delete events.callbacks.foo;

      function func2() {}
      events.on('foo', func2, true);

      expect(events.callbacks.foo.length).to.equal(1);

      events.off('foo', func2);

      expect(events.callbacks.foo.length).to.equal(1);
    });

    it('should only remove callback that matches once param', () => {
      events.on('foo', func, true);

      expect(events.callbacks.foo.length).to.equal(2);

      events.off('foo', func, true);

      expect(events.callbacks.foo.length).to.equal(1);
      expect(events.callbacks.foo[0]).to.deep.equal({
        fn: func,
        once: false
      });
    });

    it('should not error if the callback was not added before', () => {
      function fn() {
        events.off('foo', () => {});
      }

      expect(fn).to.not.throw();
    });

    it('should not error if the event was not added before', () => {
      function fn() {
        events.off('myEvent', () => {});
      }

      expect(fn).to.not.throw();
    });
  });

  // --------------------------------------------------
  // emit
  // --------------------------------------------------
  describe('emit', () => {
    let func = sinon.spy();

    beforeEach(() => {
      func.resetHistory();
      events.on('foo', func);
    });

    afterEach(() => {
      delete events.callbacks.foo;
    });

    it('should call the callback', () => {
      events.emit('foo');

      expect(func.called).to.equal(true);
    });

    it('should pass all parameters to the callback', () => {
      events.emit('foo', 1, 2, 3);

      expect(func.calledWith(1, 2, 3)).to.equal(true);
    });

    it('should call the callbacks in order', () => {
      let func1 = sinon.spy();
      let func2 = sinon.spy();
      events.on('foo', func1);
      events.on('foo', func2);

      events.emit('foo');

      sinon.assert.callOrder(func, func1, func2);
    });

    it('should not error if the event was not added before', () => {
      function fn() {
        events.emit('myEvent', () => {});
      }

      expect(fn).to.not.throw();
    });
  });
});
