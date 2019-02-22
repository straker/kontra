// --------------------------------------------------
// kontra.plugin
// --------------------------------------------------
describe('kontra.plugin', function() {

  let add = (p1, p2) => p1 + p2;
  let myPlugin = {
    beforeAdd(foobar, p1, p2) {
      return;
    },
    afterAdd(foobar, result, p1, p2) {
      return result * 2;
    }
  }

  beforeEach(() => {
    kontra.foobar = {
      add: add
    };
  });





  // --------------------------------------------------
  // kontra.plugin.register
  // --------------------------------------------------
  describe('register', function() {

    beforeEach(() => {
      kontra.plugin.register('foobar', myPlugin);
    });

    it('should create an interceptor list', () => {
      expect(kontra.foobar._inc).to.be.an('object');
    });

    it('should create before and after interceptor functions', () => {
      expect(kontra.foobar._bInc).to.be.an('function');
      expect(kontra.foobar._aInc).to.be.an('function');
    });

    it('should save the original method', () => {
      expect(kontra.foobar._oadd).to.be.an('function');
    });

    it('should override the original method', () => {
      expect(kontra.foobar.add).to.not.equal(add);
    });

    it('should create interceptors for the method', () => {
      expect(kontra.foobar._inc.add).to.be.an('object');
      expect(kontra.foobar._inc.add.before).to.be.an('array');
      expect(kontra.foobar._inc.add.after).to.be.an('array');
    });

    it('should add before method to interceptor list', () => {
      expect(kontra.foobar._inc.add.before.length).to.equal(1);
      expect(kontra.foobar._inc.add.before[0]).to.equal(myPlugin.beforeAdd);
    });

    it('should add the after method to interceptor list', () => {
      expect(kontra.foobar._inc.add.after.length).to.equal(1);
      expect(kontra.foobar._inc.add.after[0]).to.equal(myPlugin.afterAdd);
    });

    it('should not override interceptors if object is already intercepted', () => {
      kontra.plugin.register('foobar', {});

      expect(kontra.foobar._inc.add).to.be.ok;
      expect(kontra.foobar._inc.add.before.length).to.equal(1);
      expect(kontra.foobar._inc.add.after.length).to.equal(1);
    });

    it('should ignore functions that don\'t match the before/after syntax', () => {
      kontra.plugin.register('foobar', {
        doAdd() {}
      });

      expect(kontra.foobar._inc.add.before.length).to.equal(1);
      expect(kontra.foobar._inc.add.after.length).to.equal(1);
    });

    it('should do nothing if original method does not exist', () => {
      kontra.plugin.register('foobar', {
        afterBaz() {},
        beforeBaz() {}
      });

      expect(kontra.foobar.baz).to.not.be.ok;
      expect(kontra.foobar._inc.baz).to.not.be.ok;
    });

    it('should allow multiple plugins to be registered for the same method', () => {
      kontra.plugin.register('foobar', myPlugin);

      expect(kontra.foobar._inc.add.before.length).to.equal(2);
      expect(kontra.foobar._inc.add.after.length).to.equal(2);
    });





    describe('intercepted method', () => {
      let spy;
      afterEach(() => {
        spy.restore && spy.restore();
      });

      it('should call the original method', () => {
        spy = sinon.spy(kontra.foobar, '_oadd');
        kontra.foobar.add(1, 2);

        expect(spy.called).to.be.ok;
        expect(spy.calledWith(1, 2)).to.be.ok;
      });

      it('should call any before methods', () => {
        let stub = sinon.stub();
        kontra.foobar._inc.add.before[0] = stub;
        kontra.foobar.add(1, 2);

        expect(stub.called).to.be.ok;
        expect(stub.calledWith(kontra.foobar, 1, 2)).to.be.ok;
      });

      it('should pass the modified arguments from one before plugin to the next', () => {
        spy = sinon.spy(kontra.foobar, '_oadd');
        let stub = sinon.stub().callsFake(function fakeFn(context, p1, p2) {
          return [5, 6];
        });
        kontra.foobar._inc.add.before[0] = stub;

        kontra.foobar.add(1, 2);
        expect(stub.calledWith(kontra.foobar, 1, 2)).to.be.ok;
        expect(spy.calledWith(5, 6)).to.be.ok;
      });

      it('should pass the previous result if before plugin returns null', () => {
        spy = sinon.spy(kontra.foobar, '_oadd');
        let stub1 = sinon.stub().callsFake(function fakeFn(context, p1, p2) {
          return null;
        });
        let stub2 = sinon.stub().callsFake(function fakeFn(context, p1, p2) {
          return [5, 6];
        });
        kontra.plugin.register('foobar', {
          beforeAdd: stub1
        });
        kontra.plugin.register('foobar', {
          beforeAdd: stub2
        });

        kontra.foobar.add(1, 2);

        expect(stub2.calledWith(kontra.foobar, 1, 2)).to.be.ok;
        expect(spy.calledWith(5, 6)).to.be.ok;
      });

      it('should call any after methods', () => {
        let stub = sinon.stub();
        kontra.foobar._inc.add.after[0] = stub;
        kontra.foobar.add(1, 2);

        expect(stub.called).to.be.ok;
        expect(stub.calledWith(kontra.foobar, 3, 1, 2)).to.be.ok;
      });

      it('should return the result of all the after methods', () => {
        let result = kontra.foobar.add(1, 2);

        expect(result).to.equal(6);
      });

      it('should pass the result from one after plugin to the next', () => {
        let stub = sinon.stub().callsFake(function fakeFn(context, result, p1, p2) {
          return result + p1 * p2;
        });
        kontra.plugin.register('foobar', {
          afterAdd: stub
        });

        let result = kontra.foobar.add(1, 2);
        expect(stub.calledWith(kontra.foobar, 6, 1, 2)).to.be.ok;
        expect(result).to.equal(8);
      });

      it('should pass the previous result if after plugin returns null', () => {
        let stub1 = sinon.stub().callsFake(function fakeFn(context, result, p1, p2) {
          return null;
        });
        let stub2 = sinon.stub().callsFake(function fakeFn(context, result, p1, p2) {
          return result + p1 * p2;
        });
        kontra.plugin.register('foobar', {
          afterAdd: stub1
        });
        kontra.plugin.register('foobar', {
          afterAdd: stub2
        });

        let result = kontra.foobar.add(1, 2);

        expect(stub2.calledWith(kontra.foobar, 6, 1, 2)).to.be.ok;
        expect(result).to.equal(8);
      });

      it('should call plugins in the ordered they were registered', () => {
        let stub = sinon.stub();
        let stub1 = sinon.stub().callsFake(function fakeFn(context, result, p1, p2) {
          return null;
        });
        let stub2 = sinon.stub().callsFake(function fakeFn(context, result, p1, p2) {
          return result + p1 * p2;
        });
        kontra.plugin.register('foobar', {
          afterAdd: stub1
        });
        kontra.plugin.register('foobar', {
          afterAdd: stub2
        });
        kontra.foobar._inc.add.before[0] = stub;

        kontra.foobar.add(1, 2);

        sinon.assert.callOrder(stub, stub1, stub2);
      });
    });
  });





  // --------------------------------------------------
  // kontra.plugin.unregister
  // --------------------------------------------------
  describe('unregister', function() {

    beforeEach(() => {
      kontra.plugin.register('foobar', myPlugin);
      kontra.plugin.unregister('foobar', myPlugin);
    });

    it('should remove the before method from the interceptor list', () => {
      expect(kontra.foobar._inc.add.before.length).to.equal(0);
    });

    it('should remove the after method from the interceptor list', () => {
      expect(kontra.foobar._inc.add.after.length).to.equal(0);
    });

    it('should do nothing if object has not been overridden', () => {
      let fn = () => {
        kontra.plugin.unregister('sprite', myPlugin);
      }

      expect(fn).to.not.throw();
    });

    it('should ignore functions that don\'t match the before/after syntax', () => {
      let fn = () => {
        kontra.plugin.unregister('foobar', {
          doAdd() {}
        });
      }

      expect(fn).to.not.throw();
    });

    it('should not remove methods from other plugins', () => {
      let fn = () => {
        kontra.plugin.unregister('foobar', {
          afterAdd() {},
          beforeAdd() {}
        });
      }

      kontra.plugin.register('foobar', myPlugin);
      expect(fn).to.not.throw();
      expect(kontra.foobar._inc.add.before.length).to.equal(1);
      expect(kontra.foobar._inc.add.after.length).to.equal(1);
    });
  });





  // --------------------------------------------------
  // kontra.plugin.extend
  // --------------------------------------------------
  describe('extend', function() {

    it('should add properties onto the object', () => {
      let properties = {
        number: 1,
        string: 'hello',
        fn: function() {},
        object: {}
      };

      kontra.plugin.extend('foobar', properties);

      expect(kontra.foobar.number).to.equal(properties.number);
      expect(kontra.foobar.string).to.equal(properties.string);
      expect(kontra.foobar.fn).to.equal(properties.fn);
      expect(kontra.foobar.object).to.equal(properties.object);
    });

    it('should not add properties onto the object that already exist', () => {
      let properties = {
        number: 1,
        string: 'hello',
        fn: function() {},
        object: {}
      };

      let override = {
        number: 20
      };

      kontra.plugin.extend('foobar', properties);
      kontra.plugin.extend('foobar', override);

      expect(kontra.foobar.number).to.equal(properties.number);
    });
  });
});