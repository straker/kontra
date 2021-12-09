import Scene, { SceneClass } from '../../src/scene.js';
import { getCanvas } from '../../src/core.js';
import { noop, srOnlyStyle } from '../../src/utils.js';
import { collides } from '../../src/helpers.js';

// --------------------------------------------------
// scene
// --------------------------------------------------
describe('scene', () => {
  let scene;
  beforeEach(() => {
    scene = Scene({
      id: 'myId'
    });
  });

  afterEach(() => {
    scene.destroy();
  });

  it('should export class', () => {
    expect(SceneClass).to.be.a('function');
  });

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should setup basic properties', () => {
      expect(scene.id).to.equal('myId');
      expect(scene.name).to.equal('myId');
      expect(scene.children).to.deep.equal([]);
      expect(scene.canvas).to.equal(getCanvas());
      expect(scene.cullObjects).to.equal(true);
      expect(scene.cullFunction).to.equal(collides);
    });

    it('should override basic properties', () => {
      let canvas = {
        getContext: noop
      };

      scene.destroy();
      scene = Scene({
        canvas,
        cullObjects: false,
        cullFunction: noop,
        onShow: noop,
        onHide: noop
      });

      expect(scene.canvas).to.equal(canvas);
      expect(scene.cullObjects).to.be.false;
      expect(scene.cullFunction).to.equal(noop);
      expect(scene.onShow).to.equal(noop);
      expect(scene.onHide).to.equal(noop);
    });

    it('should set all additional properties on the scene', () => {
      scene.destroy();
      scene = Scene({
        foo: 'bar',
        alive: true
      });

      expect(scene.foo).to.equal('bar');
      expect(scene.alive).to.be.true;
    });

    it('should create a DOM node and add it to the page', () => {
      expect(scene._dn).to.exist;
      expect(scene._dn.id).to.equal(scene.id);
      expect(scene._dn.tabIndex).to.equal(-1);
      expect(scene._dn.getAttribute('aria-label')).to.equal(
        scene.name
      );
      expect(document.body.contains(scene._dn)).to.be.true;
    });

    it('should add children', () => {
      let child = {};
      scene.destroy();
      scene = Scene({
        children: [child]
      });

      expect(scene.children.length).to.equal(1);
      expect(scene.children[0]).to.equal(child);
    });

    it('should add the scene as an immediate sibling to the canvas', () => {
      expect(scene.canvas.nextSibling).to.equal(scene._dn);
    });

    it('should hide the DOM node', () => {
      let styles = srOnlyStyle
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style);

      scene._dn
        .getAttribute('style')
        .split(';')
        .map(style => style.split(':')[0].trim())
        .filter(style => !!style)
        .forEach((prop, index) => {
          expect(styles[index]).to.equal(prop);
        });
    });

    it('should allow children', () => {
      let child = {};
      scene.destroy();
      scene = Scene({
        id: 'myId',
        children: [child]
      });

      expect(scene.children.length).to.equal(1);
      expect(scene.children[0]).to.equal(child);
    });

    it('should create the camera and center it', () => {
      let canvas = scene.canvas;
      expect(scene.camera).to.exist;
      expect(scene.camera.x).to.equal(canvas.width / 2);
      expect(scene.camera.y).to.equal(canvas.height / 2);
      expect(scene.camera.width).to.equal(canvas.width);
      expect(scene.camera.height).to.equal(canvas.height);
      expect(scene.camera.anchor).to.deep.equal({ x: 0.5, y: 0.5 });
    });
  });

  // --------------------------------------------------
  // show
  // --------------------------------------------------
  describe('show', () => {
    it('should unset the hidden property', () => {
      scene.hidden = true;
      scene.show();

      expect(scene.hidden).to.equal(false);
      expect(scene._dn.hidden).to.equal(false);
    });

    it('should focus the DOM node', () => {
      scene.show();

      expect(document.activeElement).to.equal(scene._dn);
    });

    it('should focus the first focusable child', () => {
      let child = {
        focus: sinon.spy()
      };
      scene.addChild(child);
      scene.show();

      expect(child.focus.called).to.be.true;
    });

    it('should call onShow', () => {
      scene.onShow = sinon.spy();
      scene.show();

      expect(scene.onShow.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // hide
  // --------------------------------------------------
  describe('hide', () => {
    it('should set the hidden property', () => {
      scene.hidden = false;
      scene.hide();

      expect(scene.hidden).to.equal(true);
      expect(scene._dn.hidden).to.equal(true);
    });

    it('should call onHide', () => {
      scene.onHide = sinon.spy();
      scene.hide();

      expect(scene.onHide.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // addChild
  // --------------------------------------------------
  describe('addChild', () => {
    it('should add the child', () => {
      let child = {};
      scene.addChild(child);

      expect(scene.children.length).to.equal(1);
    });

    it('should add any children with DOM nodes to the scenes DOM node', () => {
      let child = {
        _dn: document.createElement('div')
      };
      scene.addChild(child);

      expect(scene._dn.contains(child._dn)).to.be.true;
    });

    it('should add DOM nodes of all descendants', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let child = {
        children: [
          {
            children: [
              {
                _dn: node1
              }
            ]
          },
          {
            _dn: node2
          }
        ]
      };
      scene.addChild(child);

      expect(scene._dn.contains(node1)).to.be.true;
      expect(scene._dn.contains(node2)).to.be.true;
    });

    it('should not take DOM nodes from descendants who have a DOM parent', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let child = {
        children: [
          {
            _dn: node1,
            children: [
              {
                _dn: node2
              }
            ]
          }
        ]
      };
      scene.addChild(child);

      expect(scene._dn.contains(node1)).to.be.true;
      expect(scene._dn.contains(node2)).to.be.false;
    });
  });

  // --------------------------------------------------
  // removeChild
  // --------------------------------------------------
  describe('removeChild', () => {
    it('should remove the child', () => {
      let child = {};
      scene.addChild(child);
      scene.removeChild(child);

      expect(scene.children.length).to.equal(0);
    });

    it('should remove any children with DOM nodes', () => {
      let child = {
        _dn: document.createElement('div')
      };
      scene.addChild(child);
      scene.removeChild(child);

      expect(scene._dn.contains(child._dn)).to.be.false;
      expect(document.body.contains(child._dn)).to.be.true;
    });

    it('should remove DOM nodes of all descendants', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      let child = {
        children: [
          {
            children: [
              {
                _dn: node1
              }
            ]
          },
          {
            _dn: node2
          }
        ]
      };
      scene.addChild(child);
      scene.removeChild(child);

      expect(scene._dn.contains(node1)).to.be.false;
      expect(scene._dn.contains(node2)).to.be.false;
    });

    it('should not take DOM nodes from descendants who have a DOM parent', () => {
      let node1 = document.createElement('div');
      let node2 = document.createElement('div');
      node1.appendChild(node2);

      let child = {
        children: [
          {
            _dn: node1,
            children: [
              {
                _dn: node2
              }
            ]
          }
        ]
      };
      scene.addChild(child);
      scene.removeChild(child);

      expect(scene._dn.contains(node1)).to.be.false;
      expect(scene._dn.contains(node2)).to.be.false;
      expect(node1.contains(node2)).to.be.true;
    });
  });

  // --------------------------------------------------
  // children
  // --------------------------------------------------
  describe('children', () => {
    it('should properly handle setting children', () => {
      scene.addChild({ foo: 'bar' });
      scene.addChild({ faz: 'baz' });
      scene.addChild({ hello: 'world' });

      let removeSpy = sinon.spy(scene, 'removeChild');
      let addSpy = sinon.spy(scene, 'addChild');
      let child = {
        thing1: 'thing2'
      };

      scene.children = [child];

      expect(removeSpy.calledThrice).to.be.true;
      expect(addSpy.calledWith(child)).to.be.true;
      expect(scene.children.length).to.equal(1);
      expect(scene.children[0]).to.equal(child);
    });
  });

  // --------------------------------------------------
  // destroy
  // --------------------------------------------------
  describe('destroy', () => {
    it('should remove the DOM node', () => {
      scene.destroy();

      expect(document.body.contains(scene._dn)).to.be.false;
    });

    it('should call destroy on all children', () => {
      let child = {
        destroy: sinon.spy()
      };
      scene.addChild(child);
      scene.destroy();

      expect(child.destroy.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {
    it('should call update on all children if scene is not hidden', () => {
      let child = {
        update: sinon.spy()
      };
      scene.addChild(child);
      scene.update();

      expect(child.update.called).to.be.true;
    });

    it('should not call update on all children if scene is hidden', () => {
      let child = {
        update: sinon.spy()
      };
      scene.addChild(child);
      scene.hide();
      scene.update();

      expect(child.update.called).to.be.false;
    });

    it('should not error on objects without update function', () => {
      let child = {};
      scene.addChild(child);

      function fn() {
        scene.update();
      }

      expect(fn).to.not.throw();
    });
  });

  // --------------------------------------------------
  // lookAt
  // --------------------------------------------------
  describe('lookAt', () => {
    it('should set the camera position to the object', () => {
      scene.lookAt({ x: 10, y: 10 });

      expect(scene.camera.x).to.equal(10);
      expect(scene.camera.y).to.equal(10);
    });

    it('should take into account scale', () => {
      scene.lookAt({ x: 10, y: 10, scaleX: 2, scaleY: 2 });

      expect(scene.camera.x).to.equal(5);
      expect(scene.camera.y).to.equal(5);
    });

    it('should take into account world', () => {
      scene.lookAt({ world: { x: 10, y: 10, scaleX: 2, scaleY: 2 } });

      expect(scene.camera.x).to.equal(5);
      expect(scene.camera.y).to.equal(5);
    });
  });

  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {
    it('should call render on all children', () => {
      let child = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.addChild(child);
      scene.render();

      expect(child.render.called).to.be.true;
    });

    it('should not call render on all children if scene is hidden', () => {
      let child = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.addChild(child);
      scene.hide();
      scene.render();

      expect(child.render.called).to.be.false;
    });

    it('should cull objects outside camera bounds', () => {
      let child = {
        x: -20,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.addChild(child);
      scene.render();

      expect(child.render.called).to.be.false;
    });

    it('should not cull objects if cullObjects is false', () => {
      let child = {
        x: -20,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      scene.cullObjects = false;
      scene.addChild(child);
      scene.render();

      expect(child.render.called).to.be.true;
    });

    it('should not error on objects without render function', () => {
      let child = {};
      scene.addChild(child);

      function fn() {
        scene.render();
      }

      expect(fn).to.not.throw();
    });

    it('should translate the canvas to the camera', () => {
      let spy = sinon.spy(scene._ctx, 'translate');

      scene.lookAt({ x: 10, y: 10 });
      scene.render();

      expect(spy.calledWith(290, 290)).to.be.true;

      spy.restore();
    });

    it('should take into account the camera scale', () => {
      let spy = sinon.spy(scene._ctx, 'translate');

      scene.lookAt({ x: 10, y: 10 });
      scene.camera.setScale(2, 2);
      scene.render();

      expect(spy.calledWith(280, 280)).to.be.true;

      spy.restore();
    });

    it('should sort children', () => {
      scene.cullObjects = false;
      scene.children = [{ y: 20 }, { y: 10 }];
      scene.sortFunction = (a, b) => a.y - b.y;
      scene.render();

      expect(scene.children[0].y).to.equal(10);
      expect(scene.children[1].y).to.equal(20);
    });

    it('should sort children after being culled', () => {
      let cullSpy = sinon.stub().returns(true);
      let sortSpy = sinon.spy();

      let child1 = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };
      let child2 = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        render: sinon.spy()
      };

      scene.children = [child1, child2];
      scene.cullFunction = cullSpy;
      scene.sortFunction = sortSpy;
      scene.render();

      expect(sortSpy.calledAfter(cullSpy)).to.be.true;
    });
  });
});
