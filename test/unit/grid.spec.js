import Grid from '../../src/grid.js';
import { getCanvas } from '../../src/core.js';

// --------------------------------------------------
// grid
// --------------------------------------------------
describe('grid', () => {
  // --------------------------------------------------
  // init
  // --------------------------------------------------
  describe('init', () => {
    it('should set default properties', () => {
      let grid = Grid();

      expect(grid.flow).to.equal('column');
      expect(grid.align).to.equal('start');
      expect(grid.justify).to.equal('start');
      expect(grid.colGap).to.equal(0);
      expect(grid.rowGap).to.equal(0);
      expect(grid.numCols).to.equal(1);
      expect(grid.dir).to.equal('');
      expect(grid.breakpoints).to.deep.equal([]);
    });

    it('should set properties', () => {
      let grid = Grid({
        flow: 'grid',
        align: 'end',
        justify: 'center',
        colGap: 10,
        rowGap: [20, 30],
        numCols: 3,
        dir: 'rtl'
      });

      expect(grid.flow).to.equal('grid');
      expect(grid.align).to.equal('end');
      expect(grid.justify).to.equal('center');
      expect(grid.colGap).to.equal(10);
      expect(grid.rowGap).to.deep.equal([20, 30]);
      expect(grid.numCols).to.equal(3);
      expect(grid.dir).to.equal('rtl');
    });
  });

  // --------------------------------------------------
  // destroy
  // --------------------------------------------------
  describe('destroy', () => {
    it('should call destroy for each child', () => {
      let child = {
        destroy: sinon.spy()
      };
      let grid = Grid({
        children: [child]
      });

      grid.destroy();

      expect(child.destroy.called).to.be.true;
    });
  });

  // --------------------------------------------------
  // prerender
  // --------------------------------------------------
  describe('prerender', () => {
    let grid, child1, child2, child3, child4;

    // --------------------------------------------------
    // column
    // --------------------------------------------------
    describe('column', () => {
      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };

        grid = Grid({
          x: 100,
          y: 50,
          children: [child1, child2, child3, child4]
        });
      });

      it('should set the width to the largest width', () => {
        expect(grid.width).to.equal(100);
      });

      it('should set the height to the total height', () => {
        expect(grid.height).to.equal(250);
      });

      it('should set position of each child', () => {
        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(25);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(125);

        expect(child4.x).to.equal(0);
        expect(child4.y).to.equal(175);
      });

      it('should take into account rowGap', () => {
        grid.rowGap = 10;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(35);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(145);

        expect(child4.x).to.equal(0);
        expect(child4.y).to.equal(205);
      });

      it('should take into account rowGap array', () => {
        grid.rowGap = [10, 5];
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(35);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(140);

        expect(child4.x).to.equal(0);
        expect(child4.y).to.equal(200);
      });

      it('should take into account grid anchor', () => {
        grid.anchor = { x: 0.5, y: 0.5 };
        grid.render();

        expect(child1.x).to.equal(-50);
        expect(child1.y).to.equal(-125);

        expect(child2.x).to.equal(-50);
        expect(child2.y).to.equal(-100);

        expect(child3.x).to.equal(-50);
        expect(child3.y).to.equal(0);

        expect(child4.x).to.equal(-50);
        expect(child4.y).to.equal(50);
      });

      it('should take into account child anchor', () => {
        child1.anchor = { x: 0.5, y: 0.5 };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(50);
        expect(child1.y).to.equal(12.5);

        child1.anchor = { x: 1, y: 1 };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(100);
        expect(child1.y).to.equal(25);
      });

      it('should take into account child world width and height', () => {
        child1.world = {
          width: 50,
          height: 10
        };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(10);
      });
    });

    // --------------------------------------------------
    // row
    // --------------------------------------------------
    describe('row', () => {
      // copy from col just so we can see it closer to the tests
      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };

        grid = Grid({
          x: 100,
          y: 50,
          flow: 'row',
          children: [child1, child2, child3, child4]
        });
      });

      it('should set the width to the total width', () => {
        expect(grid.width).to.equal(200);
      });

      it('should set the height to the largest height', () => {
        expect(grid.height).to.equal(100);
      });

      it('should set position of each child', () => {
        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(125);
        expect(child3.y).to.equal(0);

        expect(child4.x).to.equal(175);
        expect(child4.y).to.equal(0);
      });

      it('should take into account colGap', () => {
        grid.colGap = 10;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(110);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(145);
        expect(child3.y).to.equal(0);

        expect(child4.x).to.equal(205);
        expect(child4.y).to.equal(0);
      });

      it('should take into account colGap array', () => {
        grid.colGap = [10, 5];
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(110);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(140);
        expect(child3.y).to.equal(0);

        expect(child4.x).to.equal(200);
        expect(child4.y).to.equal(0);
      });

      it('should take into account grid anchor', () => {
        grid.anchor = { x: 0.5, y: 0.5 };
        grid.render();

        expect(child1.x).to.equal(-100);
        expect(child1.y).to.equal(-50);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(-50);

        expect(child3.x).to.equal(25);
        expect(child3.y).to.equal(-50);

        expect(child4.x).to.equal(75);
        expect(child4.y).to.equal(-50);
      });

      it('should take into account child anchor', () => {
        child1.anchor = { x: 0.5, y: 0.5 };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(50);
        expect(child1.y).to.equal(12.5);

        child1.anchor = { x: 1, y: 1 };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(100);
        expect(child1.y).to.equal(25);
      });

      it('should take into account child world width and height', () => {
        child1.world = {
          width: 50,
          height: 10
        };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(50);
        expect(child2.y).to.equal(0);
      });

      it('should reverse the order when dir=rtl', () => {
        grid.dir = 'rtl';
        grid.render();

        expect(child1.x).to.equal(100);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(75);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(25);
        expect(child3.y).to.equal(0);

        expect(child4.x).to.equal(0);
        expect(child4.y).to.equal(0);
      });

      it('should reverse the order if canvas dir=rtl', () => {
        getCanvas().dir = 'rtl';
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(100);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(75);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(25);
        expect(child3.y).to.equal(0);

        expect(child4.x).to.equal(0);
        expect(child4.y).to.equal(0);
      });
    });

    // --------------------------------------------------
    // grid
    // --------------------------------------------------
    describe('grid', () => {
      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };

        grid = Grid({
          x: 100,
          y: 50,
          flow: 'grid',
          numCols: 2,
          children: [child1, child2, child3, child4]
        });
      });

      it('should set the width to the total width of each col', () => {
        expect(grid.width).to.equal(125);
      });

      it('should set the height to the total height of each row', () => {
        expect(grid.height).to.equal(175);
      });

      it('should set position of each child', () => {
        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(100);

        expect(child4.x).to.equal(100);
        expect(child4.y).to.equal(100);
      });

      it('should take into account colGap', () => {
        grid.colGap = 10;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(110);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(100);

        expect(child4.x).to.equal(110);
        expect(child4.y).to.equal(100);
      });

      it('should take into account rowGap', () => {
        grid.rowGap = 10;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(110);

        expect(child4.x).to.equal(100);
        expect(child4.y).to.equal(110);
      });

      it('should take into account grid anchor', () => {
        grid.anchor = { x: 0.5, y: 0.5 };
        grid.render();

        expect(child1.x).to.equal(-62.5);
        expect(child1.y).to.equal(-87.5);

        expect(child2.x).to.equal(37.5);
        expect(child2.y).to.equal(-87.5);

        expect(child3.x).to.equal(-62.5);
        expect(child3.y).to.equal(12.5);

        expect(child4.x).to.equal(37.5);
        expect(child4.y).to.equal(12.5);
      });

      it('should take into account child anchor', () => {
        child1.anchor = { x: 0.5, y: 0.5 };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(50);
        expect(child1.y).to.equal(12.5);

        child1.anchor = { x: 1, y: 1 };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(100);
        expect(child1.y).to.equal(25);
      });

      it('should take into account child world width and height', () => {
        child1.world = {
          width: 50,
          height: 200
        };
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(50);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(200);
      });
    });

    // --------------------------------------------------
    // align
    // --------------------------------------------------
    describe('align', () => {
      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };
        grid = Grid({
          x: 100,
          y: 50,
          flow: 'grid',
          numCols: 2,
          children: [child1, child2, child3, child4]
        });
      });

      it('should take into account align (center)', () => {
        grid.align = 'center';
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(37.5);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(112.5);

        expect(child4.x).to.equal(100);
        expect(child4.y).to.equal(100);
      });

      it('should take into account align (end)', () => {
        grid.align = 'end';
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(75);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(125);

        expect(child4.x).to.equal(100);
        expect(child4.y).to.equal(100);
      });

      it('should take into account child with `alignSelf`', () => {
        child1.alignSelf = 'center';
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(37.5);
      });
    });

    // --------------------------------------------------
    // justify
    // --------------------------------------------------
    describe('justify', () => {
      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };
        grid = Grid({
          x: 100,
          y: 50,
          flow: 'grid',
          numCols: 2,
          children: [child1, child2, child3, child4]
        });
      });

      it('should take into account justify (center)', () => {
        grid.justify = 'center';
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(25);
        expect(child3.y).to.equal(100);

        expect(child4.x).to.equal(100);
        expect(child4.y).to.equal(100);
      });

      it('should take into account justify (end)', () => {
        grid.justify = 'end';
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(100);
        expect(child2.y).to.equal(0);

        expect(child3.x).to.equal(50);
        expect(child3.y).to.equal(100);

        expect(child4.x).to.equal(100);
        expect(child4.y).to.equal(100);
      });

      it('should take into account child with `justifySelf`', () => {
        child3.justifySelf = 'center';
        grid._d = true;
        grid.render();

        expect(child3.x).to.equal(25);
        expect(child3.y).to.equal(100);
      });
    });

    // --------------------------------------------------
    // colGap
    // --------------------------------------------------
    describe('colGap', () => {
      let grid, child1, child2, child3, child4;

      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };
        grid = Grid({
          x: 100,
          y: 50,
          colGap: [5, 10, 15],
          flow: 'row',
          children: [child1, child2, child3, child4]
        });
      });

      it('should reverse the order when dir=rtl', () => {
        grid.dir = 'rtl';
        grid.render();

        expect(child4.x).to.equal(0);
        expect(child3.x).to.equal(40);
        expect(child2.x).to.equal(100);
        expect(child1.x).to.equal(130);
      });

      it('should reverse the order if canvas dir=rtl', () => {
        getCanvas().dir = 'rtl';
        grid._d = true;
        grid.render();

        expect(child4.x).to.equal(0);
        expect(child3.x).to.equal(40);
        expect(child2.x).to.equal(100);
        expect(child1.x).to.equal(130);
      });
    });

    // --------------------------------------------------
    // colSpan
    // --------------------------------------------------
    describe('colSpan', () => {
      beforeEach(() => {
        child1 = {
          width: 100,
          height: 25
        };
        child2 = {
          width: 25,
          height: 100
        };
        child3 = {
          width: 50,
          height: 50
        };
        child4 = {
          width: 25,
          height: 75
        };
        grid = Grid({
          x: 100,
          y: 50,
          flow: 'grid',
          numCols: 2,
          children: [child1, child2, child3, child4]
        });
      });

      it('should take into account child with `colSpan`', () => {
        child1.colSpan = 2;
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(25);

        expect(child3.x).to.equal(50);
        expect(child3.y).to.equal(25);

        expect(child4.x).to.equal(0);
        expect(child4.y).to.equal(125);
      });

      it('should reverse the order when dir=rtl and odd number of children', () => {
        child1.colSpan = 2;
        grid.dir = 'rtl';
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(75);
        expect(child2.y).to.equal(25);

        expect(child3.x).to.equal(0);
        expect(child3.y).to.equal(25);

        expect(child4.x).to.equal(75);
        expect(child4.y).to.equal(125);
      });

      it('should work for colSpan > 2', () => {
        child1.colSpan = 4;
        grid.numCols = 4;
        grid._d = true;
        grid.render();

        expect(child1.x).to.equal(0);
        expect(child1.y).to.equal(0);

        expect(child2.x).to.equal(0);
        expect(child2.y).to.equal(25);

        expect(child3.x).to.equal(25);
        expect(child3.y).to.equal(25);

        expect(child4.x).to.equal(75);
        expect(child4.y).to.equal(25);
      });
    });

    // --------------------------------------------------
    // breakpoints
    // --------------------------------------------------
    describe('breakpoints', () => {
      it('should call the callback if the metric returns true', () => {
        let callback = sinon.spy();

        grid = Grid({
          numCols: 2,
          breakpoints: [
            {
              metric() {
                return this.scaleX === 2;
              },
              callback
            }
          ]
        });

        expect(callback.called).to.be.false;

        grid.setScale(2);
        grid.render();

        expect(callback.called).to.be.true;
      });

      it("should not call the callback twice if it hasn't changed", () => {
        let callback = sinon.spy();

        grid = Grid({
          numCols: 2,
          breakpoints: [
            {
              metric() {
                return this.scaleX === 2;
              },
              callback
            }
          ]
        });

        expect(callback.called).to.be.false;

        grid.setScale(2);
        grid.render();

        grid.setScale(2);
        grid.render();

        expect(callback.calledTwice).to.be.false;
      });
    });
  });
});
