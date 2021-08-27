const backgroundClr = '000';

let slider;
function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  slider = createSlider(1, 50, 50);
  slider.position(20, 20);
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(0)
  let s = new Fresco.Circle(200, 5);
  s.draw();
  s.setColor([255, 0, 0]);
  s.poligonize(slider.value());
  s.draw();
}