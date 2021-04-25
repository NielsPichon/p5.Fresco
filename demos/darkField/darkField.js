const polyShape = true;
const partNum = 10;
const noiseFreq = 0.1;
const noiseAmplitude = 100;
const emitterSize = [1000];
const borderSize = 500;
const maxPartCount = 30000;
const circleModulation = 100;
const circleModFreq = 10;
const particlesRadius = 0.1;
const lineClr = 'fff';
const opacity = 255;

const record = false;

let partCount = 0;


function setup() {
  createCanvas(1440, 1440);
  background(0);
  setSeed();

  // Create a number of emitters
  for (let i = 0; i < emitterSize.length; i++) {
    let e = new Fresco.ShapeEmitter(new Fresco.Square(emitterSize[i]));
    e.shape.isPolygonal = polyShape;
    e.minV = createVector(0, 0);
    e.maxV = createVector(0, 0);
    e.minNormalV = 1; // Make sure all particles start with equal normal velocity
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
  simulationStep();
  partCount += partNum;
  if (partCount >= maxPartCount) {
    e.isDead = true;
  }
  for (let i = 0; i < particles.length; i++) {
    let radius_i = borderSize + noise((particles[i].x + width / 2) * circleModFreq, (particles[i].y  + height / 2) * circleModFreq) * circleModulation;

    // kill particle if it gets out
    if (Math.abs(particles[i].x)  > radius_i || Math.abs(particles[i].y) > radius_i) {
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
