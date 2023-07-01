const backgroundClr = '000000';
const density = 1000; // amount of points in each direction
const pointSpacingModulation = 10; // max shift of points upon spawn due to noise
const minNoiseScale = 0.008;
const maxNoiseScale = 0.015;
const alphaFade = false; // whether to fade the points as we move away from center
const alphaFadeRadius = 350; // max fade radius
const pointWeight = 1; // stroke weight
const moveSpeed = 0.5; // how fast to move points at
const noiseType = 'ridged'; // type of noise to use, either 'perlin' or 'ridged'
const drawPoints = true; // whether to draw points or lines/curves
const clampToAxes = false; // whether to clamp the noise to the x/y axes
const preSimulate = 500; // if non-zero, the specified amount of steps will
                       // be precomputed and the result will be drawn
// const stripeWidth = 100; // width of the stripe
const squareSize = 500; // size of the square
const numSquares = 2; // number of squares to draw
const shrinkSpeed = 0.3; // how fast to shrink the squares
const margin = 150;

let noiseScale;
let r1;
let r2;
let g1;
let g2;
let b1;
let b2;

function setup() {
  if (preSimulate > 0) {
    createSVGCanvas(1000, 1000 * sqrt(2));
  } else {
    createA4RatioCanvas(1000);
  }
  strokeWeight(pointWeight)
  background(colorFromHex(backgroundClr));
  angleMode(DEGREES);
  noiseDetail(1);
  setSeed(8034); //1394+ridged, 6990+ridged, 8034+ridged, 9534+noise, 8612+noise

  Fresco.registerShapes = false;

  // const diag = sqrt(width * width + height * height);
  // let diagDir = createVector(width, height).normalize();
  // let orth = createVector(-diagDir.y, diagDir.x);

  let size = squareSize;

  for (let j = 0; j < numSquares; j++) {

    for (let i = 0; i < density / numSquares; i++) {
      let side = Math.floor(random(4));
      let x = side % 2 == 0 ? random(-size / 2, size / 2) : (side == 1 ? -size / 2 : size / 2);
      let y = side % 2 == 1 ? random(-size / 2, size / 2) : (side == 0 ? -size / 2 : size / 2);
      // let X = random(-stripeWidth / 2, stripeWidth / 2);
      // let Y = random(-diag / 2, diag / 2);
      // let pos = diagDir.copy().mult(Y).add(orth.copy().mult(X));
      // let p = createParticle(pos.x, pos.y);
      let p = createParticle(x, y);
      p.leaveTrail = true;
      p.color = [255, 255, 255, 128];
    }

    size *= shrinkSpeed;
  }

  // let space = 2 * alphaFadeRadius / density;

  // spawn particles at even interval + some random modulation

      // let X = x + random(-pointSpacingModulation, pointSpacingModulation);
      // let Y = y + random(-pointSpacingModulation, pointSpacingModulation);
      // x = X * cos(PI / 4) + Y * sin(PI / 4);
      // y = X * sin(PI / 4) - Y * cos(PI / 4);

      // let p = createParticle(x, y);
      // p.leaveTrail = true;
      // p.color = [255, 255, 255, 128];

  // Randomize the lines so that they don't spawn from
  // top left corner to bottom right one
  shuffle(particles, true);

  // Generate 2 random colors
  r1 = random(255);
  r2 = random(255);
  g1 = random(255);
  g2 = random(255);
  b1 = random(255);
  b2 = random(255);

  // Random noise scale
  noiseScale = random(minNoiseScale, maxNoiseScale);

  if (preSimulate > 0) {
    for (let  i = 0; i < preSimulate; i++) {
      let lineCount = min([i * 5, particles.length]);
      step(lineCount);
    }
  }

  jsonExportCallback = () => {
    let shapes = [];
    particles.forEach(p => {
      if (p.trail != null) {
        shapes.push(p.trail)
      }
    });
    return shapes;
  }
}


// particle simulation step
function step(lineCount) {
  for (let i = 0; i < lineCount; i++) {
    // Interpolate between the 2 generated random colors based on position on canvas
    let r = map(particles[i].x, -width / 2, width / 2, r1, r2);
    let g = map(particles[i].y, -height / 2, height / 2, g1, g2);
    let b = map(particles[i].x, -width / 2, width / 2, b1, b2);

    // fade the alpha as we get away from the center
    let alpha = 128;
    if (alphaFade) {
      alpha = map(dist(0, 0, particles[i].x, particles[i].y), 0, alphaFadeRadius, 200, 0);
    }

    // set the particle color
    particles[i].color = [r, g, b, alpha];

    // compute the point movement based on underlying perlin noise. The noise is mapped to the movement
    // direction and the length of the movement is always one pixel
    let n;
    if (noiseType == 'ridged') {
      n = ridgedNoise((particles[i].x + width / 2) * noiseScale, (particles[i].y + height / 2) * noiseScale);
    }
    else {
      n = noise((particles[i].x + width / 2) * noiseScale, (particles[i].y + height / 2) * noiseScale);
    }
    let angle = map(n, 0, 1, 0, 720);
    let vec = createVector(cos(angle), sin(angle));
    if (clampToAxes) {
      if (abs(vec.x) > abs(vec.y)) {
        vec.x = Math.sign(vec.x);
        vec.y = 0;
      } else {
        vec.x = 0;
        vec.y = Math.sign(vec.y);
      }
    }
    particles[i].add(vec.mult(moveSpeed));

    // add the current position to the trail
    particles[i].addCurrentPositionToTrail();
  }
}


function draw() {
  if (preSimulate == 0) {
    let lineCount = min([frameCount * 5, particles.length]);
    // compute the simulation step
    step(lineCount);

    // draw the last move of each particle
    let drawCount = 0;
    for (let i = 0; i < lineCount; i++) {
      if (abs(particles[i].x) < width / 2 - margin && abs(particles[i].y) < height / 2 - margin) {
        drawCount ++;
        if (drawPoints) {
          stroke(particles[i].color);
          drawPoint(particles[i]);
        }
        else {
          particles[i].drawLastMove();
        }
      } else {
        // particles[i].trail.vertices.pop();
        particles[i].stopSimulate=true;
      }
    }

    // if no new point has been drawn, stop the animation
    if (drawCount == 0) {
      noLoop();
    }
  }
  else {
    // if pre-simulated, simply draw the whole trajectory of each particle
    particles.forEach(p => {
      let shape = resample(p.trail, 100);
      shape.draw();
    });
    noLoop()
  }
}
