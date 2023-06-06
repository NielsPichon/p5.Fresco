const backgroundClr = '000';
const fixedFrameRate = 60;
const substep_num = 10;
const stiffness = 1;
const tortionStiffness = 1;
const damping = 10;
const cutoff = 0.001;
const radius = 200;
const resolution = 159;

let blob;
let square;

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  frameRate(fixedFrameRate);

  blob = new Blob(
    radius,
    resolution,
    stiffness,
    tortionStiffness,
    damping,
    1 / fixedFrameRate / substep_num,
    cutoff
  );

  square = new Fresco.Square(100);
  square.position = createPoint(0, 175);
}

function mousePressed() {
  blob.vertices[1] = createPoint(mouseX - width / 2, -mouseY + height / 2);
  blob.pos_buf[1] = blob.vertices[1].copy();
}

// draw function which is automatically
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  for (let i = 0; i < substep_num; i++) {
    blob.step([square]);
  }
  blob.draw();
  square.draw();
}