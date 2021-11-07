const backgroundClr = '000';
const resGrid = 11;
const minSize = [0.1, 0.1, 0.2];
const maxSize = [0.1, 0.1, 1.5];
const noiseZ = 0.1;
const maxFloors = 6;
const camPos = [-6, -6, 9.5];
const camTarget = [0, 0, 0.5];
const roadSize = 0;
const hatch = false;
const hatchSpacing = 0.01;
const angle = -Math.PI / 3;
const citySeed = 6186;
const rotationPeriod = 280; // in number of frames
const animate = false;
const startPhase = 0.31; // angle at start
const addText = false;
const globalOffsetY = 0;
const marginZ = 0.2;
const shiftY = -.2;

let shapes;
let center;
let up;
let camera;
let scene;
let fovy = 50.0;
let znear = 0.1;
let zfar = 100.0;
let step = 0.01;

function setup() {
  // createSVGCanvas(1000, 1000);
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed(citySeed);
  loadFonts();

  scene = new Fresco.Scene3D();

  let minX = 0.25 * resGrid * (minSize[0] + maxSize[0]);
  let minY = 0.25 * resGrid * (minSize[1] + maxSize[1]);
  let X = -minX;
  let Y = -minY;
  let maxDist = (X + minSize[0] * 0.5) * (X + minSize[0] * 0.5) + (Y + minSize[1] * 0.5) * (Y + minSize[1] * 0.5);

  for (let i = 0; i < resGrid; i++) {
    Y = -minY;
    let sizeX = random(minSize[0], maxSize[0]); 
    for (let j = 0; j < resGrid; j++) {
      let sizeY = random(minSize[1], maxSize[1]);
      let midX = X + sizeX * 0.5;
      let midY = Y + sizeY * 0.5;
      let dist = midX * midX + midY * midY;
      dist /= maxDist;
      let sizeZ = Math.max(lerp(maxSize[2], minSize[2], Math.sqrt(dist)), minSize[2]);
      sizeZ += -noiseZ + 2 * random() * noiseZ;
      let cube = new Fresco.Cube(createVector(X, Y, marginZ / 2), createVector(X + sizeX, Y + sizeY, marginZ / 2 + sizeZ));
      scene.registerShape3D(cube);
      if (hatch) {
        // let lines = cube.hatchFace(angle, hatchSpacing, '-xz');
        let lines = cube.hatchFace(angle, hatchSpacing, '-xy');
        lines.forEach(l => scene.registerShape2D(l));
      }

      let cube2 = new Fresco.Cube(createVector(X, Y + shiftY, -marginZ / 2 - sizeZ), createVector(X + sizeX, Y + sizeY + shiftY, -marginZ / 2));
      scene.registerShape3D(cube2);
      if (hatch) {
        // let lines = cube2.hatchFace(angle, hatchSpacing, '-xz');
        let lines = cube2.hatchFace(angle, hatchSpacing, '+xy');
        lines.forEach(l => scene.registerShape2D(l));
      }
      Y += sizeY;
    }
    X += sizeX;
  }

  scene.registerShape3D(new Fresco.Quad(
    createPoint(minX, minY + shiftY, -marginZ / 2 + 0.01),
    createPoint(minX, -minY + shiftY, -marginZ / 2 + 0.01),
    createPoint(-minX, -minY + shiftY, -marginZ / 2 + 0.01),
    createPoint(-minX, minY + shiftY, -marginZ / 2 + 0.01)
  ))

  up = createVector(0, 0, 1);
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  let c = Math.cos(startPhase + frameCount / rotationPeriod * 2 * Math.PI);
  let s = Math.sin(startPhase + frameCount / rotationPeriod * 2 * Math.PI);
  center = createVector(c * camTarget[0] + s * camTarget[1], -s * camTarget[0] + c * camTarget[1], camTarget[2]);
  camera = createVector(c * camPos[0] + s * camPos[1], -s * camPos[0] + c * camPos[1], camPos[2]);
  shapes = scene.render(camera, center, up, width, height, fovy, znear, zfar, step);

  shapes.forEach(s => {
    s.position = createPoint(0, globalOffsetY);
    s.draw();
  });

  if (addText) {
    let letterShapes = Fresco.Futural.drawText('Pyramid City · Fresco 2021', 10, createVector(0, - 2.5 * height / 8), true, true);
    shapes.push(...letterShapes);
  }

  if (!animate) {
    noLoop();
  }
}