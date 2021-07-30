// dunes
const offset = 1;
const noiseDrift = 50;
const strokeClr = 'bb9457';
const dropShadowClr = '0a1128';
const backgroundClr = '0a1128';
let colors = ['0a1128', '0a1128'];
const margins = 100;

const period = 1;
const absolute = true; // whether to use a sin or an absolute value of a sin
const resolution = 100;
const noiseFreq = 0.05;
const strokeOpacity = 192;
const amplitudeMultiplier = 0.25;
const dropShadow = true;
const dropShadowOffset = 5;
const dropShadowOpacity = 50;
const colorOpacity = 128;

let s;

function setup() {
  createSVGCanvas(700, 1000);
  background(colorFromHex(backgroundClr));

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
  let x = -width / 2 - 3 * width; // add one extra length on the left and right sides
                              // to always have some shape in the canvas
  let y;
  // create sine wave vertices
  for (let  i = 0; i < 10 * resolution; i++) {
    y = amplitude * sin(i * angleMultiplier);
    if (absolute) {
      y = Math.abs(y);
    }
    vertices.push(createPoint(x, y));
    x += xIncr;
  }

  s = new Fresco.Shape(vertices);
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
