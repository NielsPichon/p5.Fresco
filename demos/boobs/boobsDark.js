const minCupRadius = 20;
const maxCupRadius = 50;
const minHeightToWidthRatio = 0.5;
const maxHeightToWidthRatio = 5;
const minTitRadius = 0.2;
const maxTitRadius = 0.3;
const minTitOffset = -2; 
const maxTitOffset = 0.5; 
const cupColors = ['cad2c5'];
const titColor =  ['ef476f', 'f6bd60'];
const gridResolution = 6;
const globalScale = 0.6;
const backgroundClr = '003049';
const cupContours = true;
const titContours = false;
const lineWeight = 3;
const margin = 100;
const marginColor = '003049';


let geo = [];
let X;
let Y;
let xSpacing;
let ySpacing;

function setup() {
  createCanvas(1240, 1754);
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
  let nu_geo = new Fresco.Geometry();

  // generate breast parameters
  const cupRadius = random(minCupRadius, maxCupRadius);
  const titRadius = random(minTitRadius * cupRadius, maxTitRadius * cupRadius);
  const heightToWidthRatio = random(minHeightToWidthRatio, maxHeightToWidthRatio);
  
  // create cup
  let cup = new Fresco.Arc(Math.PI, cupRadius);
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
  let tit = new Fresco.Circle(titRadius, 12);
  tit.position.add(createVector(0, -cupHeight - random(minTitOffset * titRadius, maxTitOffset * titRadius)));

  if (titContours) {
    tit.color = colorFromHex(titColor[Math.floor(random(titColor.length))]);
    tit.noFill = false;
    tit.fillColor = colorFromHex(titColor[Math.floor(random(titColor.length))]);
    tit.strokeWeight = lineWeight;
  }
  else {
    tit.fillColor = colorFromHex(titColor[Math.floor(random(titColor.length))]);
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
