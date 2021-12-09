import * as plugin from '../../src/plugin.js';

// --------------------------------------------------
// plugin
// --------------------------------------------------
describe('plugin', () => {
  let add = (p1, p2) => p1 + p2;
  let myPlugin = {
    beforeAdd() {
      return;
    },
    afterAdd(foobar, result) {
      return result * 2;
    }
  };
  let root, classObject;

  beforeEach(() => {
    // fake a Class prototype chain
    root = { add };
    classObject = Object.create(root);
    classObject.prototype = root;
  });

  it('should export api', () => {
    expect(plugin.registerPlugin).to.be.an('function');
    expect(plugin.unregisterPlugin).to.be.an('function');
    expect(plugin.extendObject).to.be.an('function');
  });

  // --------------------------------------------------
  // registerPlugin
  // --------------------------------------------------
  describe('registerPlugin', () => {
    beforeEach(() => {
      plugin.registerPlugin(classObject, myPlugin);
    });

    it('should create an interceptor list', () => {
      expect(classObject.prototype._inc).to.be.an('object');
    });

    it('should create before and after interceptor functions', () => {
      expect(classObject.prototype._bInc).to.be.an('function');
      expect(classObject.prototype._aInc).to.be.an('function');
    });

    it('should save the original method', () => {
      expect(classObject.prototype._oadd).to.be.an('function');
    });

    it('should override the original method', () => {
      expect(classObject.add).to.not.equal(add);
    });

    it('should create interceptors for the method', () => {
      expect(classObject.prototype._inc.add).to.be.an('object');
      expect(classObject.prototype._inc.add.before).to.be.an('array');
      expect(classObject.prototype._inc.add.after).to.be.an('array');
    });

    it('should add before method to interceptor list', () => {
      expect(classObject.prototype._inc.add.before.length).to.equal(
        1
      );
      expect(classObject.prototype._inc.add.before[0]).to.equal(
        myPlugin.beforeAdd
      );
    });

    it('should add the after method to interceptor list', () => {
      expect(classObject.prototype._inc.add.after.length).to.equal(1);
      expect(classObject.prototype._inc.add.after[0]).to.equal(
        myPlugin.afterAdd
      );
    });

    it('should not override interceptors if object is already intercepted', () => {
      plugin.registerPlugin(classObject, {});

      expect(classObject.prototype._inc.add).to.ok;
      expect(classObject.prototype._inc.add.before.length).to.equal(
        1
      );
      expect(classObject.prototype._inc.add.after.length).to.equal(1);
    });

    it("should ignore functions that don't match the before/after syntax", () => {
      plugin.registerPlugin(classObject, {
        doAdd() {}
      });

      expect(classObject.prototype._inc.add.before.length).to.equal(
        1
      );
      expect(classObject.prototype._inc.add.after.length).to.equal(1);
    });

    it('should do nothing if original method does not exist', () => {
      plugin.registerPlugin(classObject, {
        afterBaz() {},
        beforeBaz() {}
      });

      expect(classObject.prototype.baz).to.not.be.true;
      expect(classObject.prototype._inc.baz).to.not.be.true;
    });

    it('should allow multiple plugins to be registered for the same method', () => {
      plugin.registerPlugin(classObject, myPlugin);

      expect(classObject.prototype._inc.add.before.length).to.equal(
        2
      );
      expect(classObject.prototype._inc.add.after.length).to.equal(2);
    });

    describe('intercepted method', () => {
      it('should call the original method', () => {
        let spy = sinon.spy(classObject.prototype, '_oadd');
        classObject.add(1, 2);

        expect(spy.called).to.equal(true);
        expect(spy.calledWith(1, 2)).to.equal(true);
      });

      it('should call any before methods', () => {
        let stub = sinon.stub();
        classObject.prototype._inc.add.before[0] = stub;
        classObject.add(1, 2);

        expect(stub.called).to.equal(true);
        expect(stub.calledWith(classObject, 1, 2)).to.equal(true);
      });

      it('should pass the modified arguments from one before plugin to the next', () => {
        let spy = sinon.spy(classObject.prototype, '_oadd');
        let stub = sinon.stub().callsFake(() => {
          return [5, 6];
        });
        classObject.prototype._inc.add.before[0] = stub;

        classObject.add(1, 2);
        expect(stub.calledWith(classObject, 1, 2)).to.equal(true);
        expect(spy.calledWith(5, 6)).to.equal(true);
      });

      it('should pass the previous result if before plugin returns null', () => {
        let spy = sinon.spy(classObject.prototype, '_oadd');
        let stub1 = sinon.stub().callsFake(() => {
          return null;
        });
        let stub2 = sinon.stub().callsFake(() => {
          return [5, 6];
        });
        plugin.registerPlugin(classObject, {
          beforeAdd: stub1
        });
        plugin.registerPlugin(classObject, {
          beforeAdd: stub2
        });

        classObject.add(1, 2);

        expect(stub2.calledWith(classObject, 1, 2)).to.equal(true);
        expect(spy.calledWith(5, 6)).to.equal(true);
      });

      it('should call any after methods', () => {
        let stub = sinon.stub();
        classObject.prototype._inc.add.after[0] = stub;
        classObject.add(1, 2);

        expect(stub.called).to.equal(true);
        expect(stub.calledWith(classObject, 3, 1, 2)).to.equal(true);
      });

      it('should return the result of all the after methods', () => {
        let result = classObject.add(1, 2);

        expect(result).to.equal(6);
      });

      it('should pass the result from one after plugin to the next', () => {
        let stub = sinon
          .stub()
          .callsFake((context, result, p1, p2) => {
            return result + p1 * p2;
          });
        plugin.registerPlugin(classObject, {
          afterAdd: stub
        });

        let result = classObject.add(1, 2);
        expect(stub.calledWith(classObject, 6, 1, 2)).to.equal(true);
        expect(result).to.equal(8);
      });

      it('should pass the previous result if after plugin returns null', () => {
        let stub1 = sinon.stub().callsFake(() => {
          return null;
        });
        let stub2 = sinon
          .stub()
          .callsFake((context, result, p1, p2) => {
            return result + p1 * p2;
          });
        plugin.registerPlugin(classObject, {
          afterAdd: stub1
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub2
        });

        let result = classObject.add(1, 2);

        expect(stub2.calledWith(classObject, 6, 1, 2)).to.equal(true);
        expect(result).to.equal(8);
      });

      it('should call plugins in the ordered they were registered', () => {
        let stub = sinon.stub();
        let stub1 = sinon.stub().callsFake(() => {
          return null;
        });
        let stub2 = sinon
          .stub()
          .callsFake((context, result, p1, p2) => {
            return result + p1 * p2;
          });
        plugin.registerPlugin(classObject, {
          afterAdd: stub1
        });
        plugin.registerPlugin(classObject, {
          afterAdd: stub2
        });
        classObject.prototype._inc.add.before[0] = stub;

        classObject.add(1, 2);

        sinon.assert.callOrder(stub, stub1, stub2);
      });

      it("should do nothing if kontra object doesn't exist", () => {
        let fn = () => {
          plugin.registerPlugin('baz', myPlugin);
        };

        expect(fn).to.not.throw();
      });
    });
  });

  // --------------------------------------------------
  // unregisterPlugin
  // --------------------------------------------------
  describe('unregisterPlugin', () => {
    beforeEach(() => {
      plugin.registerPlugin(classObject, myPlugin);
      plugin.unregisterPlugin(classObject, myPlugin);
    });

    it('should remove the before method from the interceptor list', () => {
      expect(classObject.prototype._inc.add.before.length).to.equal(
        0
      );
    });

    it('should remove the after method from the interceptor list', () => {
      expect(classObject.prototype._inc.add.after.length).to.equal(0);
    });

    it("should do nothing if kontra object doesn't exist", () => {
      let fn = () => {
        plugin.unregisterPlugin('baz', myPlugin);
      };

      expect(fn).to.not.throw();
    });

    it('should do nothing if object has not been overridden', () => {
      classObject.prototype = {};

      let fn = () => {
        plugin.unregisterPlugin(classObject, myPlugin);
      };

      expect(fn).to.not.throw();
    });

    it("should ignore functions that don't match the before/after syntax", () => {
      let fn = () => {
        plugin.unregisterPlugin(classObject, {
          doAdd() {}
        });
      };

      expect(fn).to.not.throw();
    });

    it('should not remove methods from other plugins', () => {
      let fn = () => {
        plugin.unregisterPlugin(classObject, {
          afterAdd() {},
          beforeAdd() {}
        });
      };

      plugin.registerPlugin(classObject, myPlugin);
      expect(fn).to.not.throw();
      expect(classObject.prototype._inc.add.before.length).to.equal(
        1
      );
      expect(classObject.prototype._inc.add.after.length).to.equal(1);
    });
  });

  // --------------------------------------------------
  // extendObject
  // --------------------------------------------------
  describe('extendObject', () => {
    it('should add properties onto the object', () => {
      let properties = {
        number: 1,
        string: 'hello',
        fn() {},
        object: {}
      };

      plugin.extendObject(classObject, properties);

      expect(classObject.number).to.equal(properties.number);
      expect(classObject.string).to.equal(properties.string);
      expect(classObject.fn).to.equal(properties.fn);
      expect(classObject.object).to.equal(properties.object);
    });

    it('should not add properties onto the object that already exist', () => {
      let properties = {
        number: 1,
        string: 'hello',
        fn() {},
        object: {}
      };

      let override = {
        number: 20
      };

      plugin.extendObject(classObject, properties);
      plugin.extendObject(classObject, override);

      expect(classObject.number).to.equal(properties.number);
    });

    it("should do nothing if kontra object doesn't exist", () => {
      let fn = () => {
        plugin.extendObject({}, myPlugin);
      };

      expect(fn).to.not.throw();
    });
  });
});
