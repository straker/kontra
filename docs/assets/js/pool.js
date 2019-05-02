(function() {
  let { canvas, context } = kontra.init('pool-example');

  let midX = canvas.width / 2;
  let midY = canvas.height / 2;

  let fields = [
    kontra.Sprite({
      x: midX - 75,
      y: midY + 20,
      width: 3,
      height: 3,
      color: 'green',
      mass: 900,
      size: 3
    }),
    kontra.Sprite({
      x: midX + 25,
      y: midY + 10,
      width: 3,
      height: 3,
      color: 'red',
      mass: -50,
      size: 3
    })
  ];

  let pool = kontra.Pool({
    create: kontra.Sprite,
    maxSize: 1500,
    fill: true
  });

  context.font = '18px Arial';

  // redefine sprite update to account for fields
  function update() {
    // apply field
    let totalAccelerationX = 0
    let totalAccelerationY = 0;

    for (let i = 0, field; field = fields[i]; i++) {

      let vectorX = field.x - this.x;
      let vectorY = field.y - this.y;

      let force = field.mass / Math.pow(vectorX * vectorX + vectorY * vectorY, 1.5);

      totalAccelerationX += vectorX * force;
      totalAccelerationY += vectorY * force;
    }

    this.ddx = totalAccelerationX
    this.ddy = totalAccelerationY

    this.advance();
  }

  // redefine sprite render to not change context fillStyle every time
  function render() {
    context.save();
    context.fillStyle = `rgba(255, 0, 0, ${this.ttl / 300})`
    context.fillRect(this.x, this.y, 3, 3);
    context.restore();
  };

  let loop = kontra.GameLoop({
    update: function() {
      for (let i = 0; i < 4; i++) {
        pool.get({
          x: midX + 75,
          y: midY,
          dx: 2 - Math.random() * 4,
          dy: 2 - Math.random() * 4,
          color: 'white',
          width: 1,
          height: 1,
          ttl: 300,
          update: update,
          render: render
        });
      }

      pool.update();
    },
    render: function() {
      pool.render();

      context.fillStyle = 'white';
      context.fillText(`Object count: ${pool.size}`, 15, 25);
    }
  });

  loop.start();
})();