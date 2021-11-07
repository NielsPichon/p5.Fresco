const backgroundClr = '000'; // color of the background
const shapeFill = true; // whether cells should be filled
const shapeFillCrl = ['fff', 'f00', 'ff0', '00f']; // color of the fill
const shapeFillOpacity = 255;
const lineClr = '000';
const lineOpacity = 255;
const lineThickness = 3;

const maxCellWeight = 1; // what is the max weight of an unsubdivided cell
const minCellSize = 10;
const noiseFreq = 0.01; // noise frequency
const noiseSpeed = 0.1; // how fast noise oscillates
const noiseSymmetry = false; // offset coordinates to break symmetry
const asymmetry = true; // should cells be split symmetrically (meaning both horizontally and vertically at once).
const privilegedDir = 0; // if 0, splits will happen with random direction 
                         // if has the choice. if 1 horizontal if have
                         // the choice, if -1 vertical.
const areaWeighting = 0.1; // power of the area. The lower, the larger the impact of noise
const cellShape = 'rect'; // either 'circle' or 'rect'. This only affects the render, not the quadtree algorithm

const record = false;

let t = 0;

// Converts the type string into the required class
let cellType = Fresco.Circle;
if (cellShape == 'rect') {
  cellType = Fresco.Rect;
}


function setup() {
  createCanvas(1440, 1440);
  setSeed();

  if (record) {
    recordAnimation();
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  setBackgroundColor(colorFromHex(backgroundClr));
  let root = new Cell(0, 0, width, height);
  root.drawCell();
  t += noiseFreq;
}


class Cell extends cellType {
  constructor(centerX, centerY, w, h) {
    // Use the appropriate constructor for the class
    if (cellShape == 'rect') {
      super(w, h);
    }
    else {
      super(Math.min(w, h) / 2);
    }
    // set the width height and position of the cell
    this.position = createVector(centerX, centerY);
    this.width = w;
    this.height = h;

    // set lines color
    this.color = colorFromHex(lineClr, lineOpacity);
    
    this.noFill = !shapeFill;

    // If we want to break the symmetry, we offset the coordinates
    // so that they are always positive, as perlin and star noises are symmetric
    // functions
    let offsetX = 0;
    let offsetY = 0;
    if (!noiseSymmetry) {
      offsetX = width / 2;
      offsetY = this.height / 2
    }
    // choose fill color randomly. We use a pseudo random noise to keep it constant over time
    let n = perlin(this.position.x + offsetX, this.position.y + offsetY);
    let colorIdx = Math.floor(n * shapeFillCrl.length);
    this.fillColor = colorFromHex(shapeFillCrl[colorIdx], shapeFillOpacity);
    this.strokeWeight = lineThickness; 

    this.children = [];

    // while cells are larger than a minimum size, subdivide
    if (this.width / 2 > minCellSize || this.height / 2 > minCellSize) {
      // compute cell weight
      let weight = this.computeWeight();
      // if weight is too large, subdivide
      if (weight > maxCellWeight) {
        // if symmetric subdivision, create 4 subcells for each quadrant
        if (!asymmetry) {
          this.children.push(new Cell(this.position.x - this.width / 4, this.position.y - this.height / 4, this.width / 2, this.height / 2));
          this.children.push(new Cell(this.position.x - this.width / 4, this.position.y + this.height / 4, this.width / 2, this.height / 2));
          this.children.push(new Cell(this.position.x + this.width / 4, this.position.y - this.height / 4, this.width / 2, this.height / 2));
          this.children.push(new Cell(this.position.x + this.width / 4, this.position.y + this.height / 4, this.width / 2, this.height / 2));
        }
        else {
          // break noise symmetry if required
          let offsetX = 0;
          let offsetY = 0;
          if (!noiseSymmetry) {
            offsetX = width / 2;
            offsetY = this.height / 2
          }
          // randomly choose subdivision direction if cell is not squared, unless a prefered direction is set
          let dir = perlin(this.position.x + offsetX, this.position.y + offsetY);
          if (this.width > this.height || (this.width == this.height && ((dir > 0.5 && privilegedDir != -1) || privilegedDir == 1))) {
            this.children.push(new Cell(this.position.x - this.width / 4, this.position.y, this.width / 2, this.height));
            this.children.push(new Cell(this.position.x + this.width / 4, this.position.y, this.width / 2, this.height));          
          }
          else {
            this.children.push(new Cell(this.position.x , this.position.y - this.height / 4, this.width, this.height / 2));
            this.children.push(new Cell(this.position.x , this.position.y + this.height / 4, this.width, this.height / 2));              
          }
        }
      }
    }
  }

  computeWeight() {
    // break noise symmetry if required
    let offsetX = 0;
    let offsetY = 0;
    if (!noiseSymmetry) {
      offsetX = width;
      offsetY = height;
    }
    // get noise as "density" of the cell
    let density = perlin(
      (this.position.x + offsetX) * noiseFreq,
      (this.position.y + offsetY) * noiseFreq, t);
    
    // multiply the density by a weighted area of the cell. The weighting is
    // important to control the range of cell sizes we can get
    return density * Math.pow(this.width * this.height, areaWeighting);
  }

  drawCell() {
    // draw this cell
    this.draw();
    // draw children cells and their respective children reccursively
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].drawCell();
    }
  }
}