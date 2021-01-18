const backgroundClr = '000'; // color of the background
const lineResolution = 1000; // number of points on a line
const numLines = 100; //number of lines to draw
const circleRadius = 0.8; // radius of the circle as a
                          // percentage of the width
const minSinPeriod = 3; // min number of periods in the window width
const maxSinPeriod = 20; // max number of periods in the window width
const sinAmplitude = 30; // amplitude of the sine wave
const margin = 0.1; // margin in percentage of canvas width
const shape = 'triangle'; // shape to draw sine waves inside
                          // of, either 'circle' or 'triangle'

let s; // line shape
let yOffset;; // offset bewteen lines in pixels
let radius; // radius of the circle in pixels
let minFreq; // min sine wave frequency in pixels
let maxFreq; // max sine wave frequency in pixels

let minYL;  // height of bottom left vertex
let minYR;  // height of bottom right vertex
let maxYL;  // height of top left vertex
let maxYR;  // height of top right vertex

function setup() {
  createCanvas(1050, 1485);
  background(colorFromHex(backgroundClr));
  setSeed();

  // Create the line with specified resolution
  // spnning accross the canvas
  s = new Fresco.Line(
    createVector(-width * (0.5 - margin), 0),
    createVector(width * (0.5 - margin), 0), lineResolution
  );
  s.isPolygonal = true;

  // set initial line height
  s.position.y = height * (0.5 - margin);

  // compute interval between lines
  yOffset = height / (numLines + 2);

  // compute radius in pixel
  radius = width * circleRadius / 2;

  // compute min freq in pixels
  minFreq = 1 / width * maxSinPeriod;
  maxFreq = 1 / width * minSinPeriod;

  // init drawing bounds
  maxYL = - height / 2;
  minYL = height / 2;
  maxYR = - height / 2;
  minYR = height / 2;
}

// draw function which is automatically 
// called in a loop
function draw() {
  // offset line
  s.position.y -= yOffset

  // if reached the bottom, stop
  if (s.position.y <= -height * (0.5 - margin)) {
    s.position.y += yOffset;   
    // draw line to the left
    drawLine(
      createVector(-width * (0.5 - margin),
        minYL),
      createVector(-width * (0.5 - margin),
        maxYL)
    );
    // draw line to the right
    drawLine(
      createVector(width * (0.5 - margin),
        minYR),
      createVector(width * (0.5 - margin),
        maxYR)
    );

    noLoop()
  }
  else {
    // create a random offset
    let phase = random() * width;

    // compute the current freq
    let t = (s.position.y + height * (0.5 - margin)) /
      (height * (1 - 2 * margin));
    let freq = minFreq * (1 - t) + maxFreq * t;

    for (let i = 0 ; i < s.vertices.length; i++) {
      // if vertex within the inner circle, align
      // it to sine wave
      if (!isInShape(createPoint(s.vertices[i].x, s.position.y), radius)) {
        s.vertices[i].y = sinAmplitude * Math.sin(
          s.vertices[i].x * freq + phase);
      }
      else {
        // otherwise lay flat
        s.vertices[i].y = 0;
      }

    }
    
    // store the bounds of the drawing
    let L = s.vertices[0].y + s.position.y;
    let R = s.vertices[s.vertices.length - 1].y + s.position.y
    if (L < minYL) {
      minYL = L;
    }
    if (L > maxYL) {
      maxYL = L;
    }
    if (R < minYR) {
      minYR = R;
    }
    if (R > maxYR) {
      maxYR = R;
    }

    
    // draw the line
    s.draw();
  }
}


/**
 * Checks whther a point is inside a shape specified by the user
 * @param {p5.Vector} point Point to check
 * @param {number} dim Main dimension of the shape
 */
function isInShape(point, dim) {
  if (shape == 'circle') {
    return isInCircle(point, dim);
  }
  else {
    return isInTriangle(point, dim);
  }
}

/**
 * Checks whether a point is inside a circle of specified radius centered on 0,0
 * @param {p5.Vector} point point to check
 * @param {number} radius radius of the triangle
 */
function isInCircle(point, radius) {
  return (point.magSq() < radius * radius);
}


/**
 * Checks whther a point is inside an equilateral triangle
 * of specified height, centered on 0, 0
 * @param {p5.Vector} point point to check
 * @param {number} triHeight height of the triangle
 */
function isInTriangle(point, triHeight) {
  if (abs(point.y) > triHeight * 0.5) {
    return false;
  }

  // base of an equilateral triangle is 4/3 its height
  let base = 4 / 3 * triHeight;
  // we use Thales theorem to compute the half width
  // of the triangle at the point height
  let x = (triHeight * 0.5 - point.y) / triHeight * (base * 0.5);
  
  return (Math.abs(point.x) < x)
}