// dark field parameters
const polyShape = true;
const partNum = 10;
const noiseFreq = 0.01;
const noiseAmplitude = 0.6;
const emitterSize = [1000];
const borderSize = 500;
const maxPartCount = 10000;
const circleModulation = 100;
const circleModFreq = 100;
const particlesRadius = 0.2;
const lineClr = '220901';
const opacity = 255;
const backgroundClr = 'ffe5d9';


// pot parameters
const numLevels = 3;
const potResolution = 64;
const baseWidth = 0.2;
const baseMaxX = 1 + baseWidth;
const basePower = 2;
const circleBase = true;
const nextX = [0.6, 0.5];
const nextDX = [-1, 0];

const record = false;

let partCount = 0;
let pot;


function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed();

  // Create a number of emitters
  for (let i = 0; i < emitterSize.length; i++) {
    pot = new Pot(
        numLevels, numLevels, emitterSize[i], potResolution, circleBase,
        baseWidth, basePower, baseMaxX, nextX, nextDX
    );
    let AABB = pot.getBoundingBox();
    pot.position.y -= (AABB[0].y + AABB[1].y) / 2;
    let e = new Fresco.ShapeEmitter(pot);
    e.shape.isPolygonal = polyShape;
    e.minV = createVector(0, 0);
    e.maxV = createVector(0, 0);
    e.minNormalV = -1; // Make sure all particles start with equal normal velocity
    e.maxNormalV = -1;
    e.leaveTrail = false;
    e.burst = false;
    e.spawnRate = partNum;
    e.setColor(colorFromHex(lineClr, opacity));
    e.radius = particlesRadius;
  }

  if (record) {
    recordAnimation();
  }

}

function draw() {
    // pot.draw();
    // noLoop();
  simulationStep();
  partCount += partNum;
  if (partCount >= maxPartCount) {
    e.isDead = true;
  }
  for (let i = 0; i < particles.length; i++) {
    let radius_i = borderSize + noise((particles[i].x + width / 2) * circleModFreq, (particles[i].y  + height / 2) * circleModFreq) * circleModulation;

    // kill particle if it gets out
    if (!isInside(particles[i], pot, true)) {
      particles[i].velocity = createVector(0, 0); 
      particles[i].isDead = true;
    } 
    else {
      // We add to the particle's velocity based on the underlying noise which is remapped to an angle 
      let perlin = noise((particles[i].x + width / 2) * noiseFreq, (particles[i].y  + height / 2) * noiseFreq);
      perlin *= 10 * PI;
      let vel = createVector(Math.cos(perlin), Math.sin(perlin)).mult(noiseAmplitude);
      particles[i].velocity.add(vel).normalize(); 
    }

    // draws a line between the previous and current position of the particle. NOTE: requires that the particles leaves a trail for it to work
    particles[i].drawLastMove();
  }
}
