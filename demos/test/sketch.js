const backgroundClr = '000';

let img;

function preload() {
  img = loadImage('test.png');
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;
  Image(img, 0, 0)
}

// draw function which is automatically
// called in a loop
function draw() {
}