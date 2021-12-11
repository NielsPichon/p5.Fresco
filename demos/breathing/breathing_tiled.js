const backgroundClr = '00010f';
const lineClr = 'ef476f';
const lineAlpha = 255;
const lineVerticesNum = 5;
const lineNum = 75;
const maxFactor = 1;
const noiseFreq = 0.001;
const noiseAmplitude = 30;
const displayCircle = false;
const noiseModSpeed = 10;

const div_h = 4;
const div_v = 6;

const render = false;

let factor = Math.PI / 2;
let playbackSign = 1;
let r;
let c;
const incr = 1440 / (div_h + 1);
let offset;
const scaling = 1 / (div_h + 2);
let numSteps = div_h * div_v;
const playBackSpeed = Math.PI / numSteps;

function setup() {
  createCanvas(1440, 1440 * sqrt(2));
  setSeed()

  r = width / 2 - 100;

  c = new Fresco.Circle(12, r);
  c.color = colorFromHex(lineClr);

  if (render) {
      recordAnimation();
  }

  offset = createVector(- incr * (div_h - 1) / 2, incr * (div_v - 1) / 2);

  background(colorFromHex(backgroundClr));
  print('Tot segments', div_h * div_v * lineNum * (lineVerticesNum - 1));
}

function getLineExtremities(index, lineNum) {
  let angle = map(index % lineNum, 0, lineNum, 0, TWO_PI);
  let v = new p5.Vector.fromAngle(angle + PI);
  v.mult(r);
  v = createPoint(v.x, v.y);
  return v;
  
} 

function draw() {
  // background(colorFromHex(backgroundClr));

  if (displayCircle){
    c.draw();
  }

 for (let i = 0; i < lineNum; i++) {
  let a = getLineExtremities(i, lineNum); 
  let b = getLineExtremities(i * map(Math.sin(factor), -1, 1, 0, maxFactor), lineNum);

  // create new subdivided line
  let l = new Fresco.Line(a, b, lineVerticesNum);
  l.isPolygonal = false;
  l.color = colorFromHex(lineClr, lineAlpha);

  // displace line vertices
  for (let j = 1; j < l.vertices.length - 1; j++) {
    // for each loop iteration

    // Create noise
    let noiseVect = noiseVector(
      normalizedRidgedNoise, 
      l.vertices[j].x * noiseFreq,
      l.vertices[j].y * noiseFreq, 
      frameCount * noiseFreq * noiseModSpeed
    );
    noiseVect.mult(noiseAmplitude);
    // Add noise = displace vertex based on noise
    l.vertices[j].add(noiseVect);
    // Check if vertex is still in the circle
    if (l.vertices[j].magSq() > r * r) {
      // If out, bring back on circle
      l.vertices[j] = l.vertices[j].normalize().mult(r);
    }
    
    // move and scale according to grid
    l.vertices[j].mult(createVector(scaling, scaling));
    l.vertices[j].add(offset);
  }
  l.vertices[l.vertices.length - 1].mult(createVector(scaling, scaling));
  l.vertices[l.vertices.length - 1].add(offset);
  l.vertices[0].mult(createVector(scaling, scaling));
  l.vertices[0].add(offset);


  // draw
  l.draw();
 }

 offset.x += incr;
 if (offset.x >= 1440 / 2) {
   offset.x = - incr * (div_h - 1) / 2;
   offset.y -= incr;
 }

 if (render && frameCount > 2 * PI / playBackSpeed) {
    stopRecording();
 }

 if (frameCount >= numSteps) {
   noLoop();
 }

 factor += playBackSpeed;

}
