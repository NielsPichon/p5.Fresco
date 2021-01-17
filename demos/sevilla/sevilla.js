const circleNum = 10;
const lineWeight = 1;
const circleOffset = 1;
const ringOffset = circleOffset * circleNum;
const noiseFreq = 0.005;
const noiseAmplitude = 0.5; // distortion amount
const color = 'fff';
const backgroundClr = '000';
const minRadius = 10;
const fadeWidth = 200;

const margins = 110;

const render = true;

let r = minRadius;
let circleCount = 0;

function setup() {
  createCanvas(1220, 1220);
  background(colorFromHex(backgroundClr));

  if (render) {
    recordAnimation();
  }
}

function draw() {
  // Create circle
  let c = new Fresco.Circle(r, 1000);

  // Distort circle
  for (let i = 0; i < c.vertices.length; i++) {
    // Get noise at i-th vertex
    let noise2D = noiseVector(normalizedPerlin, c.vertices[i].x * noiseFreq, c.vertices[i].y * noiseFreq);
    // Create fade
    let fade = 1; // If in bottom half, no fade
    if (c.vertices[i].y > 0) {
      // If in top half linearly fade
      fade = 1 - c.vertices[i].y / fadeWidth;
      if (fade <= 0) {
        fade = 0;
      }
    }

    noise2D.mult(noiseAmplitude * sqrt(r) * fade);
    
    // Move point with noise
    c.vertices[i].add(noise2D); 
  }

  // Draw circle
  c.draw();

  // Increment radius
  r += circleOffset;

  // Increment count
  circleCount ++;

  if (circleCount == circleNum) {
    r += ringOffset;
    circleCount = 0;
  }

  border(margins, [0, 0, 0, 255]);

  // stop if circles exit canvas
  if (r * r > width * width / 4 + height * height / 4) {
    noLoop();
    stopRecording();
  }

}
