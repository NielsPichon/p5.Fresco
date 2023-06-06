const backgroundClr = 'fff';
const lineColor = '000';
const showCircle = true;
const showFalloff = false;
const radius = [25, 100];
const numObstacles = 3;
const lineOffset = 10;
const lineRes = 1000;

const falloff = 10; // horizontal falloff of obstacle
const lookahead = 0.8; // how many radii ahead to look
const roundness = 1; // how round the effect of an obstacle is
const drawOffset = -0.5; // how much to offset the line from the obstacle

const momentum = 1;
const pullback = 0.05;

const oscFreq = 300;
const oscAmplitude = 2;
const oscDampen = 600;

const noiseScale = 3;
const noiseFreq = 0.01;


let obsctales = [];
let lines = [];

// cool seeds
// 2248

function shootLine(lineX, obstacle) {
  let vtxs = [];
  let posY = height / 2;
  let offX = 0;
  const yOff = height / lineRes;
  let xMom = 0;
  let maxOff = 0;
  while (posY > -height / 2) {
    // compute the max X displacment per vertex
    let x = lineX + offX;
    const lookY = posY - obstacle.radius * drawOffset;
    let dir = p5.Vector.sub(createVector(x, lookY), obstacle.position);
    let dist = dir.mag();
    if (dist < obstacle.radius * (1 + falloff)
        && obstacle.position.y < lookY
        && abs(obstacle.position.y - lookY) < obstacle.radius * (1 + lookahead)
    ) {
      // move point in tangent x direction by some amount proportional to
      // distance to circle such that if on the center point it will move
      // exactly one egde length
      let moveMag = lerp(
        obstacle.radius * roundness,
        0,
        dist / (obstacle.radius * (1 + falloff))
      );
      dir.normalize();
      offX += dir.y * dir.x / abs(dir.x) * moveMag;
      maxOff = abs(offX);
    } else if (
      abs(lineX - obstacle.position.x) < obstacle.radius * (1 + falloff)
    ) {
      // if the line is on the plus side of the obstacle we want to mimick
      // the minus side. Otherwise we oscillate normally
      let pull = offX * pullback;
      offX += -pull + xMom;
      xMom += -pull * momentum;
    }
    vtxs.push(createPoint(lineX + offX, posY));
    posY -= yOff;
  }

  // we now scale things down such that the max displacement is exactly radius
  // if the line where to be in the center of the obstacle
  if (abs(lineX - obstacle.position.x) < obstacle.radius * (1 + falloff)) {
    let tgt = lerp(
      obstacle.radius,
      0,
      abs(lineX - obstacle.position.x) / (obstacle.radius * (1 + falloff))
    );
    let scaleFactor = tgt / maxOff;
    vtxs.forEach((vtx) => {
      vtx.x = lineX + (vtx.x - lineX) * scaleFactor;
    });
  }

  return new Fresco.Shape(vtxs);
}

function relaxation(obstacle) {
  const phaseOffset = random() > 0.5 ? 0 : PI;
  lines.forEach((line) => {
    line.vertices.forEach((vtx) => {
      // apply deformation
      let dir = p5.Vector.sub(vtx, obstacle.position);
      let dist = dir.mag();
      let originalX = vtx.x;
      if (dist < obstacle.radius * (1 + falloff)) {
        let moveMag = lerp(
          obstacle.radius,
          0,
          sCurve(dist / (obstacle.radius * (1 + falloff)))
        );
        vtx.add(dir.normalize().mult(moveMag));
      }

      // apply sine trail
      if (
        vtx.y < obstacle.position.y
        && abs(vtx.x - obstacle.position.x) < obstacle.radius * (1 + falloff)
      ) {
        let yPos = vtx.y - obstacle.position.y;
        let xSine = (
          sin(yPos / oscFreq * 2 * PI + phaseOffset)
          * oscAmplitude * obstacle.radius);
        let sineFalloff = lerp(
          xSine,
          0,
          constrain(
            sCurve(abs(vtx.x - obstacle.position.x)
                   / (obstacle.radius * (1 + falloff))),
            0, 1
          )
        );
        sineFalloff = lerp(
          sineFalloff,
          0,
          constrain(abs(yPos) / oscDampen, 0, 1)
        );
        let interp = yPos / (obstacle.radius * (1 + falloff));
        vtx.x = lerp(vtx.x, originalX + sineFalloff, interp);

        // add noise trail
        extraNoise = noise(
          (vtx.x + width / 2) * noiseFreq,
          (vtx.y + height / 2) * noiseFreq
        ) * noiseScale * obstacle.radius;
        extraNoise = lerp(
          extraNoise,
          lerp(
            extraNoise,
            0,
            constrain(abs(yPos) / oscDampen, 0, 1)
          ),
          0,
          constrain(
            sCurve(abs(vtx.x - obstacle.position.x)
                   / (obstacle.radius * (1 + falloff))),
            0, 1
          )
        );
        vtx.x = lerp(vtx.x, vtx.x + sineFalloff, interp);
      }
    });
  });
}

function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  // gen obstacles and ensure they are always from top to bottom
  // for (let i =0; i < numObstacles; i++) {
  //   let newCircle = new Fresco.Circle(random(...radius));
  //   newCircle.position = createVector(
  //     random(width) - width / 2, random(height) - height / 2);
  //   newCircle.color = colorFromHex(lineColor);
  //   obsctales.push(newCircle);
  // }
  let newCircle = new Fresco.Circle(random(...radius));
  // newCircle.position = createVector(
  //   random(width) - width / 2, random(height) - height / 2);
  newCircle.color = colorFromHex(lineColor);
  obsctales.push(newCircle);
  obsctales.sort((a, b) => -a.position.y + b.position.y);


  let lineX = -width / 2 + lineOffset / 2;
  while (lineX < width / 2) {
  //   lines.push(shootLine(lineX, obsctales[0]));
  //   lineX += lineOffset;
  // }
    let newLine = new Fresco.Line(
      createVector(lineX, -height / 2),
      createVector(lineX, height / 2),
      lineRes
    );
    newLine.color = colorFromHex(lineColor);
    lines.push(newLine);
    lineX += lineOffset;
  }

  obsctales.forEach((obsctale) => {
    relaxation(obsctale);
  });
}

// draw function which is automatically
// called in a loop
function draw() {
  if (showCircle) {
    obsctales.forEach((obsctale) => {
      obsctale.draw();
      if (showFalloff) {
        const newCircle = new Fresco.Circle(obsctale.radius * (1 + falloff));
        newCircle.position = obsctale.position;
        newCircle.color = colorFromHex('888');
        newCircle.draw();
      }
    });
  }

  lines.forEach((line) => {
    line.draw();
  });
}