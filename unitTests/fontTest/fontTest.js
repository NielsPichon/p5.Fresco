const backgroundClr = '000';

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
}

// draw function which is automatically 
// called in a loop
function draw() {
  Fresco.Futural.drawText('Hello World!', 18, createVector(0, 0), true);
  noLoop();
}