const backgroundClr = '000000';
const density = 60; // amount of points in each direction
const pointSpacingModulation = 10; // max shift of points upon spawn due to noise
const minNoiseScale = 0.01; 
const maxNoiseScale = 0.02;
const alphaFade = true; // whether to fade the points as we move away from center
const alphaFadeRadius = 350; // max fade radius
const pointWeight = 1; // stroke weight
const moveSpeed = 1; // how fast to move points at
const noiseType = 'perlin'; // type of noise to use, either 'perlin' or 'ridged'
const drawPoints = true; // whether to draw points or lines/curves
const preSimulate = 0; // if non-zero, the specified amount of steps will
                       // be precomputed and the result will be drawn

let noiseScale;
let r1;
let r2;
let g1;
let g2;
let b1;
let b2;

function setup() {
  createCanvas(1000, 1000);
  strokeWeight(pointWeight)
  background(colorFromHex(backgroundClr));
  angleMode(DEGREES);
  noiseDetail(1);

  let space = 2 * alphaFadeRadius / density;

  // spawn particles at even interval + some random modulation
  for (let x = - alphaFadeRadius; x < alphaFadeRadius; x += space) {
    for (let y = - alphaFadeRadius; y < alphaFadeRadius; y += space) {
        let p = createParticle(
          x + random(-pointSpacingModulation, pointSpacingModulation),
          y + random(-pointSpacingModulation, pointSpacingModulation)
        );
        p.leaveTrail = true;
        p.color = [255, 255, 255, 128];
   }
  }

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
    particles[i].add(createVector(cos(angle), sin(angle)).mult(moveSpeed));

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
      if (dist(0, 0, particles[i].x, particles[i].y) < alphaFadeRadius) {
        drawCount ++;
        if (drawPoints) {
          stroke(particles[i].color);
          PPoint(particles[i]);
        }
        else {
          particles[i].drawLastMove();
        }
      }
    }

    // if no new point has been drawn, stop the animation
    if (drawCount == 0) {
      noLoop();
    }
  }
  else {
    // if pre-simulated, simply draw the whole trajectory of each particle
    for (let i = 0; i < particles.length; i++) {
      if (dist(0, 0, particles[i].x, particles[i].y) < alphaFadeRadius) {
        particles[i].draw();
      }
    }
    noLoop()
  }
}
