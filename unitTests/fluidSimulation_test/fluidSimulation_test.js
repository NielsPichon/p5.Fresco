const backgroundClr = '000';
const numParticles = 100;
const numRaws = 5;

let s;

function setup() {
  createCanvas(1000, 1000);
  setSeed();

  s = new Fresco.Square(900);
  addColider(s);

  for (let i = 0; i < numParticles; i++) {
    for (let j = 0; j < numRaws; j++) {
      let p = createParticle(-numParticles * 5 * 0.5 + i * 5, j * 5);  
      p.simulatePhysics = true;
      p.handleCollisions = true;
      p.radius = 3;
      // p.velocity = p5.Vector.fromAngle(random(5 * PI / 4, 7 * PI / 4)).mult(100);
      p.bounciness = 0.5;
    }
  }

  let f = new Fresco.Gravity;
  let f2 = new Fresco.FluidSimulation();
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

  s.draw();

  for (let i = 0; i < particles.length; i++)
  {
    particles[i].draw();
  }

  simulationStep(false, 0.001);
}