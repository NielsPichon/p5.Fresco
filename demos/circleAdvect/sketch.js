const backgroundClr = '000';
const baseCircleRadius = 200;
const circleThickness = 20;
const circleResolution = 1000;
const noiseFreq = 0.01;
const noiseAmp = 5;
const span = 0.1;
const pointsRadius = 20;
const relaxIter = 1;
const growthSpeed = 0;

let rings;
let firstVtx;

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  let largeRing = new Fresco.Circle(baseCircleRadius, circleResolution);
  largeRing.span = Math.floor(largeRing.vertices.length * span);
  largeRing.baseLength = 2 * Math.PI / (circleResolution + 1) * baseCircleRadius;
  let smallRing = new Fresco.Circle(
    baseCircleRadius - circleThickness, circleResolution);
  smallRing.baseLength = 2 * Math.PI / (circleResolution + 1) * (
      baseCircleRadius - circleThickness);
  smallRing.span = Math.floor(smallRing.vertices.length * span);
  rings = [smallRing, largeRing];
  rings.forEach(r => r.vertices.forEach(v => v.radius = pointsRadius));

  firstVtx = randomInt(1, circleResolution * (1 - span) - 1);
}


// draw function which is automatically
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

  let vtxPool = [];
  rings.forEach(r => {
    // grow from first
    for (let i = firstVtx; i < firstVtx + r.span - 1; i++) {
      let edge = r.vertices[i + 1].copy().sub(r.vertices[i]);
      r.vertices[i + 1].add(edge.normalize().mult(growthSpeed));
    }

    // if any of the vertices are too far subdivide.
    for (let i = firstVtx + r.span - 1; i >= firstVtx - 1; i--) {
      let edge = r.vertices[i + 1].copy().sub(r.vertices[i]);
      if (edge.mag() > 2 * r.baseLength) {
        let newVtx = edge.mult(0.5).add(r.vertices[i]);
        r.vertices.splice(i + 1, 0, newVtx);
        r.span += 1;
      }
    }
    vtxPool.push(...r.vertices.slice(firstVtx, firstVtx + r.span));
  });

  // relax
  relax(vtxPool, relaxIter);

  rings.forEach(r => {
    r.draw();
  // r.drawPoints();
  });
}