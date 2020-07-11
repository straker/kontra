import GameObject from '../../src/gameObject.js'
import { getContext } from '../../src/core.js'
import { noop } from '../../src/utils.js'

// let testGameObject = GameObject();

// // optional properties used to test that each permutation of
// // options works correctly
// let hasGroup = testGameObject.hasOwnProperty('children');
// let hasVelocity = testGameObject.hasOwnProperty('velocity');
// let hasAcceleration = testGameObject.hasOwnProperty('acceleration');
// let hasRotation = typeof testGameObject.rotation !== 'undefined';
// let hasTTL = testGameObject.hasOwnProperty('ttl');
// let hasAnchor = testGameObject.hasOwnProperty('anchor');
// let hasCamera = typeof testGameObject.sx !== 'undefined';
// let hasScale = testGameObject.hasOwnProperty('scale');
// let hasOpacity = typeof testGameObject.opacity !== 'undefined';

// let properties = {
//   group: hasGroup,
//   velocity: hasVelocity,
//   acceleration: hasAcceleration,
//   rotation: hasRotation,
//   ttl: hasTTL,
//   anchor: hasAnchor,
//   camera: hasCamera,
//   scale: hasScale,
//   opacity: hasOpacity
// };

// --------------------------------------------------
// gameObject
// --------------------------------------------------
// describe('gameObject with properties: ' + JSON.stringify(properties,null,4), () => {
describe('gameObject', () => {

  let spy;
  let gameObject;
  beforeEach(() => {
    gameObject = GameObject();
  });

  afterEach(() => {
    spy && spy.restore();
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {

    it('should set default properties', () => {
      // defaults
      expect(gameObject.context).to.equal(getContext());
      expect(gameObject.width).to.equal(0);
      expect(gameObject.height).to.equal(0);

      // options
      expect(gameObject.anchor).to.deep.equal({x: 0, y: 0});
      expect(gameObject.sx).to.equal(0);
      expect(gameObject.sy).to.equal(0);
      expect(gameObject.children).to.deep.equal([]);
      expect(gameObject.opacity).to.equal(1);
      expect(gameObject.rotation).to.equal(0);
      expect(gameObject.scaleX).to.equal(1);
      expect(gameObject.scaleY).to.equal(1);
    });

    it('should set width and height properties', () => {
      gameObject = GameObject({width: 10, height: 20});

      expect(gameObject.width).to.equal(10);
      expect(gameObject.height).to.equal(20);
    });

    it('should set context property', () => {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      gameObject = GameObject({context: context});

      expect(gameObject.context).to.equal(context);
    });

    it('should set anchor property', () => {
      gameObject = GameObject({anchor: {x: 0.5, y: 0.5}});

      expect(gameObject.anchor).to.deep.equal({x: 0.5, y: 0.5});
    });

    it('should set sx and sy properties', () => {
      gameObject = GameObject({sx: 10, sy: 20});

      expect(gameObject.sx).to.equal(10);
      expect(gameObject.sy).to.equal(20);
    });

    it('should set children property', () => {
      gameObject = GameObject({
        children: [GameObject(), GameObject()]
      });

      expect(gameObject.children).to.have.lengthOf(2);
    });

    it('should set opacity property', () => {
      gameObject = GameObject({opacity: 0.5});

      expect(gameObject.opacity).to.equal(0.5);
    });

    it('should set rotation property', () => {
      gameObject = GameObject({rotation: 0.5});

      expect(gameObject.rotation).to.equal(0.5);
    });

    it('should set scaleX and scaleY properties', () => {
      gameObject = GameObject({scaleX: 10, scaleY: 20});

      expect(gameObject.scaleX).to.equal(10);
      expect(gameObject.scaleY).to.equal(20);
    });

    it('should set any property', () => {
      gameObject = GameObject({myProp: 'foo'});

      expect(gameObject.myProp).to.equal('foo');
    });

    it('should call "addChild" for each child', () => {
      spy = sinon.stub(GameObject.prototype, 'addChild').callsFake(noop);

      gameObject = GameObject({children: ['child1', 'child2']});

      expect(spy.calledTwice).to.be.true;
      expect(spy.firstCall.calledWith('child1')).to.be.true;
      expect(spy.secondCall.calledWith('child2')).to.be.true;
    });

    it('should set render function', () => {
      gameObject =  GameObject({render: noop});

      expect(gameObject._rf).to.equal(noop);
    });

  });







  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    afterEach(() => {
      gameObject.context.translate.restore && gameObject.context.translate.restore();
      gameObject.context.rotate.restore && gameObject.context.rotate.restore();
      gameObject.context.scale.restore && gameObject.context.scale.restore();
    });

    it('should translate to the x and y position', () => {
      gameObject.x = 10;
      gameObject.y = 20;

      sinon.stub(gameObject.context, 'translate');

      gameObject.render();

      expect(gameObject.context.translate.calledWith(10, 20)).to.be.true;
    });

    it('should translate to the viewX and viewY position', () => {
      gameObject.x = 30;
      gameObject.y = 40;
      gameObject.sx = 5;
      gameObject.sy = 10;

      sinon.stub(gameObject.context, 'translate');

      gameObject.render();

      expect(gameObject.context.translate.calledWith(25, 30)).to.be.true;
    });

    it('should not translate if the position is 0', () => {
      sinon.stub(gameObject.context, 'translate');

      gameObject.render();

      expect(gameObject.context.translate.called).to.be.false;
    });

    it('should rotate by the rotation', () => {
      gameObject.rotation = 10;

      sinon.stub(gameObject.context, 'rotate');

      gameObject.render();

      expect(gameObject.context.rotate.calledWith(10)).to.be.true;
    });

    it('should not rotate if the rotation is 0', () => {
      sinon.stub(gameObject.context, 'rotate');

      gameObject.render();

      expect(gameObject.context.rotate.called).to.be.false;
    });

    it('should scale the canvas', () => {
      gameObject.scaleX = 2;
      gameObject.scaleY = 2;

      sinon.stub(gameObject.context, 'scale');

      gameObject.render();

      expect(gameObject.context.scale.calledWith(2, 2)).to.be.true;
    });

    it('should not scale if scaleX and scaleY are 1', () => {
      sinon.stub(gameObject.context, 'scale');

      gameObject.render();

      expect(gameObject.context.scale.called).to.be.false;
    });

    it('should translate to the anchor position', () => {
      gameObject.anchor = {x: 0.5, y: 0.5};
      gameObject.width = 20;
      gameObject.height = 30;

      sinon.stub(gameObject.context, 'translate');

      gameObject.render();

      expect(gameObject.context.translate.calledWith(-10, -15)).to.be.true;
    });

    it('should not translate if the anchor position is {0, 0}', () => {
      sinon.stub(gameObject.context, 'translate');

      gameObject.render();

      expect(gameObject.context.translate.called).to.be.false;
    });

    it('should set the globalAlpha', () => {
      gameObject._fop = 0.5;

      var spy = sinon.spy(gameObject.context, 'globalAlpha', ['set']);

      gameObject.render();

      expect(spy.set.calledWith(0.5)).to.be.true;

      spy.restore();
    });

    it('should call the render function', () => {
      sinon.stub(gameObject, '_rf');

      gameObject.render();

      expect(gameObject._rf.called).to.be.true;
    });

    it('should call render on each child', () => {
      let child = {
        render: sinon.stub()
      };

      gameObject.children = [child];

      gameObject.render();

      expect(child.render.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // camera
  // --------------------------------------------------
  describe('camera', () => {

    it('should return the camera offset position', () => {
      gameObject.x = 10;
      gameObject.y = 20;

      expect(gameObject.viewX).to.equal(10);
      expect(gameObject.viewY).to.equal(20);

      gameObject.sx = 50;
      gameObject.sy = 40;

      expect(gameObject.viewX).to.equal(-40);
      expect(gameObject.viewY).to.equal(-20);
    });

    it('should be readonly', () => {
      function viewX() {
        gameObject.viewX = 10
      }
      function viewY() {
        gameObject.viewY = 10
      }

      expect(viewX).to.throw();
      expect(viewY).to.throw();
    });

  });





  // --------------------------------------------------
  // group
  // --------------------------------------------------
  describe('group', () => {

    // --------------------------------------------------
    // addChild
    // --------------------------------------------------
    describe('addChild', () => {

      it('should add the object as a child', () => {
        let child = {
          foo: 'bar'
        };
        gameObject.addChild(child);

        expect(gameObject.children).deep.equal([child]);
      });

      it('should set the childs parent to the game object', () => {
        let child = {
          foo: 'bar'
        };
        gameObject.addChild(child);

        expect(child.parent).to.equal(gameObject);
      });

      it('should set the childs relative position', () => {
        gameObject.x = 30;
        gameObject.y = 35;

        let child = GameObject({
          x: 0,
          y: 0
        });

        gameObject.addChild(child);

        expect(child.x).to.equal(30);
        expect(child.y).to.equal(35);
      });

      it('should set the childs absolute position', () => {
        gameObject.x = 30;
        gameObject.y = 35;

        let child = GameObject({
          x: 0,
          y: 0
        });

        gameObject.addChild(child, { absolute: true });

        expect(child.x).to.equal(0);
        expect(child.y).to.equal(0);
      });

      it('should set the childs relative sx and sy', () => {
        gameObject.sx = 30;
        gameObject.sy = 35;

        let child = GameObject({
          sx: 0,
          sy: 0
        });

        gameObject.addChild(child);

        expect(child.sx).to.equal(30);
        expect(child.sy).to.equal(35);
      });

      it('should set the childs absolute sx and sy', () => {
        gameObject.sx = 30;
        gameObject.sy = 35;

        let child = GameObject({
          sx: 0,
          sy: 0
        });

        gameObject.addChild(child, { absolute: true });

        expect(child.x).to.equal(0);
        expect(child.y).to.equal(0);
      });

      it('should set the childs final opacity', () => {
        gameObject.opacity = 0.5;

        let child = GameObject({
          opacity: 1
        });

        gameObject.addChild(child);

        expect(child.finalOpacity).to.equal(0.5);
      });

      it('should not change the childs opacity', () => {
        gameObject.opacity = 0.5;

        let child = GameObject({
          opacity: 1
        });

        gameObject.addChild(child);

        expect(child.opacity).to.equal(1);
      });

      it('should set the childs rotation', () => {
        gameObject.rotation = 30;

        let child = GameObject({
          rotation: 10
        });

        gameObject.addChild(child);

        expect(child.rotation).to.equal(40);
      });


      it('should set the childs scale', () => {
        gameObject.scaleX = 2;
        gameObject.scaleY = 2;

        let child = GameObject({
          scaleX: 1,
          scaleY: 1
        });

        gameObject.addChild(child);

        expect(child.scaleX).to.equal(2);
        expect(child.scaleY).to.equal(2);
      });

    });





    // --------------------------------------------------
    // removeChild
    // --------------------------------------------------
    describe('removeChild', () => {

      it('should remove the object as a child', () => {
        let child = {
          foo: 'bar'
        };
        gameObject.addChild(child);
        gameObject.removeChild(child);

        expect(gameObject.children.length).to.equal(0);
      });

      it('should remove the childs parent', () => {
        let child = {
          foo: 'bar'
        };
        gameObject.addChild(child);
        gameObject.removeChild(child);

        expect(child.parent).to.equal(null);
      });

      it('should not error if child was not added', () => {
        let child = {
          foo: 'bar'
        };

        function fn() {
          gameObject.removeChild(child);
        }

        expect(fn).to.not.throw();
      });

    });





    // --------------------------------------------------
    // x/y/sx/sy/rotation/scaleX/scaleY
    // --------------------------------------------------
    ['x', 'y', 'sx', 'sy', 'rotation', 'scaleX', 'scaleY'].forEach(prop => {
      describe(`gameObject.${prop}`, () => {
        let gameObject, child;

        beforeEach(() => {
          gameObject = GameObject({
            [prop]: 15
          });
          child = GameObject();
          gameObject.addChild(child);
        });

        it(`should set the ${prop}`, () => {
          child[prop] = 20;

          expect(child[prop]).to.equal(20);
        });

        it(`should not change the parent ${prop}`, () => {
          child[prop] = 20;

          expect(gameObject[prop]).to.equal(15);
        });

        it('should update all children', () => {
          let child2 = GameObject();
          gameObject.addChild(child2);

          child[prop] = 10;
          child2[prop] = 5;

          gameObject[prop] = 20;

          expect(child[prop]).to.equal(15);
          expect(child2[prop]).to.equal(10);
        });

        it('should update the entire child hierarchy', () => {
          let child2 = GameObject();
          let child3 = GameObject();
          child.addChild(child2);
          child2.addChild(child3);

          child[prop] = 10;
          child2[prop] = 5;
          child3[prop] = 15;

          gameObject[prop] = 20;

          expect(child[prop]).to.equal(15);
          expect(child2[prop]).to.equal(10);
          expect(child3[prop]).to.equal(20);
        });

      });
    });

    describe(`gameObject.finalOpacity`, () => {

      let child;
      beforeEach(() => {
        gameObject = GameObject({
          opacity: 1
        });
        child = GameObject();
        gameObject.addChild(child);
      });

      it(`should set the finalOpacity`, () => {
        child.opacity = 0.5;

        expect(child.finalOpacity).to.equal(0.5);
      });

      it(`should not change the parent opacity`, () => {
        child.opacity = 0.5;

        expect(gameObject.opacity).to.equal(1);
      });

      it('should update all children', () => {
        let child2 = GameObject();
        gameObject.addChild(child2);

        child.opacity = 0.5;
        child2.opacity = 0.25;

        gameObject.opacity = 0.75;

        expect(child.finalOpacity).to.equal(0.375);
        expect(child2.finalOpacity).to.equal(0.1875);
      });

      it('should update the entire child hierarchy', () => {
        let child2 = GameObject();
        let child3 = GameObject();
        child.addChild(child2);
        child2.addChild(child3);

        child.opacity = 0.5;
        child2.opacity = 0.5;
        child3.opacity = 0.5;

        gameObject.opacity = 0.75;

        expect(child.finalOpacity).to.equal(0.375);
        expect(child2.finalOpacity).to.equal(0.1875);
        expect(child3.finalOpacity).to.equal(0.09375);
      });

      it('should update the final opacity in the middle of the hierarchy', () => {
        let child2 = GameObject();
        let child3 = GameObject();
        child.addChild(child2);
        child2.addChild(child3);

        child.opacity = 0.5;
        child2.opacity = 0.5;
        child3.opacity = 0.5;

        child2.opacity = 0.75;

        expect(child2.finalOpacity).to.equal(0.375);
      });

      it('should be readonly', () => {
        function fn() {
          gameObject.finalOpacity = 10;
        }

        expect(fn).to.throw();
      });

    });

  });





  // --------------------------------------------------
  // setScale
  // --------------------------------------------------
  describe('setScale', () => {

    it('should set the x and y scale', () => {
      gameObject = GameObject();
      gameObject.setScale(2, 2);

      expect(gameObject.scaleX).to.equal(2);
      expect(gameObject.scaleY).to.equal(2);
    });

    it('should default y to the x argument', () => {
      gameObject = GameObject();
      gameObject.setScale(2);

      expect(gameObject.scaleX).to.equal(2);
      expect(gameObject.scaleY).to.equal(2);
    });

  });





  // --------------------------------------------------
  // scaledWidth/Height
  // --------------------------------------------------
  describe('scaledWidth/Height', () => {

    it('should return the scaled width', () => {
      gameObject.width = 20;

      expect(gameObject.scaledWidth).to.equal(20);

      gameObject.scaleX = 2;

      expect(gameObject.scaledWidth).to.equal(40);
    });

    it('should return the scaled height', () => {
      gameObject.height = 20;

      expect(gameObject.scaledHeight).to.equal(20);

      gameObject.scaleY = 2;

      expect(gameObject.scaledHeight).to.equal(40);
    });

    it('should be readonly', () => {
      function scaledWidth() {
        gameObject.scaledWidth = 10
      }
      function scaledHeight() {
        gameObject.scaledHeight = 10
      }

      expect(scaledWidth).to.throw();
      expect(scaledHeight).to.throw();
    });

  });

});
