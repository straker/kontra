import bootScene from './boot.js';
import getGameScene from './galaxian.js';
import gameOverScene from './gameOver.js';

let gameScene;
let activeScene = bootScene;
let isGameOver = false;

let loop = kontra.GameLoop({
  update() {
    if (isGameOver) {
      gameOverScene.update();
    } else {
      activeScene.update();
    }
  },
  render() {
    activeScene.render();

    if (isGameOver) {
      gameOverScene.render();
    }
  }
});

// pause/unpause game
kontra.onKey('p', function () {
  if (loop.isStopped) {
    loop.start();
    kontra.audioAssets.kick_shock.play();
  } else {
    loop.stop();
    kontra.audioAssets.kick_shock.pause();
  }
});

kontra.on('startGame', () => {
  isGameOver = false;

  if (!gameScene) {
    gameScene = getGameScene();
  }

  bootScene.destroy();
  activeScene = gameScene;
  gameScene.start();
});

kontra.on('gameOver', () => {
  isGameOver = true;

  kontra.audioAssets.kick_shock.pause();
  kontra.audioAssets.game_over.currentTime = 0;
  kontra.audioAssets.game_over.play();
});

loop.start();
