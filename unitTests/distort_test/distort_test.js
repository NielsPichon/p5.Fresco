const num_lines = 10;
const lines_resolution = 12;
const noiseFreq = 0.01;
const amplitude = 500;
const sphereRadius = 150;
const step = 1;
const mode = 'noise'; // 'sphere' // 'cube'
const poly = false;

let lines = [];

function setup() {
  createCanvas(500, 500);

  // create a grid of lines
  for (let  i = 0; i < num_lines; i++) {
    lines.push(new Fresco.Line(createPoint(
      -width / 2, - height / 2 + (i + 1) * height / (num_lines + 1)),
      createPoint(width / 2, -height / 2 + (i + 1) * height / (num_lines + 1)),
      lines_resolution)
    );
    lines.push(new Fresco.Line(createPoint(
      -width / 2 + (i + 1) * width / (num_lines + 1), - height / 2),
      createPoint(-width / 2 + (i + 1) * width / (num_lines + 1), height / 2),
      lines_resolution)
    );
  }

  // resample the lines and set them red, and then distort there respective positions
  let k;
  for (let i = 0; i < lines.length; i++) {
    lines[i].color = [255, 0, 0, 255];
    lines[i].isPolygonal = poly;
    for (k = 0; k < lines[i].vertices.length; k++) {
      lines[i].vertices[k] = distort(lines[i].vertices[k], funcHeight, amplitude, step);
    }
  }
}


function draw() {
  background(0);
  strokeWeight(1);
  for (let x = -width / 2; x < width / 2; x++) {
    for (let y = -height / 2; y < height / 2; y++) {
      stroke(funcHeight(x, y) * 255);
      drawPoint(createVector(x, y));
    }
  }

  for (let  i = 0; i < lines.length; i++) {
    lines[i].draw();
  }

  noLoop()
}


function funcHeight(x, y) {
  if (mode == 'cube') {
    return cubeHeight(x, y);
  }
  else if (mode == 'sphere') {
    return sphereHeight(x, y);
  }
  return scaledNoise(x, y);
}


// A function that returns a half sphere bulging through the center of the image
function sphereHeight(x, y) {
  let r = sqrt(x * x + y * y);
  if (r > sphereRadius) {
    return 0;
  }
  
  return Math.sin(Math.acos(r / sphereRadius));
}


function cubeHeight(x, y) {
  if (Math.abs(x) > sphereRadius || Math.abs(y) > sphereRadius) {
    return 0;
  }
  return 1;
}

function scaledNoise(x, y) {
  return normalizedPerlin(noiseFreq * (x + width / 2),
    noiseFreq * (y + height / 2));
}