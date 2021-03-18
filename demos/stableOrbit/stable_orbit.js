
const dT = 0.001;
const numParticles = 500;
const intensity = 1;
const falloff = 1;
const lineWeight = 2;
const alpha = 50;
const colors = [[119, 118, 188],
                [252, 122, 87],
                [255, 251, 219]];
const noiseIntensity = 0.005;
const noiseFreq = 0.1;
const attractorDecaySpeed = 0;

let p;
let f;

function setup() {
  createCanvas(1440, 1440);
  background(0);

  // create source circle
  const s = new Fresco.Circle(900, 24);

  // scatter points inside
  p = scatter(s, numParticles, false, true);

  // convert points to particles and set tangential velocity
  let t;
  for (let i = 0; i < p.length; i++) {
    p[i] = new Fresco.Particle(p[i]);
    p[i].simulatePhysics = true;
    p[i].radius = lineWeight;
    t = Math.floor(random(0, colors.length));
    p[i].colorOverLife = [[colors[t][0], colors[t][1], colors[t][2], alpha]];
    p[i].velocity = createVector(-p[i].y, p[i].x).normalize();
  }

  f = new Fresco.Attractor(createPoint(0, 0),
                    intensity, 5000, falloff);
                  
  f2 = new Fresco.CurlForce(noiseIntensity, noiseFreq);
}

function draw() {
  for (let i = 0; i < p.length; i++) {
    p[i].drawLastMove();
  }

  simulationStep(false, dT);
  f.intensity *= (1 - attractorDecaySpeed)
}
