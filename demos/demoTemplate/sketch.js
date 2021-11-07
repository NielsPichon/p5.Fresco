const backgroundClr = '000';

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;
}

// draw function which is automatically 
// called in a loop
function draw() {
}