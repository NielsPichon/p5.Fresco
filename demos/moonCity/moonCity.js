const backgroundClr = '000';

const numRings = 2; // number of buildings along each axis
const maxSizeZ = .5; // max height
const minSizeZ = 0.1 // min height
const ringRadius = .3; // radius of each building ring
const averageSize = 0.5; // Average building size along the perimeter of the circle
const resolution = 5; // number of points along the perimeter per building
const noCenter = true; // no building in the center circle

const citySeed = 3965; // Random seed

const camPos = [-6, -5.85, 5];
const camTarget = [0, 0.15, 0];
const startPhase = 0.31; // Camera angle at start with regard to the base camera position

const animate = false; // whether to rotate the camera around the center
const rotationPeriod = 280; // camera rotation speed, expressed as the revolution period in number of frames

const addText = false; // whether to draw the drawing title

const finalTranslateY = 0; // Translate the rendered drawing by some amount vertically to ease centering

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
  createA4RatioCanvas(1000 / Math.sqrt(2));
  background(colorFromHex(backgroundClr));
  setSeed(citySeed);
  loadFonts();

  scene = new Fresco.Scene3D();

  let start = 0;
  if (noCenter) {
    start += 1;
  }

  for (let i = start; i < numRings; i++) {
    let r = ringRadius * i;
    let R = ringRadius * (i + 1);
    let midR = ringRadius * (i + 0.5);
    let angularIntercept = 2 * Math.PI / Math.round(2 * Math.PI * midR / averageSize);
    for (let j = 0; j < 2 * Math.PI - angularIntercept; j += angularIntercept) {
      let h = random(minSizeZ, maxSizeZ);
      let Rbuf = [];
      let rbuf = [];
      for (let k = 0; k <= angularIntercept; k += angularIntercept / (resolution - 1)) {
        rbuf.push(createVector(r * Math.cos(k + j), r * Math.sin(k + j), 0));
        Rbuf.push(createVector(R * Math.cos(angularIntercept - k + j), R * Math.sin(angularIntercept - k + j), 0));
      }
      let RbufTop = [];
      let rBufTop = [];
      Rbuf.forEach(v => {
        let vTop = v.copy();
        vTop.z += h;
        RbufTop.unshift(vTop);
      });
      rbuf.forEach(v => {
        let vTop = v.copy();
        vTop.z += h;
        rBufTop.unshift(vTop);
      });

      let bottom = [...Rbuf, ...rbuf, Rbuf[0]];
      let top = [...RbufTop, ...rBufTop, RbufTop[0]];
      let side1 = [...Rbuf, ...RbufTop, Rbuf[0]];
      let side2 = [...rbuf, ...rBufTop, rbuf[0]];
      let side3 = [rbuf[0], Rbuf[Rbuf.length - 1], RbufTop[0], rBufTop[rBufTop.length - 1], rbuf[0]];
      let side4 = [rbuf[rbuf.length - 1], Rbuf[0], RbufTop[RbufTop.length - 1], rBufTop[0], rbuf[rbuf.length - 1]];

      scene.registerShape3D(new Fresco.ArbitraryShape(new Fresco.Shape(bottom)));
      scene.registerShape3D(new Fresco.ArbitraryShape(new Fresco.Shape(top)));
      scene.registerShape3D(new Fresco.ArbitraryShape(new Fresco.Shape(side1)));
      scene.registerShape3D(new Fresco.ArbitraryShape(new Fresco.Shape(side2)));
      scene.registerShape3D(new Fresco.ArbitraryShape(new Fresco.Shape(side3)));
      scene.registerShape3D(new Fresco.ArbitraryShape(new Fresco.Shape(side4)));
    }
  }

  up = createVector(0, 0, 1);
}

// draw function which is automatically 
// called in a loop
function draw() {
  setBackgroundColor(colorFromHex(backgroundClr));
  let c = Math.cos(startPhase + frameCount / rotationPeriod * 2 * Math.PI);
  let s = Math.sin(startPhase + frameCount / rotationPeriod * 2 * Math.PI);
  center = createVector(c * camTarget[0] + s * camTarget[1], -s * camTarget[0] + c * camTarget[1], camTarget[2]);
  camera = createVector(c * camPos[0] + s * camPos[1], -s * camPos[0] + c * camPos[1], camPos[2]);
  shapes = scene.render(camera, center, up, width, height, fovy, znear, zfar, step);

  shapes.forEach(s => {
    s.position = createPoint(0, finalTranslateY);
    s.draw();
  });

  if (addText) {
    let letterShapes = Fresco.Futural.drawText('Moon City · Fresco 2021', 6, createVector(0, - 2.5 * height / 8), true, true);
    shapes.push(...letterShapes);
  }


  if (!animate) {
    noLoop();
  }
}