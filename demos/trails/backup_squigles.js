const backgroundClr = '000';
const radius = [50, 100];
const lineOffset = 20;
const lineRes = 100;
const showCircle = false;
const relaxSteps = lineRes;
const falloff = 3;
const lookahead = 0.5;
const dynResFactor = 1;

let obsctales = [];
let lines = [];

// TODO: add sine trails
// TODO: make asymetric
// TODO: add lateral falloff speed
// TODO: add multiple obstacles

function relaxation(obstacle) {
  lines.forEach((line) => {
    // Move points towards closest point on circle if inside circle
    for (let j = 1; j < line.vertices.length - 1; j++) {
      let dir = p5.Vector.sub(line.vertices[j], obstacle.position);
      let dist = dir.mag();
      if (dist < obstacle.radius * (1 + falloff)) {
        let moveMag = lerp(
          obstacle.radius,
          0,
          sCurve(dist / (obstacle.radius * (1 + falloff)))
        );
        line.vertices[j].add(dir.setMag(moveMag))
      }
    }
  });
}

function isInObstacle(x) {
  let isIn = null;
  for (let i = 0; i < obsctales.length; i++) {
    if (abs(x - obsctales[i].position.x) < obsctales[i].radius) {
      isIn = obsctales[i];
      break;
    }
  }
  return isIn;
}

function shootLine(lineX) {
  let vtxs = [];
  let posY = -height / 2;
  let offX = 0;
  while (posY < height / 2) {
    obsctales.forEach((obstacle) => {
      let x = lineX + offX;
      let dir = p5.Vector.sub(createVector(x, posY), obstacle.position);
      let dist = dir.mag();
      if (dist < obstacle.radius * (1 + falloff)
          && obstacle.position.y - posY < 0)
      {
        // move point in tangent x direction by some amount proportional to
        // distance to circle such that if on the center point it will move
        // exactly one egde length
        let moveMag = lerp(
          obstacle.radius,
          0,
          sCurve(dist / (obstacle.radius * (1 + falloff)))
        );
        dir.normalize();
        offX += -dir.y * dir.x / abs(dir.x) * moveMag;
      }
    });
    vtxs.push(createPoint(lineX + offX, posY));
    posY += height / lineRes;
  }

  return new Fresco.Shape(vtxs);
}

function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  let newCircle = new Fresco.Circle(radius[0]);
  obsctales.push(newCircle);

  let lineX = -width / 2 + lineOffset / 2;
  while (lineX < width / 2) {
    lines.push(shootLine(lineX));
    lineX += lineOffset;
  }
  //   let newLine = new Fresco.Line(
  //     createVector(lineX, -height / 2),
  //     createVector(lineX, height / 2),
  //     lineRes
  //   );
  //   lines.push(newLine);

  //   let inObstacle = isInObstacle(lineX);
  //   if (inObstacle === null) {
  //     inObstacle = isInObstacle(lineX + lineOffset);
  //     if (inObstacle === null) {
  //       lineX += lineOffset;
  //     } else {
  //       lineX += lerp(
  //         lineOffset / dynResFactor,
  //         lineOffset,
  //         abs(lineX + lineOffset - inObstacle.position.x) / inObstacle.radius
  //       );
  //     }
  //   } else {
  //     lineX += lerp(
  //       lineOffset / dynResFactor,
  //       lineOffset,
  //       abs(lineX - inObstacle.position.x) / inObstacle.radius
  //     );
  //   }
  // }

  // relaxation(obsctales[0]);
}

// draw function which is automatically
// called in a loop
function draw() {
  if (showCircle) {
    obsctales.forEach((obsctale) => {
      obsctale.draw();
      new Fresco.Circle(obsctale.radius * (1 + falloff)).draw();
    });
  }

  lines.forEach((line) => {
    line.draw();
  });
}