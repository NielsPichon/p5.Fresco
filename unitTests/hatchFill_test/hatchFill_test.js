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

  let s = new Fresco.Square(200);
  let fillLines = s.hatchFill(Math.PI, 5);

  s.draw();
  fillLines.forEach(line => line.draw());

  noLoop()
}