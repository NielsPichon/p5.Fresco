const backgroundClr = '000';
const particlesColor = 'fff';
const particlesAlpha = 100;
const startRadius = 1;
const numParticles = 1000;
const scale = 300;

const drawTrajectory = false;

// let a = 0; let b = 0; let c = 0; let d = 0; // random parameters
let a = 1.4; let b = 1.1; let c = -1.1; let d = 1; //petals
// let a = -1.9; let b = 1.7; let c = -2; let d = 0.6; // cyber doughnut
// let a = 1.7; let b = 1.1; let c = -1.1; let d = -1.8; // hour glass
// let a = -1.7; let b = 1.7; let c = 1.7; let d = -1.8; // glass ball
// let a = -1.9; let b = -1.8; let c = -1.3; let d = -0.1; // infinity
// let a = 1.2; let b = 1.3; let c = 1.2; let d = -1.4; // levitation


function clifford(particle) {
  let x = Math.sin(a * particle.y / scale) + c * Math.cos(a * particle.x / scale)
  let y = Math.sin(b * particle.x / scale) + d * Math.cos(b * particle.y / scale)
  particle.x = x * scale;
  particle.y = y * scale;
}

function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed();

  if (a == 0 && b == 0 && c == 0 && d ==0) {
    a = Math.floor(random(-20, 20)) / 10;
    b = Math.floor(random(-20, 20)) / 10;
    c = Math.floor(random(-20, 20)) / 10;
    d = Math.floor(random(-20, 20)) / 10;
  }

  print(a, b, c, d);

  for (let i = 0; i < numParticles; i++) {
    let theta = random(2 * Math.PI);
    let r = random(startRadius);
    let p = createParticle(r * Math.cos(theta), r * Math.sin(theta));
    p.setColor(colorFromHex(particlesColor, particlesAlpha));
    clifford(p);
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  for (let i = 0; i < getParticlesNum(); i++) {
    p = getParticle(i);
    if (drawTrajectory) {
      p.drawLastMove();
      p.storePreviousPosition();
    }
    else {
      p.draw();
    }
    clifford(p);
  }
}