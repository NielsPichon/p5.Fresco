// algorithm adapted from https://arxiv.org/pdf/2004.06789.pdf

const backgroundClr = '000';
const color = 'fff';
const rMin = 3;
const rMax = 30;
const kNeighbours = 5;
const blackAsLarge = true;
const minOpacity = 0;
const maxOpacity = 255;
const displayRadius = 3;
const imgPath = 'img.jpg'
const imgSize = 1440;

let img;
let grid;
let pts = [];
let activePts = [];

function preload() {
  // load reference image
  img = loadImage('img.jpg')
}

function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed();

  initPoissonSampler();
}

// draw function which is automatically 
// called in a loop
function draw() {
  addPoints();
}


function initPoissonSampler() {
  // make sure we can retrieve the color data of the image
  img.loadPixels();

  // init the grid
  grid = new Array(width * height).fill([]);

  // create a first point in the center of the canvas
  let startPoint = createVector(width / 2, height / 2);
  startPoint.spheresphereRadius = getSphereRadiusAtPoint(startPoint);
  addPointToGrid(startPoint);
  stroke(colorFromHex(color, getOpacityAtPoint(startPoint)));
  strokeWeight(displayRadius);
  point(startPoint.x, startPoint.y);
}


function addPoints() {
  if (activePts.length > 0) {
    let ptsCount = 0;
    // choose random active point
    let idx = Math.floor(random(0, activePts.lenght));
    for (let k = 0; k < kNeighbours; k++) {
      let r = random(activePts[idx].sphereRadius, 2 * activePts[idx].sphereRadius);
      let theta = random(0 , 2 * Math.PI);
      let nu_pt = p5.Vector.fromAngle(theta).mult(r).add(activePts[idx]);
      nu_pt.sphereRadius = getSphereRadiusAtPoint(nu_pt);
      if (nu_pt.sphereRadius < rMax) {
        if (checkCanSpawn(nu_pt)) {
          addPointToGrid(nu_pt);
          ptsCount ++;
          stroke(colorFromHex(color, getOpacityAtPoint(nu_pt)));
          strokeWeight(displayRadius);
          point(nu_pt.x, nu_pt.y);
        }
      }
    }

    if (ptsCount == 0) {
      activePts.splice(idx, 1);
    }
  }
}


function addPointToGrid(pt) {
  pts.push(pt);
  activePts.push(pt);

  let [gridIdx, x, y] = getGridCoordinates(pt);

  // max distance in cell number on which this point has an influence
  // Each cell has a side length of rMin / sqrt(2);
  let maxDist = Math.floor(pt.sphereRadius / (rMin / sqrt(2)));

  for (let i = -maxDist; i < maxDist + 1; i++) {
    for (let j = -maxDist; j < maxDist + 1; j++) {
      // if cell is within bounds of image, store point idx as having influence
      if (i + x >= 0 && i + x < width &&
        j + y >= 0 && j + y < height) {
        grid[gridIdx + i + j * width].push(pts.length - 1);
      }
    }
  }
}


/**
 * Computes the value of the intensity of the pixel under
 * a point in the [0, 1] range and inverts it if required
 * @param {p5.Vector} pt 
 */
function getInterpolentAtPoint(pt) {
  let [idx, x, y] = getGridCoordinates(pt);

  // center rescaled image
  let xScaledImg = x - (width - imgSize) / 2;
  let yScaledImg = y - (height - imgSize) / 2;

  // if not in image, return black
  if (xScaledImg < 0 || xScaledImg >= imgSize || yScaledImg < 0 || yScaledImg >= imgSize) {
    if (!blackAsLarge) {
      return 1;
    }
    return 0;
  }

  // unscale image
  let xImg = Math.round(xScaledImg * img.width / imgSize);
  let yImg = Math.round(yScaledImg * img.height / imgSize);

  idx = xImg + yImg * img.width;

  let intensity = 0;
  for (let i = 0; i < 3; i++) {
    intensity += img.pixels[idx * 4 + i];
  }
  intensity /= 3.0;
  intensity /= 255;

  if (!blackAsLarge) {
    return 1 - intensity
  }
  return intensity;
}


function getSphereRadiusAtPoint(pt) {
  let t = getInterpolentAtPoint(pt);
  return rMin * t + (1 - t) * rMax;
}

function getOpacityAtPoint(pt) {
  let t = getInterpolentAtPoint(pt);
  return maxOpacity * t + (1 - t) * minOpacity;  
}


function getGridCoordinates(pt) {
  let x = Math.floor(pt.x);
  let y = Math.floor(pt.y);
  return [x + y * width, x, y];
}


function checkCanSpawn(pt) {
  if (pt.x < 0 || pt.x >= width || pt.y < 0 || pt.y >= height) {
    return false;
  }
  let [idx, x, y] = getGridCoordinates(pt);
  for (let i = 0; i < grid[idx].length; i++) {
    let d = distSquared(pt, pts[grid[idx][i]]);
    if (d <= pt.sphereRadius *  pt.sphereRadius &&
      d <= pts[grid[idx][i]].sphereRadius * pts[grid[idx][i]].sphereRadius) {
      return false;
    }
  }
  return true;
}
