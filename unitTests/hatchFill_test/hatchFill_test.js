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
  s.rotation = Math.PI / 12;
  let fillLines = s.hatchFill(Math.PI / 4, 5);

  let [a, b] = s.getBoundingBox()
  let scale = b.x - a.x
  let s2 = new Fresco.Square(scale);
  s2.color = [255, 0, 0]
  let debug_lines = s2.hatchFill(Math.PI/ 4, 5);
  s2.draw()
  debug_lines.forEach(line => {
    line.color = [255, 0, 0]
    line.draw()
  });

  s.draw();
  fillLines.forEach(line => line.draw());
  
  noLoop()
}