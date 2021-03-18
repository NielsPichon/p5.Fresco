const backgroundClr = '000';

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
}

// draw function which is automatically 
// called in a loop
function draw() {
}

class curveForce extends Fresco.Force {
  constructor(shape, pullIntensity, driveIntensity) {
    this.pullIntensity = pullIntensity;
    this.driveIntensity = driveIntensity;
    this.shape = shape;
  }

  applyForce(particle) {
    [projection, closest_edge_idx, percentage, closest_dist] = this.shape.projectOnShape(particle);
    let dir = particle.position().sub(projection);
    let pull = dir.copy().mult(this.pullIntensity);
    let drive = createVector(-dir.y, dir.x).mult(this.driveIntensity);
    return pull.add(drive);
  }
}