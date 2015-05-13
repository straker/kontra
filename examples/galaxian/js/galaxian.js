kontra.init();

// set default asset paths
kontra.assetPaths.images = 'imgs/';
kontra.assetPaths.audios = 'sounds/';

// load assets
kontra.loadAssets(
  // images
  'ship.png', 'bg.png', 'bullet_enemy.png', 'bullet.png', 'enemy.png',
  // audios
  'explosion.mp3', 'game_over.mp3', 'kick_shock.mp3', 'laser.mp3'
).then(function() {
  document.getElementById('loading').style.display = 'none';
  var score = document.getElementById('score');
  var playerScore = 0;

  kontra.audios.kick_shock.loop = true;

  /*
   * Audio pools
   */
  // create an audio sprite for use in an audio pool, mimicing a normal image sprite
  var audioSprite = {
    isAlive: function() {
      return !this.audio.ended;
    },
    set: function() {
      this.audio.play();
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
    var sprite = Object.create(audioSprite);
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
    for (var i = 0, obj; obj = this.objects[i]; i++) {
      obj.audio.muted = !obj.audio.muted;
    }
  }

  // create audio pools
  var laserPool = kontra.pool({
    create: create,
    createProperties: {
      audio: kontra.audios.laser
    },
    fill: true,
    maxSize: 5
  });
  laserPool.toggleVolume = toggleVolume;

  var explosionPool = kontra.pool({
    create: create,
    createProperties: {
      audio: kontra.audios.explosion
    },
    fill: true,
    maxSize: 10
  });
  explosionPool.toggleVolume = toggleVolume;

  /*
   * object pools
   */
  var bullets = kontra.pool({
    create: kontra.sprite,
    maxSize: 30
  });

  var enemies = kontra.pool({
    create: kontra.sprite,
    maxSize: 18
  });

  var enemyBullets = kontra.pool({
    create: kontra.sprite,
    maxSize: 30
  });

  /*
   * game objects
   */
  var quadtree = kontra.quadtree();

  // panning background
  var background = kontra.sprite({
    dy: 1,
    image: kontra.images.bg,
    update: function() {
      this.advance();

      if (this.position.y >= kontra.game.height) {
        this.position.y = 0;
      }
    },
    render: function() {
      this.draw();

      this.context.drawImage(this.image, this.position.x, this.position.y - kontra.game.height);
    }
  });

  // player ship
  var player = kontra.sprite({
    x: 280,
    y: 270,
    image: kontra.images.ship,
    properties: {
      counter: 15
    },
    update: function() {
      this.counter++;

      if (kontra.keys.pressed('left')) {
        player.position.add({x: -3});
      }
      else if (kontra.keys.pressed('right')) {
        player.position.add({x: 3});
      }

      if (kontra.keys.pressed('up')) {
        player.position.add({y: -3});
      }
      else if (kontra.keys.pressed('down')) {
        player.position.add({y: 3});
      }

      if (kontra.keys.pressed('space') && this.counter >= 15) {
        for (var i = 0; i < 2; i++) {
          bullets.get({
            x: this.position.x + 6 + (i * 27),
            y: this.position.y,
            dy: -3,
            image: kontra.images.bullet,
            timeToLive: 130,
            properties: {
              type: 'friendly'
            }
          });
        }

        laserPool.get();

        this.counter = 0;
      }
    }
  });

  // clamp player position to lower third of the screen
  player.position.clamp(
    0, kontra.game.height * 2 / 3,
    kontra.game.width - player.width, kontra.game.height - player.height
  );

  /**
   * Spawn a new wave of enemies.
   */
  function spawnWave() {
    var width = kontra.images.enemy.width;
    var x = 100;
    var y = -kontra.images.enemy.height;
    var spacer = y * 1.5;

    for (var i = 1; i <= 18; i++) {
      enemies.get({
        x: x,
        y: y,
        dy: 2,
        image: kontra.images.enemy,
        timeToLive: Infinity,
        properties: {
          leftEdge: x - 90,
          rightEdge: x + 90 + width,
          bottomEdge: y + 140,
          speed: 2,
          type: 'enemy'
        },
        update: function() {
          this.advance();

          // change enemy velocity to move back and forth
          if (this.position.x <= this.leftEdge) {
            this.velocity.x = this.speed;
          }
          else if (this.position.x >= this.rightEdge) {
            this.velocity.x = -this.speed;
          }
          else if (this.position.y >= this.bottomEdge) {
            this.velocity.y = 0;
            this.velocity.x = -this.speed;
            this.position.y -= 5;
          }

          // randomly fire bullets
          if (Math.floor(Math.random()*101)/100 < .01) {
            enemyBullets.get({
              x: this.position.x + this.width / 2,
              y: this.position.y + this.height,
              dy: 2.5,
              image: kontra.images.bullet_enemy,
              timeToLive: 150,
              properties: {
                type: 'hostile'
              }
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

  /*
   * Game loop
   */
  var loop = kontra.gameLoop({
    update: function(dt) {
      background.update();
      player.update();
      bullets.update();
      enemies.update();
      enemyBullets.update();
      laserPool.update();
      explosionPool.update();

      var liveBullets = bullets.getAliveObjects();

      quadtree.clear();
      quadtree.add(player);
      quadtree.add(liveBullets);
      quadtree.add(enemies.getAliveObjects());
      quadtree.add(enemyBullets.getAliveObjects());

      // find collisions between the player ship and enemy bullets
      objects = quadtree.get(player);

      for (var i = 0, obj; obj = objects[i]; i++) {
        if (obj.type === 'hostile' && obj.collidesWith(player)) {
          gameOver();
        }
      }

      // find collisions between the player bullets and enemy ships
      for (var i = 0, bullet; bullet = liveBullets[i]; i++) {
        objects = quadtree.get(bullet);

        for (var j = 0, obj; obj = objects[j]; j++) {
          if (obj.type === 'enemy' && obj.collidesWith(bullet)) {
            bullet.timeToLive = 0;
            obj.timeToLive = 0;

            explosionPool.get();

            playerScore += 10;
            score.innerHTML = playerScore;
          }
        }
      }

      // spawn a new wave of enemies
      if (enemies.inUse === 0) {
        spawnWave();
      }
    },
    render: function() {
      background.render();
      player.render();
      bullets.render();
      enemies.render();
      enemyBullets.render();
    }
  });

  kontra.keys.bind('m', function() {
    toggleMusic();
  });

  kontra.keys.bind('p', function() {
    if (loop.isStopped) {
      loop.start();
      kontra.audios.kick_shock.play();
    }
    else {
      loop.stop();
      kontra.audios.kick_shock.pause();
    }
  });

  /**
   * Toggle the music on and off.
   */
  function toggleMusic() {
    kontra.audios.kick_shock.muted = !kontra.audios.kick_shock.muted;
    kontra.audios.game_over.muted = !kontra.audios.game_over.muted
    laserPool.toggleVolume();
    explosionPool.toggleVolume();
  }

  /**
   * Show the game over screen.
   */
  function gameOver() {
    loop.stop();
    document.getElementById('game-over').style.display = 'block';
    kontra.audios.kick_shock.pause();
    kontra.audios.game_over.currentTime = 0;
    kontra.audios.game_over.play();
  }

  /**
   * Start the game.
   */
  window.startGame = function() {
    document.getElementById('game-over').style.display = 'none';
    enemies.clear();
    enemyBullets.clear();
    bullets.clear();

    playerScore = 0;
    score.innerHTML = 0;

    loop.start();
    kontra.audios.game_over.pause();
    kontra.audios.kick_shock.currentTime = 0;
    kontra.audios.kick_shock.play();

    player.position.set(280, 270);
  };

  startGame();
});