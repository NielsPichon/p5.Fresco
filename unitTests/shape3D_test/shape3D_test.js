const backgroundClr = '000';

let shapes = [];

let hVec;
let eye;
let center;
let up;
let fovy;
let znear;
let zfar;
let step;

let scene;

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();

  scene = new Fresco.Scene3D();
  scene.registerShape3D(new Fresco.Cube(createVector(-1, -1, -1).mult(0.5), createVector(1, 1, 1).mult(0.5)));
  scene.registerShape3D(new Fresco.Cube(createVector(-1, -1, -1).mult(0.5), createVector(1, 1, 1).mult(0.5)));
  scene.shapes[1].translate(createVector(0, 1, 0));
  scene.shapes[1].scale(createVector(0.5, .5, .5));

  let circle = new Fresco.Circle();
  circle.isPolygonal = true;
  circle.vertices.forEach(v => v.mult(0.02));
  scene.registerShape3D(new Fresco.ArbitraryShape(circle));
  scene.shapes[scene.shapes.length - 1].showTris = false;


  center = createVector(0, 0, 0);
  up = createVector(0, 0, 1);
  fovy = 50.0;
  znear = 0.1;
  zfar = 100.0;
  step = 0.01;
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  hVec = p5.Vector.fromAngle(frameCount * 0.01).mult(10);
  eye = createVector(0, 0, -3).add(hVec);
  shapes = scene.render(eye, center, up, width, height, fovy, znear, zfar, step);
  shapes.forEach(s => s.draw());
  noLoop();
}