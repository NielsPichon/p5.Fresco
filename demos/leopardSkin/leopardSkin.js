const backgroundClr = '000';
const lineAlpha = 255;
const lineThickness = 1;
const boxThickness = 10;
const noiseAmount = 30;
const sizeVariabilityPercentage = 0;
const noiseFreq = 0.001;
const hatchLength = 200;
const hatchSpacing = 3;
const hatchAngle = -Math.PI / 4;
const minRandomOffset = 3;
const maxCuts = 2;
const cutSize = 15;
const spotSpacing = 235;
const spotSize = 150;
const margin = spotSpacing;
const curvyHatch = true;
const curveAmount = 50;
const curveNoiseFreq = 0.01;
const boxDraw = true;
const tiling = false;
const poisson = true;
const spotsSeed = null;
const shapeResolution = 64;
const addRing = true;
const ringThickness = 3;

// leopard skin box tiled
// const backgroundClr = '000';
// const lineAlpha = 200;
// const lineThickness = 3;
// const boxThickness = 10;
// const noiseAmount = 7;
// const sizeVariabilityPercentage = 0.7;
// const noiseFreq = 0.005;
// const hatchLength = 35;
// const hatchSpacing = 6;
// const hatchAngle = -Math.PI / 4;
// const minRandomOffset = 3;
// const maxCuts = 2;
// const cutSize = 15;
// const spotSpacing = 235;
// const spotSize = 50;
// const margin = spotSpacing;
// const curvyHatch = false;
// const boxDraw = true;
// const tiling = true;
// const poisson = false;
// const spotsSeed = null;
// const shapeResolution = 64;
// const addRing = false;
// const ringThickness = 3;

// leopard skin box poisson
// const backgroundClr = '000';
// const lineAlpha = 200;
// const lineThickness = 3;
// const boxThickness = 10;
// const noiseAmount = 7;
// const sizeVariabilityPercentage = 0.7;
// const noiseFreq = 0.005;
// const hatchLength = 35;
// const hatchSpacing = 6;
// const hatchAngle = -Math.PI / 4;
// const minRandomOffset = 3;
// const maxCuts = 2;
// const cutSize = 15;
// const spotSpacing = 235;
// const spotSize = 50;
// const margin = spotSpacing;
// const curvyHatch = false;
// const boxDraw = true;
// const tiling = true;
// const poisson = true;
// const spotsSeed = 1730;
// const shapeResolution = 64;
// const addRing = false;
// const ringThickness = 3;


let sampler;
let hatchDir = p5.Vector.fromAngle(hatchAngle);
let hatchNormal = p5.Vector.fromAngle(hatchAngle + Math.PI / 2);


class Spot extends Fresco.Collection {
  constructor(radius, variability = 0, resolution = 64) {
    super();
    let r = radius - variability * radius + random(2 * variability * radius);
    // create circle
    let base = new Fresco.Circle(r, resolution);
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
          let hatch = new Fresco.Line(start, end, 10);
          hatch.strokeWeight = lineThickness;
          hatch.color = colorFromHex('fff', lineAlpha);
          if (curvyHatch) {
            for (let i = 1; i < hatch.vertices.length - 1; i++) {
              hatch.vertices[i].add(hatchNormal.copy().mult(
                noise(
                  hatch.vertices[i].x * curveNoiseFreq + offset,
                  hatch.vertices[i].y * curveNoiseFreq + offset
                  ) * 2 * curveAmount - curveAmount
              ));
            }
            hatch.isPolygonal = false;
          }
          this.attach(hatch);
        }
      }
    });
  }
}

class SpotInASpot extends Fresco.Collection {
  constructor(spotSize, sizeVariabilityPercentage, shapeResolution) {
    super();
    this.attach(new Spot(spotSize, sizeVariabilityPercentage, shapeResolution));
    let smallerSpot = new Spot(spotSize, sizeVariabilityPercentage, shapeResolution);
    smallerSpot.setScale(createVector(0.5, 0.5));
    this.attach(smallerSpot);
  }
}

function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed(spotsSeed);
  loadFonts();
  // Fresco.registerShapes = false;

  if (tiling) {
    if (poisson) {
      sampler = new PoissonSampler(Spot, [spotSize, sizeVariabilityPercentage], width - margin, height - margin, spotSpacing, 10);
    } else {
      sampler = new Tiler(Spot, [spotSize, sizeVariabilityPercentage], 4, 5, 20, 20);
    }
  } else {
    sampler = new SpotInASpot(spotSize, sizeVariabilityPercentage, shapeResolution);
  }

  if (boxDraw) {
    sampler.setScale(createVector(0.5, 0.5));
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  sampler.draw();

  if (boxDraw) {
    let sq = new Fresco.Rect(0.55 * width, 0.55 * height);
    sq.layer = 1;
    sq.strokeWeight = boxThickness;
    sq.draw();
  }

  let ring = new Fresco.Circle(spotSize * 1.5);
  ring.setScale(createVector(1, 0.25));
  ring.freezeTransform();
  ring.setRotation(Math.PI / 4);
  ring.strokeWeight = 2;
  ring.layer = 2;
  ring.draw();

  noLoop();
  print('Number of shapes', Fresco.shapeBuffer.length)
}