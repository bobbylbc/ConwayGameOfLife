import {Component, OnInit, ViewChild, AfterViewInit, HostListener, } from '@angular/core';

@Component({
  selector: 'app-mod1',
  templateUrl: './mod1.component.html',
  styleUrls: ['./mod1.component.css']
})


export class Mod1Component implements AfterViewInit, OnInit {

  // Fixed Variable
  singleBox: string = 'single box'; none: string = 'none'; spUp: string = 'spaceship go up'; spDown: string = 'spaceship go down';
  spLeft: string = 'spaceship go left'; spRight: string = 'spaceship go right';
  gun135: string = 'glider gun shoot 135'; gun315: string = 'glider gun shoot 315';
  gun225: string = 'glider gun shoot 225'; gun45: string = 'glider gun shoot 45';

  numberOfX: number = 180;
  numberOfY: number = 100;
  boxSize: number = 4;
  spaceBetweenBoxes: number = 1;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  activeColor: string = '#98FB98';
  deactColor: string = '#113311';

  currentFactor: number = 0;
  MAX_SCALE: number = 4;
  MIN_SCALE: number = 0;
  SCALE_FACTOR: number = 0.2;
  newScaleFactor: number = this.currentFactor;
  originX: number = 0;
  originY: number = 0;
  context: CanvasRenderingContext2D;
  canvas: any;
  matrix: any;

  requestId: any = undefined;
  items: any = [this.none, this.singleBox, this.spUp, this.spDown, this.spLeft, this.spRight, this.gun45,
  this.gun135, this.gun225, this.gun315];
  selectedLink: string = undefined;
  fullImagePath = '';
  isMobile = false;

  // Detect Window Width
  innerWidth: number;

  // FPS control
  then = Date.now();
  fps = 5;

  @ViewChild('gameOfLife') myCanvas;

  ngOnInit() {
    this.init();
    this.createRandomMock();
  }

  ngAfterViewInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d');
    this.currentFactor = -1; // Set to -1, to trigger function scaleCanvas
    this.scaleCanvas();
  }

  init() {
    this.checkIsMobile();

    this.matrix = this.generateMatrix();

    this.calculateCanvasSize();
  }

  checkIsMobile() {
    if (window.navigator.userAgent.indexOf('Android') !== -1 ||
      window.navigator.userAgent.indexOf('iPhone') !== -1) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  drawCanvas() {
    const ctx = this.context;
    const bs = this.boxSize;
    const sb = this.spaceBetweenBoxes;
    const mtx = this.matrix;
    ctx.clearRect(this.originX, this.originY, this.canvasWidth, this.canvasHeight);  // To draw canvas space 

    for (let x = 0; x < mtx.length; x++) {
      for (let y = 0; y < mtx[x].length; y++) {
        if (mtx[x][y] === false) {
          ctx.fillStyle = this.deactColor;
        } else {
          ctx.fillStyle = this.activeColor;
        }
        ctx.fillRect(x * bs + x * sb, y * bs + y * sb, bs, bs);
      }
    }
  }

  calculateCanvasSize() {
    this.canvasWidth = (this.numberOfX * this.boxSize) + (this.numberOfX * this.spaceBetweenBoxes);
    this.canvasHeight = (this.numberOfY * this.boxSize) + (this.numberOfY * this.spaceBetweenBoxes);
  }

  clearCanvas() {
    this.matrix = this.generateMatrix();
    this.drawCanvas();
    this.stop();

  }

  randomSetup() {
    this.createRandomMock();
    this.drawCanvas();
  }

  travelSetup() {
    this.createTravelMock();
    this.drawCanvas();
  }

  battleSetup1() {
    this.createBattleMock();
    this.drawCanvas();
  }

  clickNextEvent() {
    this.predictNextCellArrangement();
    this.drawCanvas();
  }

  autoplay() {
    if (this.requestId === undefined) {
      this.start();
    }
  }

  start() {
    this.requestId = requestAnimationFrame(() => {
      this.start();
    });

    const interval = 1000 / this.fps;
    const now = Date.now();

    const delta = now - this.then;
    if (delta > interval) {
      this.then = now - (delta % interval);
      this.clickNextEvent();
    }
  }

  stop() {
    if (this.requestId !== undefined) {
      cancelAnimationFrame(this.requestId);
      this.requestId = undefined;
    }
  }


  createRandomMock() {
    this.matrix = this.generateMatrix();
    const mtx = this.matrix;
    // generate random coordinates from total cells
    const numberOfRandomCells = Math.floor(Math.random() * (this.numberOfX * this.numberOfY));

    for (let i = 0; i < numberOfRandomCells; i++) {
      this.setCellTrue(mtx,
        Math.floor(Math.random() * (this.numberOfX)),
        Math.floor(Math.random() * (this.numberOfY)));
    }
    this.setCellTrue(mtx, Math.floor(this.numberOfX / 2), Math.floor(this.numberOfY / 2));
  }

  createTravelMock() {
    this.matrix = this.generateMatrix();
    const mtx = this.matrix;
    if (this.isMobile) {
      this.createSpaceship(3, 10, 'down');
      this.createSpaceship(23, 39, 'up');
    } else {
      this.createSpaceship(25, 70, 'up');
      this.createSpaceship(135, 25, 'down');
      this.createSpaceship(135, 65, 'left');
      this.createSpaceship(45, 10, 'right');
    }
  }

  createBattleMock() {
    this.matrix = this.generateMatrix();
    const mtx = this.matrix;
    if (this.isMobile) {
      this.createGliderGun(0, 45, 115);
      this.createGliderGun(0, 5, 315);
    } else {
      this.createGliderGun(5, 99, 45);
      this.createGliderGun(10, 70, 45);
      this.createGliderGun(15, 41, 45);
      this.createGliderGun(40, 99, 45);

      this.createGliderGun(145, 0, 225);
      this.createGliderGun(140, 31, 225);
      this.createGliderGun(135, 61, 225);
      this.createGliderGun(110, 0, 225);
    }
  }

  onClickCanvas(event: MouseEvent) {
    const selected = this.selectedLink;
    if (selected === undefined) {
      return;
    } else {
      console.log('pageX: ' + event.pageX + ', pageY: ' + event.pageY);
      console.log('offsetLeft: ' + this.canvas.offsetLeft + ', offsetTop: ' + this.canvas.offsetTop);
      const x = this.getCell(event.pageX - this.canvas.offsetLeft);
      const y = this.getCell(event.pageY - this.canvas.offsetTop);
      console.log('x: ' + x + ', y: ' + y);

      if (selected === this.singleBox) {
        if (this.matrix[x][y] === false) {
          this.setCellTrue(this.matrix, x, y);
        } else {
          this.setCellFalse(this.matrix, x, y);
        }
        this.drawCanvas();
      } else if (selected === this.spUp) {
        this.createSpaceship(x, y, 'up');
        this.drawCanvas();
      } else if (selected === this.spDown) {
        this.createSpaceship(x, y, 'down');
        this.drawCanvas();
      } else if (selected === this.spLeft) {
        this.createSpaceship(x, y, 'left');
        this.drawCanvas();
      } else if (selected === this.spRight) {
        this.createSpaceship(x, y, 'right');
        this.drawCanvas();
      } else if (selected === this.gun135) {
        this.createGliderGun(x, y, 135);
        this.drawCanvas();
      } else if (selected === this.gun315) {
        this.createGliderGun(x, y, 315);
        this.drawCanvas();
      } else if (selected === this.gun225) {
        this.createGliderGun(x, y, 225);
        this.drawCanvas();
      } else if (selected === this.gun45) {
        this.createGliderGun(x, y, 45);
        this.drawCanvas();
      }
    }
  }

  getCell(xy: number): number {
    return Math.floor(xy / (this.boxSize + (this.spaceBetweenBoxes)));
  }


  setradio(e: string): void {
    this.selectedLink = e;
    let img = this.fullImagePath;
    img = './assets/images/';

    switch (e) {
      case 'none':
        this.selectedLink = undefined;
        img = '';
        break;
      case this.singleBox:
        img = img + 'singleBox.png';
        break;
      case this.spDown:
        img = img + 'spDown' + '.png';
        break;
      case this.spUp:
        img = img + 'spUp' + '.png';
        break;
      case this.spRight:
        img = img + 'spRight' + '.png';
        break;
      case this.spLeft:
        img = img + 'spLeft' + '.png';
        break;
      case this.gun45:
        img = img + 'gun45' + '.png';
        break;
      case this.gun135:
        img = img + 'gun135' + '.png';
        break;
      case this.gun225:
        img = img + 'gun225' + '.png';
        break;
      case this.gun315:
        img = img + 'gun315' + '.png';
        break;
      default:
        img = '';
    }
    this.fullImagePath = img;
  }


  isSelected(name: string): boolean {
    if (!this.selectedLink) { // if no radio button is selected, always return false so every nothing is shown  
      return false;
    }
    return (this.selectedLink === name); // if current radio button is selected, return true, else return false  
  }


  /**
    Any live cell with fewer than two live neighbors dies, as if caused by under-population.
    Any live cell with two or three live neighbors lives on to the next generation.
    Any live cell with more than three live neighbors dies, as if by overcrowding.
    Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
  **/
  predictNextCellArrangement() {
    const tempMtx = this.generateMatrix();

    for (let x = 0; x < tempMtx.length; x++) {
      for (let y = 0; y < tempMtx[x].length; y++) {
        if (this.getActiveNeighbourCount(x, y) === 3) {
          this.setCellTrue(tempMtx, x, y);
        } else if (this.getActiveNeighbourCount(x, y) === 2 && this.matrix[x][y] === true) {
          this.setCellTrue(tempMtx, x, y);
        } else {
          this.setCellFalse(tempMtx, x, y);
        }
      }
    }
    this.matrix = tempMtx;
  }

  generateMatrix(): any {
    if (this.isMobile) {
      this.numberOfX = 50;
      this.numberOfY = 50;
      this.boxSize = 6;
    }
    let mtx: any;
    mtx = new Array(this.numberOfX);
    for (let x = 0; x < this.numberOfX; x++) {
      mtx[x] = new Array(this.numberOfY);
      for (let y = 0; y < this.numberOfY; y++) {
        this.setCellFalse(mtx, x, y);
      }
    }
    return mtx;
  }

  isValidCell(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.numberOfX || y >= this.numberOfY) {
      return false;
    }
    return true;
  }

  isValidCellFlipped(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.numberOfY || y >= this.numberOfX) {
      return false;
    }
    return true;
  }

  setCellTrue(mtx: any, x: number, y: number) {
    if (this.isValidCell(x, y)) {
      mtx[x][y] = true;
    }
  }

  setCellTrueFlip(mtx: any, x: number, y: number, isXYFlipped: boolean) {
    if (isXYFlipped) {
      if (this.isValidCellFlipped(x, y)) {
        mtx[y][x] = true;
      }
    } else {
      if (this.isValidCell(x, y)) {
        mtx[x][y] = true;
      }
    }
  }


  setCellFalse(mtx: any, x: number, y: number) {
    if (this.isValidCell(x, y)) {
      mtx[x][y] = false;
    }
  }


  getActiveNeighbourCount(x: number, y: number): number {
    const mtx = this.matrix;
    const ctx = this.context;
    let activeCounter = 0;

    activeCounter += this.checkNeighbour(x - 1, y - 1); // Check TopLeft
    activeCounter += this.checkNeighbour(x, y - 1); // Check Top
    activeCounter += this.checkNeighbour(x + 1, y - 1); // Check TopRight
    activeCounter += this.checkNeighbour(x - 1, y); // Check Left
    activeCounter += this.checkNeighbour(x + 1, y); // Check Right
    activeCounter += this.checkNeighbour(x - 1, y + 1); // Check BottomLeft
    activeCounter += this.checkNeighbour(x, y + 1); // Check Bottom
    activeCounter += this.checkNeighbour(x + 1, y + 1); // Check BottomRight

    return activeCounter;
  }

  checkNeighbour(x: number, y: number): number {
    const mtx = this.matrix;
    if (x < 0 || y < 0 || x >= this.numberOfX || y >= this.numberOfY) {
      return 0;
    } else {
      if (mtx[x][y] === true) {
        return 1;
      }
    }
    return 0;
  }

  scaleCanvas() {
    let newScale: number;
    if (this.newScaleFactor !== this.currentFactor) {
      newScale = 1 / (1 + ((this.currentFactor)));
      this.context.scale(newScale, newScale);

      newScale = 1 + ((this.newScaleFactor));
      this.context.scale(newScale, newScale);

    } else {
      return;
    }

    this.drawCanvas(); // Redraw
    this.currentFactor = this.newScaleFactor; // Update variable
  }


  /** Game of Life Objects **/
  createGliderGun(x: number, y: number, angle: number) {
    const mtx = this.matrix;
    const c = 13;
    let flip = -1;
    let flip2 = 1;
    let isXYFlipped = false;
    if (angle === 315 || angle === 45) {
      flip = 1;
    }
    if (angle === 45 || angle === 135) {
      flip2 = -1;
    }
    if (angle === 225 || angle === 45) {
      const temp = x;
      x = y;
      y = temp;
      isXYFlipped = true;
    }

    this.setCellTrueFlip(mtx, x, y, isXYFlipped);
    this.setCellTrueFlip(mtx, x + (1 * flip2), y, isXYFlipped);
    this.setCellTrueFlip(mtx, x + (1 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x, y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (10 * flip2), y, isXYFlipped);
    this.setCellTrueFlip(mtx, x + (10 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (10 * flip2), y + (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (11 * flip2), y + (3 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (12 * flip2), y + (4 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (13 * flip2), y + (4 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (11 * flip2), y - (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (12 * flip2), y - (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (13 * flip2), y - (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (14 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (15 * flip2), y - (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (15 * flip2), y + (3 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (16 * flip2), y, isXYFlipped);
    this.setCellTrueFlip(mtx, x + (16 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (16 * flip2), y + (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (17 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (20 * flip2), y, isXYFlipped);
    this.setCellTrueFlip(mtx, x + (21 * flip2), y, isXYFlipped);
    this.setCellTrueFlip(mtx, x + (20 * flip2), y - (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (21 * flip2), y - (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (20 * flip2), y - (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (21 * flip2), y - (2 * flip), isXYFlipped);

    this.setCellTrueFlip(mtx, x + (22 * flip2), y - (3 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (24 * flip2), y - (3 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (24 * flip2), y - (4 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (22 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (24 * flip2), y + (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (24 * flip2), y + (2 * flip), isXYFlipped);

    this.setCellTrueFlip(mtx, x + (34 * flip2), y - (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (35 * flip2), y - (2 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (34 * flip2), y - (1 * flip), isXYFlipped);
    this.setCellTrueFlip(mtx, x + (35 * flip2), y - (1 * flip), isXYFlipped);
  }



  createSpaceship(x: number, y: number, direction: string) {
    const mtx = this.matrix;
    const c = 13;
    let flip = 1;
    let isXYFlipped = false;
    if (direction === 'down' || direction === 'right') {
      flip = -1;
    }
    if (direction === 'left' || direction === 'right') {
      const temp = x;
      x = y;
      y = temp;
      isXYFlipped = true;
    }
    for (let i = 0; i < 2; i++) {
      const k = i === 1 ? -1 : 1;
      this.setCellTrueFlip(mtx, x + (i * c), y, isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c), y + (1 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + 1, y + (2 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) - 1, y + (2 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c), y + (3 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c), y + (4 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 1), y + (5 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 1), y + (7 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 2), y + (7 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 3), y + (7 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 4), y + (7 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 5), y + (5 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 5), y + (6 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 6), y + (5 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 6), y + (6 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 3), y + (9 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 4), y + (10 * flip), isXYFlipped);
      this.setCellTrueFlip(mtx, x + (i * c) + (k * 5), y + (10 * flip), isXYFlipped);
    }
  }
}
