const backgroundClr = '000';
const resGrid = 10;
const minSize = [0.1, 0.1, 0.3];
const maxSize = [0.5, 0.3, 0.7];
const camPos = [-3, -3, 5];
const camTarget = [0, 0, 0.5];
const roadSize = 0.3;
const hatchSpacing = 0.05;
const angle = - Math.PI / 4;

let shapes;

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  noLoop();

  let scene = new Fresco.Scene3D();

  let minX = 0.25 * resGrid * (minSize[0] + maxSize[0]);
  let minY = 0.25 * resGrid * (minSize[1] + maxSize[1]);
  let X = -minX + random(minSize[0], maxSize[0]) * 0.5;
  let Y = -minY;

  for (let i = 0; i < resGrid; i++) {
    Y = -minY + random(minSize[1], maxSize[1]) * 0.5;
    let sizeX = random(minSize[0], maxSize[0]); 
    for (let j = 0; j < resGrid; j++) {
      let sizeY = random(minSize[1], maxSize[1]); 
      let sizeZ = random(minSize[2], maxSize[2]); 
      let cube = new Fresco.Cube(createVector(X, Y, 0), createVector(X + sizeX, Y + sizeY, sizeZ));
      scene.registerShape3D(cube);
      let lines = cube.hatchFace(angle, hatchSpacing, '-xz');
      lines.forEach(l => scene.registerShape2D(l));
      if (random() > 0.5) {
        sizeY += roadSize;
      }
      Y += sizeY;
    }
    if (random() > 0.5) {
      sizeX += roadSize;
    }
    X += sizeX;
  }

  let center = createVector(...camTarget);
  let up = createVector(0, 0, 1);
  let fovy = 50.0;
  let znear = 0.1;
  let zfar = 100.0;
  let step = 0.01;
  let camera = createVector(...camPos);
  shapes = scene.render(camera, center, up, width, height, fovy, znear, zfar, step);
}

// draw function which is automatically 
// called in a loop
function draw() {
  shapes.forEach(s => s.draw());
}