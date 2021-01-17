const backgroundClr = '00010f';
const lineClr = 'ef476f';
const lineAlpha = 128;
const lineVerticesNum = 10;
const lineNum = 300;
const maxFactor = 1;
const noiseFreq = 0.001;
const noiseAmplitude = 10;
const displayCircle = false;
const playBackSpeed = 2 * Math.PI / 360;
const noiseModSpeed = 10;

const render = false;

let factor = - Math.PI / 2;
let playbackSign = 1;
let r;
let c;


function setup() {
  createCanvas(1440, 1440);

  r = width / 2 - 100;

  c = new Fresco.Circle(12, r);
  c.color = colorFromHex(lineClr);

  if (render) {
      recordAnimation();
  }
}

function getLineExtremities(index, lineNum) {
  let angle = map(index % lineNum, 0, lineNum, 0, TWO_PI);
  let v = new p5.Vector.fromAngle(angle + PI);
  v.mult(r);
  v = createPoint(v.x, v.y);
  return v;
  
} 

function draw() {
  background(colorFromHex(backgroundClr));

  factor += playBackSpeed;

  if (displayCircle){
    c.draw();
  }

 for (let i = 0; i < lineNum; i++) {
  let a = getLineExtremities(i, lineNum); 
  let b = getLineExtremities(i * map(Math.sin(factor), -1, 1, 0, maxFactor), lineNum);

  // create new subdivided line
  let l = new Fresco.Line(a, b, lineVerticesNum);
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
  }

  // draw
  l.draw();
 }

 if (render && frameCount > 2 * PI / playBackSpeed) {
    stopRecording();
 }
}
