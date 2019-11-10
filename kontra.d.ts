declare namespace kontra {
  function on(event: string, callback: Function): void;
  function off(event: string, callback: Function): void;
  function emit(event: string, ...args: any): void;
  function getCanvas(): HTMLCanvasElement;
  function getContext(): CanvasRenderingContext2D;
  function init(canvas?: string | HTMLCanvasElement): any;
  class Animation {
    constructor(properties: {spriteSheet: SpriteSheet, frames: number[], frameRate: number, loop?: boolean});
    spriteSheet: SpriteSheet;
    frames: number[];
    frameRate: number;
    loop: boolean;
    width: number;
    height: number;
    margin: number;
    clone(): Animation;
    reset(): void;
    update(dt?: number): void;
    render(properties: {x: number, y: number, width?: number, height?: number, context?: CanvasRenderingContext2D}): void;
  }
  let imageAssets: any;
  let audioAssets: any;
  let dataAssets: any;
  function setImagePath(path: string): void;
  function setAudioPath(path: string): void;
  function setDataPath(path: string): void;
  function loadImage(url: string): Promise<HTMLImageElement>;
  function loadAudio(url: string): Promise<HTMLAudioElement>;
  function loadData(url: string): Promise<any>;
  function load(urls: string | string[]): Promise<any>;
  function collides(object1: any, object2: any): boolean | null;
  class GameLoop {
    constructor(properties: {update: Function, render: Function, fps?: number, clearCanvas?: boolean});
    update(dt: number): void;
    render(): void;
    isStopped: boolean;
    start(): void;
    stop(): void;
  }
  let keyMap: any;
  function initKeys(): void;
  function bindKeys(keys: string | string[]): void;
  function unbindKeys(keys: string | string[]): void;
  function keyPressed(key: string): boolean;
  function registerPlugin(kontraObj: any, pluginObj: any): void;
  function unregisterPlugin(kontraObj: any, pluginObj: any): void;
  function extendObject(kontraObj: any, properties: any): void;
  let pointer: any;
  function initPointer(): void;
  function track(objects: any | any[]): void;
  function untrack(objects: any | any[]): void;
  function pointerOver(object: any): boolean;
  function onPointerDown(callback: Function): void;
  function onPointerUp(callback: Function): void;
  function pointerPressed(button: string): boolean;
  class Pool {
    constructor(properties: {create: Function, maxSize?: number});
    objects: any[];
    size: number;
    maxSize: number;
    get(properties: any): any;
    getAliveObjects(): any[];
    clear(): void;
    update(dt?: number): void;
    render(): void;
  }
  class Quadtree {
    constructor(properties: {maxDepth?: number, maxObjects?: number, bounds?: any});
    maxDepth: number;
    maxObjects: number;
    bounds: any;
    clear(): void;
    get(object: any): any[];
    add(objects: any | any[]): void;
  }
  class Vector {
    constructor(x?: number, y?: number);
    add(vector: Vector, dt?: number): Vector;
    clamp(xMin: number, yMin: number, xMax: number, yMax: number): void;
    x: number;
    y: number;
  }
  class GameObject {
    constructor(properties: {x: number, y: number, dx?: number, dy?: number, ddx?: number, ddy?: number, color?: string, width?: number, height?: number, ttl?: number, rotation?: number, anchor?: number, context?: CanvasRenderingContext2D, update?: Function, render?: Function, ...props: any});
    init(properties: any): void;
    position: Vector;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
    color: string;
    localPosition: Vector;
    localRotation: Vector;
    parent: GameObject;
    children: GameObject[];
    velocity: Vector;
    acceleration: Vector;
    rotation: number;
    ttl: number;
    anchor: any;
    sx: number;
    sy: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    ddx: number;
    ddy: number;
    viewX: number;
    viewY: number;
    isAlive(): boolean;
    update(dt?: number): void;
    advance(dt?: number): void;
    render(): void;
    draw(): void;
  }
  class Sprite extends GameObject {
    constructor(properties: {image?: HTMLImageElement | HTMLCanvasElement, animations?: any});
    width: number;
    height: number;
    image: HTMLImageElement | HTMLCanvasElement;
    animations: any;
    currentAnimation: Animation;
    playAnimation(name: string): void;
  }
  class SpriteSheet {
    constructor(properties: {image: HTMLImageElement | HTMLCanvasElement, frameWidth: number, frameHeight: number, frameMargin?: number, animations?: any});
    animations: any;
    image: HTMLImageElement | HTMLCanvasElement;
    frame: any;
    createAnimations(animations: any): void;
  }
  function setStoreItem(key: string, value: any): void;
  function getStoreItem(key: string): any;
  class TileEngine {
    constructor(properties: {width: number, height: number, tilewidth: number, tileheight: number, context?: CanvasRenderingContext2D, tilesets: any[], layers: any[]});
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    layers: any[];
    tilesets: any[];
    context: CanvasRenderingContext2D;
    mapwidth: number;
    mapheight: number;
    sx: number;
    sy: number;
    render(): void;
    renderLayer(name: string): void;
    layerCollidesWith(name: string, object: any): boolean;
    tileAtLayer(name: string, position: any): number;
    setTileAtLayer(name: string, position: any, tile: number): void;
    setLayer(name: string, data: number[]): void;
    addObject(object: any): void;
    removeObject(object: any): void;
  }
}

export = kontra