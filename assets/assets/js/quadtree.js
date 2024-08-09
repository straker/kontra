(function () {
  let { canvas, context } = kontra.init('quadtree-example');

  let sprites = [];
  for (let i = 0; i < 20; i++) {
    sprites.push(
      kontra.Sprite({
        width: 10,
        height: 10,
        x: Math.random() * (canvas.width - 10),
        y: Math.random() * (canvas.height - 10),
        dx: Math.random() * 4 - 2,
        dy: Math.random() * 4 - 2,
        color: 'red'
      })
    );
  }

  function renderQuadtree(node) {
    context.strokeStyle = '#eee';
    context.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);

    // render the subnodes so long as this node is a branch and has subnodes
    if (node._b && node._s.length) {
      for (let i = 0; i < 4; i++) {
        renderQuadtree(node._s[i]);
      }
    }
  }

  let quadtree = kontra.Quadtree({
    maxObjects: 5
  });

  let loop = kontra.GameLoop({
    update() {
      sprites.forEach(sprite => {
        sprite.update();

        if (sprite.x < 0) {
          sprite.dx *= -1;
          sprite.x = 0;
        } else if (sprite.x + sprite.width >= canvas.width) {
          sprite.dx *= -1;
          sprite.x = canvas.width - sprite.width;
        }

        if (sprite.y < 0) {
          sprite.dy *= -1;
          sprite.y = 0;
        } else if (sprite.y + sprite.height >= canvas.height) {
          sprite.dy *= -1;
          sprite.y = canvas.height - sprite.height;
        }
      });

      quadtree.clear();
      quadtree.add(sprites);
    },
    render() {
      renderQuadtree(quadtree);
      sprites.forEach(sprite => sprite.render());
    }
  });

  loop.start();
})();
