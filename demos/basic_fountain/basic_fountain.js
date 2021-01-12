let p;

const dT = 0.0001;

function setup() {
  createCanvas(1000, 1000);

  // create point emiter
  p = new PointEmitter(createPoint(0, 0));
  p.simulatePhysics = true;
  p.minV = createVector(-0.5, 1).mult(50);
  p.maxV = createVector(0.5, 1).mult(50);
  p.minLife = 0.01;
  p.maxLife = 0.2;
  p.spawnProbability = 0.5;
  p.spawnRate = 10;

  // convert points to particles and set tangential velocity
  f = new Gravity();
}

function draw() {
  background(0);
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  simulationStep(false, dT);
}

function keyPressed() {
  if (key == 'p') {
    if (isLooping()) {
      noLoop();
    }
    else {
      loop();
    }
  }
}
