const backgroundClr = '000';

let s;
let p;

function setup() {
  createCanvas(1000, 1000);
  setSeed();

  s = new Fresco.Square(900);
  addColider(s);

  p = createParticle(0, 0);
  p.simulatePhysics = true;
  p.handleCollisions = true;

  let f = new Fresco.Gravity;
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  s.draw();
  p.draw();
  simulationStep(false, 0.001);
}