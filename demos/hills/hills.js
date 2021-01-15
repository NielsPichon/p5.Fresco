// theatre stage
const offset = 100;
const noiseDrift = 200;
const strokeClr = '79ADDC';
const dropShadowClr = '79ADDC';
const backgroundClr = '79ADDC';
let colors = ['FFC09F', 'FFEE93', 'FCF5C7', 'ADF7B6'];
const margins = 50;

// colorful waves
// const offset = 5;
// const noiseDrift = 15;
// const strokeClr = '79ADDC';
// const dropShadowClr = '79ADDC';
// const backgroundClr = '79ADDC';
// let colors = ['FFC09F', 'FFEE93', 'FCF5C7', 'ADF7B6'];
// const margins = 50;

// dunes
// const offset = 5;
// const noiseDrift = 15;
// const strokeClr = '564941';
// const dropShadowClr = '564941';
// const backgroundClr = '000038';
// let colors = ['dbc0a8', 'dbd4a8'];
// const margins = 0;

const period = 5;
const absolute = true; // whether to use a sin or an absolute value of a sin
const resolution = 100;
const noiseFreq = 0.01;
const strokeOpacity = 128;
const amplitudeMultiplier = 0.25;
const dropShadow = true;
const dropShadowOffset = 5;
const dropShadowOpacity = 50;
const colorOpacity = 128;

let s;

function setup() {
  createCanvas(700, 1000);
  background(backgroundClr);

  // convert colors to rgba
  for (let  i = 0; i < colors.length; i++) {
    colors[i] = colorFromHex(colors[i], colorOpacity);
  }

  // create amplitude and increment for sine wave vertices
  const xIncr = width / (resolution - 1);
  let angleMultiplier = 1 / (resolution + 1) * period * 2 * PI;
  let amplitude = width / period * amplitudeMultiplier;
  if (absolute) {
    angleMultiplier *= 0.5;
  }
  let vertices = [];
  let x = -width / 2 - width; // add one extra length on the left and right sides
                              // to always have some shape in the canvas
  let y;
  // create sine wave vertices
  for (let  i = 0; i < 4 * resolution; i++) {
    y = amplitude * sin(i * angleMultiplier);
    if (absolute) {
      y = Math.abs(y);
    }
    vertices.push(createPoint(x, y));
    x += xIncr;
  }

  // add 2 extra vertices at the very bottom of the canvas to make
  // sure the fill will cover the entire canvas
  vertices.push(createPoint(2 * width, -height));
  vertices.push(createPoint(-2 * width, -height));

  s = new Cardioid.Shape(vertices);
  s.position = createVector(0, height / 2);
  s.color = colorFromHex(strokeClr, strokeOpacity);
  s.noFill = false;
  s.fillColor = colors[0];
}

function draw() {
  
  if (dropShadow) {
    shadow = s.copy();
    shadow.position.add(dropShadowOffset, dropShadowOffset);
    shadow.fillColor = colorFromHex(dropShadowClr, dropShadowOpacity);
    shadow.noStroke = true;
    shadow.draw();
  }
  s.draw();
  
  // move shape down and offset horizontally based on noise 
  let x = map(noise(noiseFreq * s.position.y), 0, 1, -noiseDrift, noiseDrift);
  s.position.add(createVector(x, -offset));

  // interpolate color
  s.fillColor = colorInterp(s.position.y / height + 0.5, colors);

  // draw margins
  if (margins > 0) {
    border(margins, colorFromHex(backgroundClr));
  }

  // when low enough, stop
  if (s.position.y < -height) {
    noLoop();
  }
}
