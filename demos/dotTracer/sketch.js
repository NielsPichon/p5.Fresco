const backgroundClr = '000';
const lightDir = [0, 0, -1];
const camPos = [-6, -5.85, 0];


let scene;
let up;
let center;
let camera;
let shapes;
let fovy = 50.0;
let znear = 0.1;
let zfar = 100.0;
let step = 0.01;

class Plane extends Fresco.Quad {
  constructor(size, position) {
    let halfDiag = createVector(size * 0.5, size * 0.5);
    let horizon = createVector(0, size);
    let v1 = position.copy().sub(halfDiag);
    let v2 = v1.copy().add(horizon);
    let v3 = position.copy().add(halfDiag);
    let v4 = v3.copy().sub(horizon);
    super(v1, v2, v3, v4);
  }
}


class Sphere extends Fresco.Shape3D {
  constructor(radius, position, resolution=100) {
    super();
    this.radius = radius;
    this.position = position;
    this.resolution = resolution;
  }

  getBoundingBox() {
    let halfDiag = createVector(
      sqrt(2) * this.radius,
      sqrt(2) * this.radius,
      sqrt(2) * this.radius,
    )
    return new Fresco.Box(
      this.position.copy().sub(halfDiag),
      this.position.copy().add(halfDiag),
  )};

  computeRayIntersection(r) {
    let toCenter = this.position.copy().sub(r.ori);
    let proj = toCenter.dot(r.dir)
    let projPoint = r.dir.copy().mult(proj).add(r.ori);

    let projDist = distSquared(projPoint, this.position)
    if (projDist < this.radius * this.radius) {
      return new Fresco.Hit(this, proj);
    }
    return NoHit
  };

  toShapes() {
    let circle = new Fresco.Circle(this.radius, this.resolution);
    circle.position = this.position;
    return [circle];
  };

  contains(v) {
    return distSquared(v, this.position) < this.radius * this.radius
  };
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  // init scene
  scene = new Fresco.Scene3D();
  up = createVector(0, 0, 1);
  center = createVector(0, 0, 0);
  camera = createVector(camPos[0], camPos[1], camPos[2]);

  let sphere = new Sphere(1, createVector(0,0,0), 100);
  scene.registerShape3D(sphere)

  shapes = scene.render(camera, center, up, width,
                        height, fovy, znear, zfar, step);
}

// draw function which is automatically
// called in a loop
function draw() {
  shapes.forEach(s => s.draw());
  noLoop();
}