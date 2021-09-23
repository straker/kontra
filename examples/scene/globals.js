export let gridSize = 32;
export let width = kontra.getCanvas().width / gridSize;
export let height = kontra.getCanvas().height / gridSize;

// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
