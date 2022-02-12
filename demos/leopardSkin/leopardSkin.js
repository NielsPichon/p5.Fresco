const backgroundClr = '000';
const noiseAmount = 7;
const sizeVariabilityPercentage = 0.5;
const noiseFreq = 0.005;
const hatchLength = 35;
const hatchSpacing = 1.5;
const hatchAngle = -Math.PI / 4;
const minRandomOffset = 3;
const maxCuts = 2;
const cutSize = 15;
const spotSpacing = 235;
const spotSize = 75;
const margin = spotSpacing;

const spotsSeed = 9867;


let sampler;
let hatchDir = p5.Vector.fromAngle(hatchAngle);

class Spot extends Fresco.Collection {
  constructor(radius, variability = 0) {
    super();
    let r = radius - variability * radius + random(2 * variability * radius);
    // create circle
    let base = new Fresco.Circle(r, 64);
    base.isPolygonal = true;

    //deform circle
    let offset = random(width * height);
    for (let i = 0; i < base.vertices.length - 1; i++) {
      let noiseDisp = noiseVector(
        noise,
        base.vertices[i].x * noiseFreq + width + offset,
        base.vertices[i].y * noiseFreq + height + offset
      ).mult(noiseAmount);
      base.vertices[i].add(noiseDisp);
    }
    base.vertices[base.vertices.length - 1] = base.vertices[0].copy();

    // cut circle (between 0 and 3 times)
    let bases = [base];
    let numCuts = randomInt(maxCuts + 1);
    if (numCuts > 0) {
      let cutPoint = randomInt(base.vertices.length);
      let vertsToEnd = base.vertices.length - cutPoint;
      let buffer = base.vertices.slice(min(cutPoint + 10, base.vertices.length - 1));
      buffer.push(...base.vertices.slice(max(1, cutSize - vertsToEnd + 1), cutPoint));
      base.vertices = buffer;
      bases = [base];

      for (let i = 0; i < numCuts - 1; i++) {
        let j = randomInt(bases.length);
        let b = bases.splice(j, 1)[0];
        if (cutSize  / 2 < b.vertices.length) {
          let cutPoint = randomInt(b.vertices.length - cutSize / 2 - 1);
          let b1 = b.copy();
          b1.vertices = b1.vertices.slice(cutPoint + cutSize / 2);
          b.vertices = b.vertices.slice(0, cutPoint);
          bases.push(b, b1);
        } else {
          bases.push(b);
        }
      }
    }

    // trace spot with hatches
    bases.forEach(base => {
      for (let i = 0; i < base.vertices.length - 1; i++) {
        let edgeL = base.edgeLength(i);
        let hatchCount = edgeL / hatchSpacing;
        for (let j = 0; j < hatchCount; j++) {
          let percentage = j / hatchCount;
          let p = base.edgeInterpolation(percentage, i); // get point along contour
          let n = base.normalAtPoint(p, 0.1); // get normal at point to shape
          let alignment = 1 - abs(n.dot(hatchDir)); // measure how well align the normal is to the hair

          // randomly offset the hair by some amountsuch that contours aligned with the hair are more spread
          p.add(n.copy().mult(random((alignment * hatchLength) + minRandomOffset)));

          // get the hair start and end around the contour point
          let start = p.copy().add(hatchDir.copy().mult(hatchLength * 0.5));
          let end = p.copy().add(hatchDir.copy().mult(-hatchLength * 0.5));

          // create hair
          this.attach(new Fresco.Line(start, end));
        }
      }
    });
  }
}

function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed(spotsSeed);
  loadFonts();
  // Fresco.registerShapes = false;

  sampler = new PoissonSampler(Spot, [spotSize, sizeVariabilityPercentage], width - margin, height - margin, spotSpacing, 10);
  sampler.setScale(createVector(0.5, 0.5));
}

// draw function which is automatically
// called in a loop
function draw() {
  sampler.draw();
  let sq = new Fresco.Rect(0.5 * width, 0.5 * height);
  sq.draw();
  noLoop();
}