const backgroundClr = '000';
const resGrid = 5;
const minSize = [0.2, 0.2, 0.2];
const maxSize = [0.2, 0.2, 0.4];
const maxFloors = 6;
const camPos = [-6, -6, 9.5];
const camTarget = [0, 0, 0.5];
const roadSize = 0;
const hatch = true;
const hatchSpacing = 0.01;
const angle = -Math.PI / 3;
const citySeed = 6186;
const rotationPeriod = 280; // in number of frames
const animate = false;
const startPhase = 0.31; // angle at start
const addText = true;
const globalOffsetY = 150;

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
  let X = -minX + random(minSize[0], maxSize[0]) * 0.5;
  let Y = -minY;
  let maxDist = X * X + Y * Y;

  for (let i = 0; i < resGrid; i++) {
    Y = -minY + random(minSize[1], maxSize[1]) * 0.5;
    let sizeX = random(minSize[0], maxSize[0]); 
    for (let j = 0; j < resGrid; j++) {
      let sizeY = random(minSize[1], maxSize[1]);
      let dist = X * X + Y * Y;
      let M = dist > maxDist / 4 ? Math.max(maxFloors / 2, 1) : maxFloors;
      // M = dist > 9 * maxDist / 16 ? Math.max(maxFloors - 2, 1) : M;
      let floors = randomInt(1, M + 1);
      let X0 = X;
      let Y0 = Y;
      let Z0 = 0;
      let divider = 1;
      for (let k = 0; k < floors; k++){
        let sizeZ = random(minSize[2], maxSize[2] * divider); 
        let cube = new Fresco.Cube(createVector(X0, Y0, Z0), createVector(X0 + sizeX * divider, Y0 + sizeY * divider, Z0 + sizeZ));
        scene.registerShape3D(cube);
        if (hatch) {
          let lines = cube.hatchFace(angle, hatchSpacing, '-xz');
          lines.forEach(l => scene.registerShape2D(l));
        }

        X0 += sizeX * divider * 0.25;
        Y0 += sizeY * divider * 0.25;
        Z0 += sizeZ;
        divider *= 0.5;
      }
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
    let letterShapes = Fresco.Futural.drawText('Sin City · Fresco 2021', 10, createVector(0, - 2.5 * height / 8), true, true);
    shapes.push(...letterShapes);
  }

  if (!animate) {
    noLoop();
  }
}