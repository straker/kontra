// wrap in a function as it uses assets that won't exist before they
// are loaded
function getGameScene() {
  let canvas = kontra.getCanvas();
  let playerScore = 0;
  let scoreText = kontra.Text({
    color: '#FF7F00',
    text: 'Score: 0',
    font: '18px Helvetica, sans-serif',
    anchor: {x: 0.5, y: 0},
    x: canvas.width - 100,
    y: 5
  });

  kontra.audioAssets.kick_shock.loop = true;

  /*
   * Audio pools
   */
  // create an audio sprite for use in an audio pool, mimicking a normal image sprite
  let audioSprite = {
    isAlive: function() {
      return !this.audio.ended;
    },
    init: function(properties) {
      if (properties.play !== false) {
        this.audio.play();
      }
    },
    // set required properties
    render: function() {},
    update: function() {}
  };

  // common create functions for audio pool
  /**
   * Create a new sound effect from the passed object.
   * @param {object} properties - Properties for the audio.
   * @param {Audio} properties.audio - Audio object to clone.
   */
  function create(properties) {
    let sprite = Object.create(audioSprite);
    sprite.audio = properties.audio.cloneNode();
    sprite.audio.volume = 0.25;

    // kill the audio by forcing it to jump to the end of the track
    sprite.audio.currentTime = properties.audio.duration;

    return sprite;
  }

  /**
   * Toggle all the audios in the pool
   */
  function toggleVolume() {
    for (let i = 0, obj; obj = this.objects[i]; i++) {
      obj.audio.muted = !obj.audio.muted;
    }
  }

  // create audio pools
  let laserPool = kontra.Pool({
    create: function() {
      return create({audio: kontra.audioAssets.laser})
    },
    fill: true,
    maxSize: 5
  });
  laserPool.toggleVolume = toggleVolume;

  for (let i = 0; i < 5; i++) {
    laserPool.get({'play': false});
  }

  let explosionPool = kontra.Pool({
    create: function() {
      return create({audio: kontra.audioAssets.explosion})
    },
    maxSize: 10
  });
  explosionPool.toggleVolume = toggleVolume;

  for (let i = 0; i < 5; i++) {
    explosionPool.get({'play': false});
  }

  /*
   * object pools
   */
  let bullets = kontra.Pool({
    create: kontra.Sprite,
    maxSize: 20
  });

  let enemies = kontra.Pool({
    create: kontra.Sprite,
    maxSize: 18
  });

  let enemyBullets = kontra.Pool({
    create: kontra.Sprite,
    maxSize: 30
  });

  /*
   * game objects
   */
  let quadtree = kontra.Quadtree();

  // panning background
  let background = kontra.Sprite({
    dy: 1,
    image: kontra.imageAssets.bg,
    update: function() {
      this.advance();

      if (this.y >= canvas.height) {
        this.y = 0;
      }
    },
    render: function() {
      this.draw();

      this.context.drawImage(this.image, 0, -canvas.height);
    }
  });

  // player ship
  let player = kontra.Sprite({
    x: 280,
    y: 270,
    image: kontra.imageAssets.ship,
    counter: 15,
    update: function() {
      this.counter++;

      if (kontra.keyPressed('left')) {
        this.x -= 3;
      }
      else if (kontra.keyPressed('right')) {
        this.x += 3;
      }

      if (kontra.keyPressed('up')) {
        this.y -= 3;
      }
      else if (kontra.keyPressed('down')) {
        this.y += 3;
      }

      if (kontra.keyPressed('space') && this.counter >= 15) {
        for (let i = 0; i < 2; i++) {
          bullets.get({
            x: this.x + 6 + (i * 27),
            y: this.y,
            dy: -3,
            image: kontra.imageAssets.bullet,
            ttl: 130,
            type: 'friendly'
          });
        }

        laserPool.get();

        this.counter = 0;
      }
    }
  });

  // clamp player position to lower third of the screen
  player.position.clamp(
    0, canvas.height * 2 / 3,
    canvas.width - player.width, canvas.height - player.height
  );

  /**
   * Spawn a new wave of enemies.
   */
  function spawnWave() {
    let width = kontra.imageAssets.enemy.width;
    let x = 100;
    let y = -kontra.imageAssets.enemy.height;
    let spacer = y * 1.5;

    for (let i = 1; i <= 18; i++) {
      enemies.get({
        x: x,
        y: y,
        dy: 2,
        image: kontra.imageAssets.enemy,
        ttl: Infinity,
        leftEdge: x - 90,
        rightEdge: x + 90 + width,
        bottomEdge: y + 140,
        speed: 2,
        type: 'enemy',
        update: function() {
          this.advance();

          // change enemy velocity to move back and forth
          if (this.x <= this.leftEdge) {
            this.dx = this.speed;
          }
          else if (this.x >= this.rightEdge) {
            this.dx = -this.speed;
          }
          else if (this.y >= this.bottomEdge) {
            this.dy = 0;
            this.dx = -this.speed;
            this.y -= 5;
          }

          // randomly fire bullets
          if (Math.floor(Math.random()*101)/100 < .01) {
            enemyBullets.get({
              x: this.x + this.width / 2,
              y: this.y + this.height,
              dy: 2.5,
              image: kontra.imageAssets.bullet_enemy,
              ttl: 150,
              type: 'hostile'
            });
          }
        },
      });

      x += width + 25;

      if (i % 6 === 0) {
        x = 100;
        y += spacer;
      }
    }
  }

  kontra.bindKeys('m', function() {
    toggleMusic();
  });

  /**
   * Toggle the music on and off.
   */
  function toggleMusic() {
    kontra.audioAssets.kick_shock.muted = !kontra.audioAssets.kick_shock.muted;
    kontra.audioAssets.game_over.muted = !kontra.audioAssets.game_over.muted
    laserPool.toggleVolume();
    explosionPool.toggleVolume();
  }

  let gameScene = kontra.Scene({
    id: 'Galaxian',
    update() {
      background.update();
      player.update();
      bullets.update();
      enemies.update();
      enemyBullets.update();
      laserPool.update();
      explosionPool.update();

      let liveBullets = bullets.getAliveObjects();

      quadtree.clear();
      quadtree.add(enemies.getAliveObjects(), enemyBullets.getAliveObjects());

      // find collisions between the player ship and enemy bullets
      let objects = quadtree.get(player);

      for (let i = 0, obj; obj = objects[i]; i++) {
        if (obj.type === 'hostile' && kontra.collides(obj, player)) {
          kontra.emit('gameOver');
        }
      }

      // find collisions between the player bullets and enemy ships
      for (let i = 0, bullet; bullet = liveBullets[i]; i++) {
        objects = quadtree.get(bullet);

        for (let j = 0, obj; obj = objects[j]; j++) {
          if (obj.type === 'enemy' && kontra.collides(obj, bullet)) {
            bullet.ttl = 0;
            obj.ttl = 0;

            explosionPool.get();

            playerScore += 10;
            scoreText.text = 'Score: ' + playerScore;
          }
        }
      }

      // spawn a new wave of enemies
      if (enemies.getAliveObjects().length === 0) {
        spawnWave();
      }
    },
    render() {
      background.render();
      player.render();
      bullets.render();
      enemies.render();
      enemyBullets.render();
      scoreText.render();
    },
    start() {
      enemies.clear();
      enemyBullets.clear();
      bullets.clear();

      playerScore = 0;
      scoreText.text = 'Score: 0';

      kontra.audioAssets.game_over.pause();
      kontra.audioAssets.kick_shock.currentTime = 0;
      kontra.audioAssets.kick_shock.play();

      player.position.x = 280;
      player.position.y = 270;
    }
  });

  return gameScene;
}

export default getGameScene;