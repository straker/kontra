/**
 * The grid automatically positions each object based on the grids [flow](/api/grid#flow). This means you do not need to set the x/y position of any of the objects and can let the grid handle that for you. This makes it extremely easy to set up UI elements such as menus without having to hand place each one.
 *
 * @sectionName Basic Use
 * @example
 * // exclude-code:start
 * let { Text, Grid } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Text, Grid } from 'kontra';
 * // exclude-script:end
 *
 * let textOptions = {
 *   color: 'white',
 *   font: '20px Arial, sans-serif'
 * };
 *
 * let start = Text({
 *   text: 'Start',
 *   ...textOptions
 * });
 *
 * let options = Text({
 *   text: 'Options',
 *   ...textOptions
 * });
 *
 * let quit = Text({
 *   text: 'Quit',
 *   ...textOptions
 * });
 *
 * let menu = Grid({
 *   x: 300,
 *   y: 100,
 *   anchor: {x: 0.5, y: 0.5},
 *   // exclude-code:start
 *   context: context,
 *   // exclude-code:end
 *
 *   // add 15 pixels of space between each row
 *   rowGap: 15,
 *
 *   // center the children
 *   justify: 'center',
 *
 *   children: [start, options, quit]
 * });
 *
 * menu.render();
 */

 /**
  * The grid supports properties on the child objects that change how the child is positioned within the grid.
  *
  * - `alignSelf` - *String*. Align this item individually in the grid, overriding the grids [align](/api/grid#align) setting.
  * - `justifySelf` - *String*. Justify this item individually in the grid, overriding the grids [justify](/api/grid#justify) setting.
  * - `colSpan` - *Number*. Have the item take up more than 1 column. Great for menu titles.
  *
  * @sectionName Child Properties
  */