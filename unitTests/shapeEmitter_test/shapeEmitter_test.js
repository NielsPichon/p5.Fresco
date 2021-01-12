const polyShape = false;

let e;


function setup() {
  createCanvas(1000, 1000);
  e = new ShapeEmitter(new SCircle(200, 24));
  e.shape.isPolygonal = polyShape;
  e.minV = createVector(0, 0);
  e.maxV = createVector(0, 0);
  e.minLife= 0.1;
  e.maxLife = 2;
}

function draw() {
  background(0)
  simulationStep();
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }
}
