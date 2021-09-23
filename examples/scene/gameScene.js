import { gridSize, width, height } from './globals.js';
import snake from './snake.js';

let apple = kontra.Sprite({
  x: 320,
  y: 320,
  width: gridSize - 1,
  height: gridSize - 1,
  color: 'red'
});

// keep track of where snake is so we know where we can place a new apple
let availableCells = [];

let gameScene = kontra.Scene({
  id: 'game',
  update() {
    // snake ate apple
    if (snake.x === apple.x && snake.y === apple.y) {
      snake.maxCells++;

      availableCells = [];
      for (let row = 0; row < height - 1; row++) {
        for (let col = 0; col < width - 1; col++) {
          let snakeCell = snake.cells.find(cell => {
            return cell.x === col * gridSize && cell.y === row * gridSize;
          });
          if (!snakeCell) {
            availableCells.push({ row, col });
          }
        }
      }

      let randomCell = kontra.randInt(0, availableCells.length - 1);
      apple.x = availableCells[randomCell].col * gridSize;
      apple.y = availableCells[randomCell].row * gridSize;
    }

    // check collision with all cells after this one
    snake.cells.forEach((cell, index) => {
      for (var i = index + 1; i < snake.cells.length; i++) {
        // snake occupies same space as a body part. reset game
        if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
          snake.x = 160;
          snake.y = 160;
          snake.cells = [];
          snake.maxCells = 4;
          snake.dx = gridSize;
          snake.dy = 0;

          apple.x = kontra.randInt(0, width) * gridSize;
          apple.y = kontra.randInt(0, height) * gridSize;
        }
      }
    });
  }
});

gameScene.addChild(snake);
gameScene.addChild(apple);

kontra.bindKeys('esc', () => {
  kontra.emit('navigate', 'Menu');
});

export default gameScene;
