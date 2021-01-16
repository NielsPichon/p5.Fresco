let p;
let f;

const dT = 0.01;
const numParticles = 100;
const intensity = 1;
const falloff = -1;

const colors = [[119, 118, 188, 100],
                [252, 122, 87, 100],
                [255, 251, 219, 100]];

function setup() {
  createCanvas(500, 500);

  // create source circle
  const s = new Fresco.Circle(200, 24);

  // scatter points inside
  p = scatter(s, numParticles, false, true);

  // convert points to particles and set tangential velocity
  let t;
  for (let i = 0; i < p.length; i++) {
    p[i] = new Fresco.Particle(p[i]);
    p[i].simulatePhysics = true;
    p[i].leaveTrail = true;
    t = Math.floor(random(0, colors.length));
    p[i].colorOverLife = [colors[t], colors[t]];
    p[i].velocity = createVector(-p[i].y, p[i].x).normalize();
  }

  f = new Fresco.Attractor(createPoint(0, 0),
                    intensity, 300, falloff);
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(3);
  for (let i = 0; i < p.length; i++) {
    p[i].draw();
  }

  simulationStep(false, dT);
}
