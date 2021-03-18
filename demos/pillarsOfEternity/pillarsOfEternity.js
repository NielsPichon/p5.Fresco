const backgroundClr = '000';
const lineColorClose = 'fff';
const lineColorFar = 'fff';
const fillColorClose = '000';
const fillColorFar = '000';
const lineOpacityClose = 255;
const lineOpacityFar = 0;
const fill = false;
const dotsRadius = 0;
const subDLvl = 3;
const noiseFreq = 0.01;
const noiseAmplitude = 10;
const maxFaceSize = 20;
const minFaceSize = 10;
const perspectiveAngle = Math.PI / 8;
const maxLevels = 20;
const minLevels = 15;
const numPillars = 5;
const speed = -0.005;

const xStart = 600;
const xStop = 200;
const yStop = 200;

const drawPts = true;
const drawLines = true;

let s = [];
let lowExt;
let highExt; 

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  for (let i = 0; i < numPillars;  i++) {
    s.push(new Pillar(subDLvl, Math.floor(random(minLevels, maxLevels + 1))));
  }

  lowExt = createVector(xStart, -(height / 2) * 1.2, 0);
  highExt = createVector(xStop, yStop, 0);
}


// draw function which is automatically
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

  let t = 0;
  for (let i = 0; i < numPillars; i++) {
    t = (i / (numPillars) + frameCount * speed) % 1;
    while (t < 0) {
      t += 1;
    }
    let newPos = lerpVector(lowExt, highExt, t);
    s[i].setPosition(newPos);
    let col = colorInterp(
      t * t * t, [colorFromHex(lineColorClose, lineOpacityClose),
        colorFromHex(lineColorFar, lineOpacityFar)]);
    if (fill) {
      let fillCol = colorInterp(
        t * t * t, [colorFromHex(fillColorClose, lineOpacityClose),
          colorFromHex(fillColorFar, lineOpacityFar)]);
      s[i].setFillColor(fillCol);
    }
    s[i].setColor(col);
    if (drawPts) {
      s[i].drawPoints();
    }
    if (drawLines) {
      s[i].draw();
    }
    newPos.x *= -1;
    s[i].setPosition(newPos);

    if (drawPts) {
      s[i].drawPoints();
    }
    if (drawLines) {
      s[i].draw();
    }
  }
}


class Pillar {
  constructor(subDLvl, levels) {
    this.levels = [];
    this.heights = [];
    let size = 0;
    let vOffset = 0;
    for (let i = 0; i < levels; i++) {
      size = random(50, 100);
      this.levels.push(new NoisyCube(size, subDLvl));
      this.levels[i].setPosition(createVector(0, vOffset, 0));
      this.heights.push(createVector(0, vOffset, 0));
      vOffset += size;
    }
  }

  draw() {
    for (let i = 0; i < this.levels.length; i++) {
      this.levels[i].draw();
    }
  }

  drawPoints() {
    for (let i = 0; i < this.levels.length; i++) {
      this.levels[i].drawPoints();
    }
  }

  setPosition(position) {
    for (let i = 0; i < this.levels.length; i++) {
      this.levels[i].setPosition(position.copy().add(this.heights[i]));
    }
  }

  setColor(color) {
    for (let i = 0; i < this.levels.length; i++) {
      this.levels[i].setColor(color);
    }    
  }

  setFillColor(color) {
    for (let i = 0; i < this.levels.length; i++) {
      this.levels[i].setFillColor(color);
    }    
  }
}


class NoisyCube {
  constructor(size, subDivisionLevel) {
    this.faces = [];
    this.size = size;
    this.position = createVector(0, 0, 0);

    // spawn 4 faces (we omit the top and bottom faces)
    for (let i = 0; i < 4; i++) {
      this.faces.push(new Fresco.Square(this.size));
      this.faces[i] = subdivide(this.faces[i], subDivisionLevel);
      for (let j = 0; j < this.faces[i].vertices.length; j++) {
        this.faces[i].vertices[j].radius = dotsRadius;
      }
    }

    // Deform faces
    let k = 0;
    for (let i = 0; i < 4; i++)
    {
      for (let j = 2 * (subDivisionLevel + 1) + 1; j < 3 * (subDivisionLevel + 1); j++) {
        let n = noiseVector(perlin, (this.faces[i].vertices[j].x + width / 2) * noiseFreq,
        (this.faces[i].vertices[j].y + height / 2) * noiseFreq).mult(noiseAmplitude);
        this.faces[i].vertices[j].add(n);
      }

      this.faces[i].vertices.splice(0, subDivisionLevel + 1);
    }

    // rotate faces
    this.rotation = createVector(random(0, 2 * Math.PI), perspectiveAngle);
    let center = createVector(0, 0, -this.size / 2);
    for (let i = 0; i < 4; i++) {
      let angleX = this.rotation.x + i * Math.PI / 2;
      for (let j = 0; j < this.faces[i].vertices.length; j++) {
        this.faces[i].vertices[j] = yRotatePoint(this.faces[i].vertices[j], center, angleX);
        this.faces[i].vertices[j] = xRotatePoint(this.faces[i].vertices[j], center, perspectiveAngle);
      }
    }
  }

  setPosition(position) {
    for (let i = 0; i < 4; i++) {
      this.faces[i].position = position;
    }
  }

  setColor(color) {
    for (let i = 0; i < 4; i++) {
      this.faces[i].color = color;
      for (let j = 0; j < this.faces[i].vertices.length; j++) {
        this.faces[i].vertices[j].color = color;
      }
    }
  }

  setFillColor(color) {
    for (let i = 0; i < 4; i++) {
      this.faces[i].noFill = false;
      this.faces[i].fillColor = color;
    }
  }

  draw() {
    for (let i = 0; i < 4; i++) {
      this.faces[i].draw();
    }
  }

  drawPoints() {
    for (let i = 0; i < 4; i++) {
      this.faces[i].drawPoints();
    }
  }
}


function yRotatePoint(pt, center, angle) {
  let X = pt.x - center.x;
  let Z = pt.z - center.z;
  let newX = Z * Math.sin(angle) + X * Math.cos(angle);
  let newZ = Z * Math.cos(angle) - X * Math.sin(angle);

  pt.x = center.x + newX;
  pt.z = center.z + newZ;
  return pt;
}


function xRotatePoint(pt, center, angle) {
  let Y = pt.y - center.y;
  let Z = pt.z - center.z;
  let newY = Z * Math.sin(angle) + Y * Math.cos(angle);
  let newZ = Z * Math.cos(angle) - Y * Math.sin(angle);

  pt.y = center.y + newY;
  pt.z = center.z + newZ;
  return pt;
}