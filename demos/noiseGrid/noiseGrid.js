const num_lines = 100;
const lines_resolution = 12;
const noiseFreq = 0.01;
const amplitude = 500;
const sphereRadius = 150;
const step = 1;
const mode = 'noise'; // 'sphere' // 'cube'
const poly = false;
const useVertLines = false;
const colors = [[93, 173, 234, 128], [153, 230, 255, 128], [0, 153, 115, 128]];
const backgroundClr = [1, 5, 63];

let lines = [];

function setup() {
  createCanvas(500, 500);

  // create a grid of lines
  for (let  i = 0; i < num_lines; i++) {
    append(lines, new Shape([createPoint(-width / 2, - height / 2 + (i + 1) * height / (num_lines + 1)),
      createPoint(width / 2, -height / 2 + (i + 1) * height / (num_lines + 1))]));
    if (useVertLines) {
      append(lines, new Shape([createPoint(
        -width / 2 + (i + 1) * width / (num_lines + 1), - height / 2),
        createPoint(-width / 2 + (i + 1) * width / (num_lines + 1), height / 2)]));
    }
  }

  // resample the lines and set them red, and then distort there respective positions
  let k;
  let t;
  for (let i = 0; i < lines.length; i++) {
    lines[i] = resample(lines[i], lines_resolution);
    lines[i].isPolygonal = poly;
    t = Math.floor(random(0, colors.length));
    lines[i].color = colors[t];
    for (k = 0; k < lines[i].vertices.length; k++) {
      lines[i].vertices[k] = distort(lines[i].vertices[k], funcHeight, amplitude, step);
    }
  }
}


function draw() {
  background(backgroundClr);

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