const backgroundClr = '000000'; // backfround color
const particleColorOverLife = ['000', '000', '000', '1e2586', '1e2586', '2d00f7', 'f20089', '000']; // particle color
const particleOpacity = 255; // opacity of the particles
const noiseFreq = 0.1; // freq if the curl noise
const noiseIntensity = 0.2; // intensity of the curl turbulence
const attractorIntensity = 1; // intensity multiplier for the attractor
const emitterRadius = 400; // emitter radius
const attractorRadius = 150; // attractor radius
const pushPower = -1; // must be negative. How repulsive the attractor is. Will forbid particles entering its radius.
const pullPower = -4; // must be negative and smaller than push power. How attractive the attractor is.
const fadeOverTime = 10; // fades the trails over time
const noiseAnimateSpeed = 0.1; // moves the underlying noise
const particleWeight = 10;


class CurlForce extends Fresco.Force {
  constructor(intensity, noiseFreq) {
    super();
    this.intensity = intensity;
    this.noiseFreq = noiseFreq;
  }

  applyForce(particle) {
    return curlNoise2D(
      perlin, 0.01,
      (particle.x + width / 2) * this.noiseFreq,
      (particle.y + height / 2) * this.noiseFreq).mult(this.intensity)
  }
}

class VanDerWaals extends Fresco.Force {
  constructor(intensity, radius, pushPower, pullPower, x = 0, y = 0) {
    if (pushPower > 0) {
      throw "Push power must be negative"
    }
    if (pullPower > pushPower) {
      throw "If the pull power becomes larger than the push power, the force will diverge"
    }
    super();
    this.intensity = intensity;
    this.radius = radius;
    this.position = createVector(x, y);
    this.pushPower = pushPower;
    this.pullPower = pullPower;
  }

  applyForce(particle) {
    let normalizedDist = particle.dist(this.position) / this.radius;
    let amplitude = this.intensity *
      (Math.pow(normalizedDist, this.pushPower) -
      Math.pow(normalizedDist, this.pullPower));
    return this.position.copy().sub(particle).normalize().mult(amplitude);
  }

}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  let e = new Fresco.ShapeEmitter(new Fresco.Polygon(emitterRadius, 64));
  e.simulatePhysics = true;
  e.maxLife = 1;
  e.minLife = 1;
  e.color = colorFromHex(particleColorOverLife[0], particleOpacity);
  e.colorOverLife = [];
  e.colorOverLifeTime = [];
  for (let i = 0; i < particleColorOverLife.length; i++) {
    e.colorOverLife.push(colorFromHex(particleColorOverLife[i], particleOpacity));
    e.colorOverLifeTime.push(i / (particleColorOverLife.length - 1));
  }

  let curl = new CurlForce(noiseIntensity, noiseFreq);
  let vdw = new VanDerWaals(attractorIntensity, attractorRadius, pushPower, pullPower, 0, 0);
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr, fadeOverTime));
  simulationStep();
  for (let i = 0; i < particles.length; i++) {
    particles[i].drawLastMove();
  }
}
