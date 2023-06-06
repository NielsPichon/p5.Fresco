// all equations are from
// http://web.mit.edu/1.63/www/Lec-notes/Surfacetension/Lecture5.pdf

const backgroundClr = '000';
const velocity = 10;
const gravity = 9.81;
const baseRadius = 0.4;
const scaleMultiplier = 10;
const density = 1e6;
const resolution = 10; // as a number of points per baseRadius
const maxEpsilon = 0.5;

const surfaceTension = (
  Math.pow(0.697 / 0.34, 2) * density * Math.pow(baseRadius, 3));
console.log('surface tension', surfaceTension);

let water = [];

const baseJet = (z) => {
  return (
    baseRadius * Math.pow(1 + 2 * gravity * z / Math.pow(velocity, 2), -0.25));
}

const disturbance = (z, k, epsilon) => {
  omega = sqrt(
    surfaceTension / (density * Math.pow(baseRadius, 3))
    * k * baseRadius * (1 - Math.pow(k * baseRadius, 2))
    * BESSEL.besselj(k * baseRadius, 1) / BESSEL.besselj(k * baseRadius, 0)
  )
  return epsilon * Math.exp(omega * z / velocity) * Math.sin(k * z);
}

// class describing a Descart Oval
class Oval extends Fresco.Shape {
  // https://fr.wikipedia.org/wiki/Ovale_de_Descartes
  constructor(f1, f2, gamma, resolution = 100) {
    let sigma1 = f1 + f2 + gamma;
    let sigma2 = f1 * f2 + f2 * gamma + gamma * f1;
    let sigma3 = f1 * f2 * gamma;

    let vtx = new Array(resolution);
    for (let i = 0; i < resolution / 2; i++) {
      vtx[i] = createPoint(0, 0);
      vtx[resoltuion - i] = createPoint(0, 0);
    }

    // (x^2+y^2-sigma2)^2 + 8 sigma3 x - 4 sigma1 sigma3 =0
  }
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  let vtx = [];
  let sym = [];

  let waveNumbers = [];
  for (let k = 1; k < 1 / baseRadius; k++)  {
    waveNumbers.push(random() * maxEpsilon * baseRadius);
  }
  console.log('num overimposed waves', waveNumbers.length)

  // create the base jet
  let right = 10;
  let z = 0;
  while (right > 0) {
    right = baseJet(z);
    for (let i = 0; i < waveNumbers.length; i++) {
      right += disturbance(z, i + 1, waveNumbers[i]);
    }
    right *= scaleMultiplier;
    vtx.push(createPoint(max(right, 0), z * scaleMultiplier));
    sym.push(createPoint(-max(right, 0), z * scaleMultiplier));
    console.log(right, z)
    z += baseRadius / resolution;
  }

  jet = new Fresco.Shape(vtx);
  jet.isPolygonal = true;

  symJet = new Fresco.Shape(sym);
  symJet.isPolygonal = true;

  water.push(jet, symJet);

  // we estimate at what point will the jet cross the x axis again
  zstart = z;
  maxWidth = 0;
  while (right < 0) {
    right = baseJet(z);
    for (let i = 0; i < waveNumbers.length; i++) {
      right += disturbance(z, i + 1, waveNumbers[i]);
    }
    if (right < maxWidth) {
      maxWidth = right;
    }
    z += baseRadius / resolution;
  }

  // we "round" the secondary drop by shortening it and widening it
  zend = z;
  shorten = (zend - zstart) * 0.1
  zstart = zstart + shorten;
  zend = zend - shorten;
  maxWidth = -maxWidth * 1.2;
  // we draw a Descart Oval of the right width and length
  let secondaryDrop = new Oval(zstart, zend, gamma);


  // add the "large crossing" droplet
}

// draw function which is automatically
// called in a loop
function draw() {
  jet.draw();
  symJet.draw();
  noLoop();
}