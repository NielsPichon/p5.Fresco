const backgroundClr = '000';
const baseSpacing = 2;
const spacingDecay = 2;
const minRadius = 20;
const noiseFreq = 0.005;
const noiseAmount = 10;
const numRings = 50;
const resolution = 500;
const octNum = 5;
const octFalloff = 0.65;
const throughCutProb = 0.5;
const minLargeCutSize = 3;
const maxLargeCutSize = 5;
const maxCutNum = 6;
const minCutNum = 2;
const minSmallCutNum = 3;
const maxSmallCutNum = 8;
const minSmallCutSize = 1;
const maxSmallCutSize = 3;


let rings = [];


function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  // set amout of details in the deformation noise
  noiseDetail(octNum, octFalloff);

  // create center ring
  let baseShape = new Fresco.Circle(minRadius, resolution);
  baseShape.isPolygonal = true;
  let prev = baseShape.copy();

  let furthest_point = 0;

  let maxDist = Math.sqrt(width * width + height * height) / 2;
  // Generate deformed rings in a way that makes sure there will be no overlap
  for (let i = 0; i < numRings - 1; i++) {
    prev.vertices.forEach(v => {
      // decay radius increase with distance to center
      let spacing = baseSpacing * Math.pow(
        lerp(1, 0, v.mag() / maxDist),
        spacingDecay,
      );
      // add noise
      let disp = spacing + noiseAmount * noise(
        (v.x + width / 2) * noiseFreq,
        (v.y + height / 2) * noiseFreq
      );
      // grow shape
      v.add(v.copy().normalize().mult(disp));

      let mag = v.mag();
      if (mag > furthest_point) {
        furthest_point = mag;
      }
    })
    rings.push(prev);
    prev = prev.copy();
  }

  // create some cut shapes starting from the center
  let largeCuts = randomInt(minCutNum, maxCutNum + 1);
  let smallCuts = randomInt(minSmallCutNum, maxSmallCutNum + 1);
  for (let i = 0; i < largeCuts + smallCuts; i++) {
    let startpoint;
    let stopPoint;
    let cutWidth;
    let minCutWidth;
    if (i < largeCuts) {
      cutWidth = randomInt(minLargeCutSize, maxLargeCutSize)
      startpoint = createVector(0, 0);
      stopPoint = p5.Vector.random2D().mult(
        random(3 * furthest_point / 4) + furthest_point / 2);
      minCutWidth = minLargeCutSize;
    } else {
      cutWidth = randomInt(minSmallCutSize, maxSmallCutSize)
      let dir =  p5.Vector.random2D()
      startpoint = dir.copy().mult(
        random(furthest_point / 2));
      stopPoint = dir.mult(
        random(furthest_point / 2) + furthest_point / 2);
        minCutWidth = minSmallCutSize;
    }

    let cutLength = distSquared(stopPoint, startpoint);

    for (let i = rings.length - 1; i >= 0; i--) {
      for (let j = 0; j < rings[i].vertices.length - 1; j++) {
        let edge = rings[i].controlPoints(j);
        let inter = segmentIntersection(
          startpoint, stopPoint, edge[0], edge[1]
        );

        if (inter !== false) {
          let t = Math.min(
            1, distSquared(rings[i].vertices[j], startpoint) / cutLength);
          if (t > 0.5) {
            t = 1 - t;
          }
          t = Math.min(Math.max(Math.sqrt(2 * t), 0), 1);
          let localCutWidth = lerp(minCutWidth, cutWidth, t);
          let new_shape = rings[i].copy();
          new_shape.vertices.splice(j - Math.ceil(localCutWidth / 2));
          rings.push(new_shape);
          rings[i].vertices.splice(0, j + Math.ceil(localCutWidth / 2));
        }
      }
    }
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  rings.forEach(s => {
    s.draw();
  });
}