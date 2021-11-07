const backgroundClr = '000';
const backgroundAlpha = 15;
const particleClr = 'fff';
const particleAlpha = 128;
const startRadius = 200; // radius of the circle
const resolution = 12; // number of control points along the shape
const pullIntensity = 0.01; // how much pull towards the curve is applied
const driveIntensity = 0.1; // how much force along the curve is applied
const noiseIntensity = 5; // particles noise amount
const noiseFreq = 0.01; // particles noise freq
const simulationSpeed = 0.01; // particles movement time step
const distThreshold = 100; // distance beyond which particles will be pulled back to the shape
const shapeMoveSpeed = 0.01; // how fast the circle deforms
const maxShapeOscRatio = 0.8; // how much the circle will bend
const minFreq = 0.5; // min oscillation frequency ratio
const particleNum = 5;

const axidrawFriendly = true; // makes the drawing axidraw friendly but may be a bit slower
const axidrawTrailLengthThreshold = 50; // Min length of a particle's trail for it to be drawn 

let s;

function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  Fresco.registerShapes = false;

  s = new Fresco.Polygon(startRadius, resolution)
  let e = new Fresco.ShapeEmitter(s);
  // e.burst = true;
  e.simulatePhysics = true;
  e.maxNormalV = 0;
  e.minNormalV = 0;
  e.normalizeV = true;
  e.spawnRate = particleNum;
  e.minLife = 1;
  e.maxLife = 5;
  if (axidrawFriendly) {
    e.leaveTrail = true;
  }

  e.setColor(colorFromHex(particleClr, particleAlpha));

  let f = new curveForce(s, pullIntensity, driveIntensity, distThreshold);
  let f3 = new Fresco.CurlForce(noiseIntensity, noiseFreq);

  for (let i = 0; i < s.vertices.length - 1; i++) {
    s.vertices[i].freq = minFreq + (1 - minFreq) * random();
  }

  if (axidrawFriendly) {
    jsonExportCallback = () => {
      let shapes = [];
      particles.forEach(p => {
        if (p.trail != null && p.trail.vertices.length > axidrawTrailLengthThreshold) {
          shapes.push(p.trail);
        }
      });
  
      return shapes;
    }
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  setBackgroundColor(colorFromHex(backgroundClr, backgroundAlpha));
  for (let i = 0; i < getParticlesNum(); i++) {
    p = getParticle(i);
    p.drawLastMove();
  }

  simulationStep(false, simulationSpeed);

  for (let i = 0; i < s.vertices.length - 1; i++) {
    s.vertices[i] = s.vertices[i].normalize().mult(startRadius * (1 + maxShapeOscRatio * Math.sin(frameCount * shapeMoveSpeed * s.vertices[i].freq)));
  }
  s.vertices[s.vertices.length - 1].setPosition(s.vertices[0]);
}

class curveForce extends Fresco.Force {
  constructor(shape, pullIntensity, driveIntensity, pullThreshold) {
    super()
    this.pullIntensity = pullIntensity;
    this.driveIntensity = driveIntensity;
    this.pullThreshold = pullThreshold;
    this.shape = shape;
  }

  applyForce(particle) {
    let [projection, closest_edge_idx, percentage, closest_dist] = this.shape.projectOnShape(particle);
    let dir = particle.position().sub(projection);
    let pull = createVector(0, 0);
    if (closest_dist > this.pullThreshold) {
      pull = dir.copy().mult(-this.pullIntensity);
    }
    dir.normalize();
    let drive = createVector(-dir.y, dir.x).mult(this.driveIntensity);
    if (isInside(particle, this.shape, true)) {
      drive.mult(-1);
    }
    let tot_force = pull.copy().add(drive);
    return tot_force;
  }
}