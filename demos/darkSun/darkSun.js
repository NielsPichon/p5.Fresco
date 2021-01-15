const polyShape = false;
const partNum = 10;
const noiseFreq = 0.005;
const noiseAmplitude = 0.012;
const circleRadius = 400;
const maxPartCount = 30000;
const circleModulation = 50;
const circleModFreq = 0.1;
const particlesRadius = 0.1;

let e;
let partCount = 0;


function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  background(0);

  e = new Cardioid.ShapeEmitter(new Cardioid.Circle(150, 24));
  e.shape.isPolygonal = polyShape;
  e.minV = createVector(0, 0);
  e.maxV = createVector(0, 0);
  e.minNormalV = 1; // Make sure all particles start with equal normal velocity
  e.leaveTrail = true;
  e.burst = false;
  e.spawnRate = partNum;
  e.colorOverLife = [[255, 255, 255, 50], [255, 255, 255, 50]];
  e.radius = particlesRadius;
}

function draw() {
  simulationStep();
  partCount += partNum;
  if (partCount >= maxPartCount) {
    e.isDead = true;
  }
  for (let i = 0; i < particles.length; i++) {
    let radius_i = circleRadius + noise((particles[i].x + width / 2) * circleModFreq, (particles[i].y  + height / 2) * circleModFreq) * circleModulation;
    if (particles[i].magSq() > radius_i * radius_i) {
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

    particles[i].drawLastMove();
  }
}
