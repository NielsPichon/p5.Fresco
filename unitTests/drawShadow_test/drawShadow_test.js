const backgroundClr = '000';

let s;

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  s = new Fresco.Circle(300, 100);
  s.isPolygonal = false;
}

// draw function which is automatically 
// called in a loop
function draw() {
  s.draw();
  s.drawShadow(shadowType.hatching, Math.PI / 4, Math.PI / 2, 100, 50, true, 0, -1, 0);
  s.drawShadow(shadowType.stippling, 5 * Math.PI / 4, Math.PI / 2, 100, 50, false, 50, 1, 1);

  noLoop();
}