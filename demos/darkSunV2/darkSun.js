const polyShape = false;
const partNum = 10;
const noiseFreq = 0.02;
const noiseAmplitude = 2.5;
const circleRadius = 400;
const maxPartCount = 7000;
const circleModulation = 50;
const circleModFreq = 0.1;

let e;
let partCount = 0;


function setup() {
  createCanvas(1000, 1000);
  background(0);

  e = new ShapeEmitter(new sCircle(24,  150));
  e.shape.isPolygonal = polyShape;
  e.minV = createVector(0, 0);
  e.maxV = createVector(0, 0);
  e.minNormalV = 0;
  e.maxNormalV = 0;
  e.leaveTrail = true;
  e.burst = false;
  e.spawnRate = partNum;
  e.colorOverLife = [[255, 255, 255, 50], [255, 255, 255, 50]];
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
      particles[i].stopSimulate = true;
    } 
    else {
      // We add to the particle's velocity based on the underlying noise which is remapped to an angle 
      let perlin = noise((particles[i].x + width / 2) * noiseFreq, (particles[i].y  + height / 2) * noiseFreq);
      perlin = map(perlin, 0, 1, - noiseAmplitude, noiseAmplitude);
      let dir = particles[i].position().normalize();
      let vel = dir.add(-dir.y * perlin, dir.x * perlin);
      particles[i].add(vel);
    }

    particles[i].drawLastMove();
  }
}
