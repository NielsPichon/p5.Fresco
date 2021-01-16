const lineNum = 5;
const timeOffset = 24;
const lineWidth = 100;
const noiseAmount = 50;
const noiseFreq = 0.005;
const verticalPos = - 300; // vertical starting position
const growSpeed = 3;
const transitionHeight = 100;
const backgroundClr = '00000c';
let colors = ['264653', '2a9d8f', 'e9c46a', 'f4a261', 'e76f51'];

let lines = [];
let lineCount = 0;
let offset;

function setup() {
  createCanvas(1000, 1000);
  noiseDetail(1)
  

  // randomize color order
  shuffle(colors, true);

  // convert colors to RGBA
  for (let i = 0; i < colors.length; i++) {
    colors[i] = colorFromHex(colors[i])
  }

  // compute line x offset (depending on the parity
  // of the number of lines to draw)
  if (lineNum % 2 == 1) { 
    offset = - lineWidth * Math.floor(lineNum * 0.5);
  }
  else {
    offset = - lineWidth * (lineNum * 0.5 - 0.5);
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

  // if enough frames have lapsed since welast created
  // a particle,spawn a new one
  if ((frameCount - 1)  % timeOffset == 0 && particles.length < lineNum) {
    let p = new Cardioid.Particle(createVector(offset + lineCount
      * lineWidth, verticalPos));
    p.color = colors[lineCount % colors.length];
    p.colorOverLife = [p.color];
    p.leaveTrail = true;
    p.radius = lineWidth;
    lineCount++;
  }

  // Move the particle
  for (let i = 0; i < particles.length; i++) {
    // move up
    particles[i].y += growSpeed;
    // compute noise offset
    let n = map(
      normalizedPerlin((particles[i].y + height / 2) * noiseFreq),
      0, 1, -noiseAmount, noiseAmount);
    
    // weight noise to make sure the particle is centered when just spawned
    if (particles[i].y < verticalPos + transitionHeight) {
      n *= smoothstep((particles[i].y - verticalPos) / transitionHeight);
    }
    // offset horizontallybased on noise
    particles[i].x = offset + i * lineWidth + n;
    // Register current position in trail
    particles[i].addCurrentPositionToTrail();
    // draw the whole trail
    particles[i].draw();
  }

  // add a line colored in the same tint as the background on top,
  // to make the start straight
  strokeWeight(lineWidth);
  stroke(colorFromHex(backgroundClr));
  drawLine(createVector(-width / 2,  verticalPos - lineWidth / 2),
    createVector(width / 2,  verticalPos - lineWidth / 2))
}
