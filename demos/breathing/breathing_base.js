const backgroundClr = '131619';
const lineClr = 'FF6B6B';
const lineAlpha = 128;
const lineVerticesNum = 1000;
const lineNum = 500;
const maxFactor = 3.5;
const noiseFreq = 0.002;
const noiseAmplitude = 20;
const maxNoiseFactor = 1;
const displayCircle = false;
const playBackSpeed = 2 * Math.PI / 360;
const noiseModSpeed = 10;
const startFactor =  0;
const tailLengthFactor = 2;
const globalRot = Math.PI / 8;
// const globalRot = - 3 * Math.PI / 4;
// const globalTranslationY = 350;
const globalTranslationY = -200;
const tailSharpness = 2;
const tailSharpness2 = 6;

const render = false;

let factor = startFactor;
let playbackSign = 1;
let r;
let c;


function setup() {
  createA4RatioCanvas(1440);
  setSeed(2847); // (freq (0.001), tailSharpness2 5) 7902, 4490 (20 points) , 1504 (50 points), 2267, 9092(1000 points), 2847 (1000 points, freq 0.002, tailSharpness 6), 8847 (globalRot = - 3 * Math.PI / 4  globalTranslationY = 300, noiseAmplitude 50, freq 0.002, 1000 points)

  r = width / 2 - 300;

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
  let b = getLineExtremities(
    i * map(Math.sin(factor), -1, 1, 0, maxFactor), lineNum);
  let extra = b.copy().normalize();
  let r = width / 2 - 300;
  let angle = - 3 * PI / 4;

  if (random() <.5) {
    let hole = max(0, extra.x * cos(angle) + extra.y * sin(angle))
        * (1 - 0 * noise(
          a.x * noiseFreq,
          a.y * noiseFreq,
          frameCount * noiseFreq * noiseModSpeed
    ));

    for (let k = 0; k < tailSharpness; k++) {
      hole = invertSmoothstep(hole);
    }

    b.add(extra.mult(r * tailLengthFactor * pow(hole, tailSharpness2)));
  }

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

      let amplitude =lerp(
        noiseAmplitude,
        noiseAmplitude * maxNoiseFactor,
        invertSmoothstep(constrain(0, 20, abs(i - 313)) / 313)
          * smoothstep(j / l.vertices.length)
      );
      noiseVect.mult(amplitude);
      // Add noise = displace vertex based on noise
      l.vertices[j].add(noiseVect);
      // Check if vertex is still in the circle
      // if (l.vertices[j].magSq() > r * r) {
      //   // If out, bring back on circle
      //   l.vertices[j] = l.vertices[j].normalize().mult(r);
      // }
    }

    l.vertices.forEach(v => {
      let x = v.x; y = v.y;
      v.y = -x;
      v.x = -y;
    });

    // draw
    l.setRotation(globalRot);
    l.setPosition(createPoint(0, globalTranslationY));
    l.draw();
  }
  noLoop()

 if (render && frameCount > 2 * PI / playBackSpeed) {
    stopRecording();
 }
}
