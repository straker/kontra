import Scene from '../../src/scene.js';
import { srOnlyStyle } from '../../src/utils.js';
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

  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should setup basic properties', () => {
      expect(scene.id).to.equal('myId');
      expect(scene.name).to.equal('myId');
      expect(scene.cullObjects).to.equal(true);
      expect(scene.cullFunction).to.equal(collides);
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
      expect(scene._dn.getAttribute('aria-label')).to.equal(scene.name);
      expect(document.body.contains(scene._dn)).to.be.true;
    });

    it('should add the scene as an immediate sibling to the canvas', () => {
      expect(scene.context.canvas.nextSibling).to.equal(scene._dn);
    });

    it('should hide the DOM node', () => {
      srOnlyStyle.split(';').forEach(style => {
        let parts = style.split(':');
        expect(scene._dn.style[parts[0]]).to.equal(parts[1]);
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
      let canvas = scene.context.canvas;
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

    it('should update the sx and sy of the scene', () => {
      scene.lookAt({ x: 10, y: 10 });
      scene.render();

      expect(scene.sx).to.equal(-290);
      expect(scene.sy).to.equal(-290);
    });

    it('should take into account the scene scale', () => {
      scene.lookAt({ x: 10, y: 10 });
      scene.setScale(2, 2);
      scene.render();

      expect(scene.sx).to.equal(-280);
      expect(scene.sy).to.equal(-280);
    });
  });

  // --------------------------------------------------
  // camera world
  // --------------------------------------------------
  describe('camera world', () => {
    it('should not change width/height based on scale', () => {
      scene.setScale(2, 2);

      expect(scene.camera.world.width).to.equal(600);
      expect(scene.camera.world.height).to.equal(600);
    });
  });
});
