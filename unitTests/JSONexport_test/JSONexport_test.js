const backgroundClr = '888';

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts()
}

// draw function which is automatically 
// called in a loop
function draw() {
  let s = new Fresco.Circle(300, 3);
  s.isPolygonal = true;
  s.rotation = - Math.PI / 2;
  s.layer = 1
  s.draw();

  text = Fresco.Futural.drawText('This way up!', 12, createVector(0, -300), true)

  print(Fresco.shapeBuffer);
  noLoop();
}