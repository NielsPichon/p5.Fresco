const minCupRadius = 10;
const maxCupRadius = 50;
const minHeightToWidthRatio = 0.5;
const maxHeightToWidthRatio = 5;
const minTitRadius = 0.1;
const maxTitRadius = 0.3;
const minTitOffset = -2; 
const maxTitOffset = 0.5; 
const cupColors = ['f2dbbc', '21170b', 'eae3dc', 'f4e9b7'];
const titColor = 'cc2440';
const gridResolution = 8;
const globalScale = 0.8;
const backgroundClr = '9ab8f4';
const cupContours = true;
const titContours = false;
const lineWeight = 3;
const margin = 50;
const marginColor = 'cc2440';


let geo = [];
let X;
let Y;
let xSpacing;
let ySpacing;

function setup() {
  createCanvas(2000, 2000);
  background(colorFromHex(backgroundClr));

  // create grid sapcing for spawning boobs at grid intervals
  xSpacing = (width - 2 * margin) / gridResolution;
  ySpacing = (height - 2 * margin) / gridResolution;
  X = -width / 2 + margin + xSpacing / 2;
  Y = height / 2 - margin - ySpacing / 4;

  if (margin > 0) {
    border(margin, colorFromHex(marginColor));
  }
}

function draw() {
  // create and draw some new boobs
  makeBoob(X, Y);

  // increment grid position
  X += xSpacing;
  if (X >= width / 2 - margin) {
    X = -width / 2 + margin + xSpacing / 2;
    Y -= ySpacing;
    if (Y < -height / 2 + margin) {
      noLoop();
    }
  }
}

function makeBoob(X, Y) {
  let nu_geo = new Scatter.Geometry();

  // generate breast parameters
  const cupRadius = random(minCupRadius, maxCupRadius);
  const titRadius = random(minTitRadius * cupRadius, maxTitRadius * cupRadius);
  const heightToWidthRatio = random(minHeightToWidthRatio, maxHeightToWidthRatio);
  
  // create cup
  let cup = new Scatter.Arc(Math.PI, cupRadius);
  if (cupContours) {
    cup.color = colorFromHex(cupColors[Math.floor(random(cupColors.length))]);
    cup.strokeWeight = lineWeight;
  }
  else {
    cup.fillColor = colorFromHex(cupColors[Math.floor(random(cupColors.length))]);
    cup.noStroke = true;
    cup.noFill = false;
  }
  cup.scale.y = heightToWidthRatio;

  let cupHeight = cupRadius * heightToWidthRatio;

  // create tit
  let tit = new Scatter.Circle(titRadius, 12);
  tit.position.add(createVector(0, -cupHeight - random(minTitOffset * titRadius, maxTitOffset * titRadius)));

  if (titContours) {
    tit.color = colorFromHex(titColor);
    tit.noFill = false;
    tit.fillColor = colorFromHex(backgroundClr);
    tit.strokeWeight = lineWeight;
  }
  else {
    tit.fillColor = colorFromHex(titColor);
    tit.noStroke = true;
    tit.noFill = false;
  }

  // offset breast to the left
  cup.position.sub(cupRadius); 
  tit.position.sub(cupRadius); 

  // store tit and cup
  nu_geo.attach(cup);
  nu_geo.attach(tit);

  // duplicate breast to the right
  let cup2 = cup.copy();
  cup2.position.add(cupRadius * 2);
  let tit2 = tit.copy();
  tit2.position.add(cupRadius * 2);

  // store second tit and cup
  nu_geo.attach(cup2);
  nu_geo.attach(tit2);

  // offset the new boobs to their rightful place on the grid
  nu_geo.setPosition(createVector(X, Y));
  nu_geo.setScale(createVector(globalScale, globalScale));

  // add the boobs to the geometry array
  geo.push(nu_geo);

  //draw new boobs
  nu_geo.draw();
}
