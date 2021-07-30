const angularSpeed = 0.001; // angle increment for each frame
const growSpeed = 0; // scale modulation speed
const minScale = 0.5; // minimum scale
const maxScale = 1; // maximum scale
const rotateBase = true; // whether the largest leave should rotate as well
const numSquares = 100; // number of leaves
const leafScaleFactor = 0.95; // scale down factor between successive leaves
const backgroundClr = '000f1e'; // background color
const contourWeight = 5;
const strokeColor = '000f1e';
const leaveOpacity = 255;
const distortSquare = false;
const noiseFreq = 0.01;
const distortionAmount = 100;
let colors = ['76acfc', '0b0077']; // color of the outter most leave to the inner most one


let s; // variable for the shape
let angle = 37; // variable storing the angle between leaves

function setup() {
  // create canvas
  createSVGCanvas(1000, 1000);

  // Set the random seed
  setSeed();

  // convert colors to rgba
  for (let i = 0; i < colors.length; i++) {
    colors[i] = colorFromHex(colors[i], leaveOpacity);
  }

  // create a square with a fill, and specified
  //stroke color and weight
  s = new Fresco.Square(600);
  s.noFill = false;
  s.color = colorFromHex(strokeColor);
  s.isPolygonal = true;
  
  if (distortSquare) {
    s = subdivide(s, 4);
    for (let  i = 0; i < s.vertices.length; i++) {
      let theta = normalizedPerlin(noiseFreq * (s.vertices[i].x + height / 2), noiseFreq * (s.vertices[i].y + height / 2)) * 10 * PI;
      s.vertices[i].add(p5.Vector.fromAngle(theta).mult(distortionAmount));
    }
  }
}

function draw() {
  background(colorFromHex(backgroundClr));

  // the scale is modulated by a cosine. We choose cosine over sine, because
  // if the growSpeed is 0, the cos is always 1 while the sine is 0;
  let scaleVar = map(cos(frameCount * growSpeed), -1, 1, minScale, maxScale);
  s.setScale(scaleVar);
  s.strokeWeight = contourWeight * scaleVar;

  // for each leave
  for (let i = 0; i < numSquares; i++) {
    // intepolate the color based on the leave number
    // color = [i * 10, 255 - i * 25, 255 - i * 10];
    s.fillColor = colorInterp(log(i + 1) / log(numSquares + 1), colors);

    // scale down the leaf
    s.strokeWeight *= leafScaleFactor;
    s.scale.mult(leafScaleFactor);

    // rotate the leaf
    s.rotation = i * angle;
    // if we also want to rotate the base we add one angle increment
    if (rotateBase) {
      s.rotation += angle;
    }
    s.draw();
  }

  angle += angularSpeed;
}
