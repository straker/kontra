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
      expect(events.callbacks.foo[0]).to.equal(func);
    });

    it('should append the event if it already exists', () => {
      function func1() {}
      function func2() {}
      events.on('foo', func1);
      events.on('foo', func2);

      expect(events.callbacks.foo).to.be.an('array');
      expect(events.callbacks.foo[0]).to.equal(func1);
      expect(events.callbacks.foo[1]).to.equal(func2);
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
      expect(events.callbacks.foo[0]).to.equal(func1);
      expect(events.callbacks.foo[1]).to.equal(func2);
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
