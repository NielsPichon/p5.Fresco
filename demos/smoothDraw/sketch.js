const backgroundClr = '000';
const stepSize = 50;
const maxLookBack = 10;
const branchSpeedFactor = 1;
const minBranchLength = 5;
const maxBranchLength = 15;
const branchCurliness = 50;
const branchProb = 0.2;
const diffusivity = 50;


let shouldDraw = false;
let curve;
let oldCurves = [];
let branches = [];

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;
  curve = new Fresco.Shape([]);
}

// draw function which is automatically
// called in a loop
function draw() {
  updateCurve();
  background(colorFromHex(backgroundClr));
  if (curve.vertices.length > 1) {
    curve.drawNoisy(5, diffusivity, 128, true);
  }
  oldCurves.forEach(c => c.drawNoisy(5, diffusivity, 128, true));
  branches.forEach(b => b.draw());
}

function createMousePoint() {
  return createPoint(mouseX - width / 2, height / 2 - mouseY);
}

function mousePressed() {
  shouldDraw = true;
  let a = [];

  if (curve.vertices.length > 1) {
    oldCurves.push(curve.copy());
  }
  curve = new Fresco.Shape([
    createMousePoint(),
    createMousePoint()
  ]);
}

function mouseReleased() {
  shouldDraw = false;
}

function updateCurve() {
  if (!shouldDraw) {
    return;
  }

  let currentPos = createMousePoint();
  let curveLen = (
    curve.vertices.at(-1).dist(curve.vertices.at(-2))
    + currentPos.dist(curve.vertices.at(-1))
  );

  if (curveLen > stepSize) {
    curve.vertices.push(currentPos);
    let tail = new Fresco.Shape(curve.vertices.splice(
      max(0, curve.vertices.length - maxLookBack + 1), maxLookBack));

    tail = resample(tail, 0, false);
    curve.vertices.push(...tail.vertices);

    if (random() < branchProb) {
      growBranch(curve.vertices.length - 2);
    }
  } else {
    curve.vertices.at(-1);
  }
}

function growBranch(idx) {
  let curliness = random(1, 2);
  let center = (
    curve.computeNormals()[idx]
      .copy()
      .normalize()
      .mult(branchCurliness * curliness)
      .add(curve.vertices.at(idx))
  );

  let speed = (
    curve.vertices
      .at(idx).copy().sub(curve.vertices.at(idx - 1)).mult(branchSpeedFactor)
  );
  let prevVtx = curve.vertices.at(idx).copy();
  let vertices = [prevVtx];
  let branchLength = randomInt(minBranchLength, maxBranchLength);
  for (let i = 0; i < branchLength; i++) {
    speed = lerpVector(
      speed, center.copy().sub(prevVtx), 0.3 / curliness);
    prevVtx = prevVtx.copy().add(speed);
    vertices.push(prevVtx);
  }

  branches.push(new Fresco.Shape(vertices));
}