const backgroundClr = '000';

const resGrid = 10; // number of buildings along each axis
const minSize = [0.2, 0.2, 0.1]; // min size of a building along the x, y, and z axes
const maxSize = [0.2, 0.2]; // max size of a building along the x, y axes
const totHeight = resGrid * maxSize[0]; // To try and enforce a cube like city, the totHeight is set to the max width of the city 
const maxSizeZ = totHeight / 2; // Max height is always at most half the totHeight to avoid building collisions
const noiseZ = 0.2; // Changes alignment of building's ground. Set to 0 for perfect alignement

const citySeed = 3965; // Random seed

const camPos = [-6, -5.85, 0];
const camTarget = [0, 0.15, 0];
const startPhase = 0.31; // Camera angle at start with regard to the base camera position

const hatch = true; // whether to add cross hatch "shadow"
const hatchSpacing = 0.02; // spacing between cross hatch lines
const hatchAngle = -Math.PI / 3; // angle of the cross hatching

const animate = false; // whether to rotate the camera around the center
const rotationPeriod = 280; // camera rotation speed, expressed as the revolution period in number of frames

const addText = false; // whether to draw the drawing title

const finalTranslateY = 0; // Translate the rendered drawing by some amount vertically to ease centering
const globalScale = 0.8; // Scale the result of the path tracing

let shapes;
let center;
let up;
let camera;
let scene;
let fovy = 50.0;
let znear = 0.1;
let zfar = 100.0;
let step = 0.01;
let rings = [];

function setup() {
  createA4RatioCanvas(1000 / Math.sqrt(2));
  background(colorFromHex(backgroundClr));
  setSeed(citySeed);
  loadFonts();

  scene = new Fresco.Scene3D();

  let minX = 0.25 * resGrid * (minSize[0] + maxSize[0]);
  let minY = 0.25 * resGrid * (minSize[1] + maxSize[1]);
  let X = -minX;
  let Y = -minY;

  for (let i = 0; i < resGrid; i++) {
    Y = -minY + random(minSize[1], maxSize[1]) * 0.5;
    let sizeX = random(minSize[0], maxSize[0]); 
    for (let j = 0; j < resGrid; j++) {
      let sizeY = random(minSize[1], maxSize[1]);
      // we restrict higher Z range to buildings that are further away on X or Y axes.
      let M = lerp(minSize[2], maxSizeZ, Math.max(i / (resGrid - 1), j / (resGrid - 1)));
      let sizeZ = random(minSize[2], M);
      let cube = new Fresco.Cube(createVector(X, Y, -totHeight / 2 - random() * noiseZ), createVector(X + sizeX, Y + sizeY, -totHeight / 2 + sizeZ));
      scene.registerShape3D(cube);
      if (hatch) {
        let lines = cube.hatchFace(hatchAngle, hatchSpacing, '-xz');
        lines.forEach(l => scene.registerShape2D(l));
      }

      sizeZ = random(minSize[2], M);
      let complement = new Fresco.Cube(createVector(X, Y, totHeight / 2 + random() * noiseZ), createVector(X + sizeX, Y + sizeY, totHeight / 2 - sizeZ));
      scene.registerShape3D(complement);
      if (hatch) {
        let lines = complement.hatchFace(hatchAngle, hatchSpacing, '-xz');
        lines.forEach(l => scene.registerShape2D(l));
      }

      Y += sizeY;
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
    s.position = createPoint(0, finalTranslateY);
    s.scale = createVector(globalScale, globalScale);
    s.draw();
  });

  if (addText) {
    let letterShapes = Fresco.Futural.drawText('Twin Cities · Fresco 2021', 6, createVector(0, - 2.5 * height / 8), true, true);
    shapes.push(...letterShapes);
  }

  if (!animate) {
    noLoop();
  }
}