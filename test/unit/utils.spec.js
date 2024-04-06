import * as utils from '../../src/utils.js';
import { getCanvas } from '../../src/core.js';

// --------------------------------------------------
// utils
// --------------------------------------------------
describe('utils', () => {
  let canvas;
  beforeEach(() => {
    canvas = getCanvas();
  });

  // --------------------------------------------------
  // addToDom
  // --------------------------------------------------
  describe('addToDom', () => {
    it('adds the node as a sibling to the canvas', () => {
      const node = document.createElement('div');
      utils.addToDom(node, canvas);

      expect(canvas.nextSibling).to.equal(node);
    });

    it('adds the node to the body if canvas is disconnected', () => {
      const node = document.createElement('div');
      canvas.remove();
      utils.addToDom(node, canvas);

      expect(node.parentNode).to.equal(document.body);
    });

    it('adds the node to a container', () => {
      const div = document.createElement('div');
      div.append(canvas);

      const node = document.createElement('div');
      utils.addToDom(node, canvas);

      expect(div.contains(node)).to.be.true;
    });

    it('adds `data-kontra` attribute', () => {
      const node = document.createElement('div');
      utils.addToDom(node, canvas);

      expect(node.hasAttribute('data-kontra')).to.be.true;
    });

    it('adds the node as the next sibling to the last `data-kontra` node', () => {
      const container = document.createElement('div');
      container.append(canvas);

      const node1 = document.createElement('div');
      utils.addToDom(node1, canvas);

      const div = document.createElement('div');
      canvas.parentNode.append(div);

      const node2 = document.createElement('div');
      utils.addToDom(node2, canvas);

      expect(node1.nextSibling).to.equal(node2);
      expect(canvas.parentNode.lastChild).to.equal(div);
    });

    it('does not add the node as a child of an inner container with another `data-kontra` node', () => {
      const container = document.createElement('div');
      container.append(canvas);

      const innerContainer = document.createElement('div');
      container.append(innerContainer);

      const node1 = document.createElement('div');
      node1.setAttribute('data-kontra', '');
      innerContainer.appendChild(node1);

      const node2 = document.createElement('div');
      utils.addToDom(node2, canvas);

      expect(canvas.nextSibling).to.equal(node2);
    });
  });

  // --------------------------------------------------
  // removeFromArray
  // --------------------------------------------------
  describe('removeFromArray', () => {
    it('removes item from array', () => {
      const array = [1, 2, 3, 4];
      utils.removeFromArray(array, 3);

      expect(array).to.deep.equal([1, 2, 4]);
    });

    it('returns true when item is removed', () => {
      const array = [1, 2, 3, 4];
      const result = utils.removeFromArray(array, 3);

      expect(result).to.be.true;
    });

    it('does not remove item if not found', () => {
      const array = [1, 2, 3, 4];
      const result = utils.removeFromArray(array, 5);

      expect(array).to.deep.equal([1, 2, 3, 4]);
      expect(result).to.be.undefined;
    });
  });
});
