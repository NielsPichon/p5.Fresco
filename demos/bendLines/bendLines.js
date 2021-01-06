
const backgroundClr = 'f2f1ed';
const numLines = 250;
const minStep = 1;
const maxStep = 30;
const noiseFreq = 0.5;
const randomSkew = 5;
const color = '000000';
const alpha = 170;
const maxDev = 15;
const midPoint = 30;
const noiseUniformization = 3;
const margin = 50;

let lines = [];

function setup() {
  createCanvas(700, 1000);

  let verticalPos = -height / 2;
  let endVerticalPos = -height / 2;

  for (let i = 0; i < numLines; i++) {
    verticalPos += map(Math.pow(random(0, 1), randomSkew), 0, 1, minStep, maxStep);
    endVerticalPos += steeperStep(
      normalizedPerlin(noiseFreq * width, noiseFreq * verticalPos),
                       noiseUniformization) * maxDev;
    
    let newLine = [
      createPoint(-width / 2, verticalPos),
      createPoint(midPoint, verticalPos),
      createPoint(midPoint, verticalPos),
      createPoint(width / 2, endVerticalPos)
    ];

    newLine.color = colorFromHex(color, alpha); 
    append(lines, newLine);
    }
}


function draw() {
  background(colorFromHex(backgroundClr));
  noFill();
  strokeWeight(1.5);

  for (let i = 0; i < numLines; i++) {
    stroke(lines[i].color);
    PBezier(...lines[i]);
  }

  // create a frame around the drawing
  strokeWeight(margin);
  stroke(colorFromHex(backgroundClr));
  line(0, margin / 2, width, margin / 2);
  line(0, height - margin / 2, width, height - margin / 2);
  line(margin / 2, 0, margin / 2, height);
  line(width - margin / 2, 0, width - margin / 2, height);


  noLoop();
}

