const backgroundClr = '000';
const radius = 400; // Sphere radius
const showSphere = false;
const numLines = 150;
const res = 50; // Number of points along each line
const angle = 30; // Sphere rotation in degrees around the x axis
const noiseFreq = 0.1; // Line length modulation frequency
const noiseAmplitude = 50; // Line length modulation amplitude in percent of sphere slice radius
const linesBaseRadius = 1000 * Math.sqrt(2) / 2; // Half of the Lines base length
const sphereNoiseFreq = 0.005;
const sphereNoiseAmp = 100; // In percent of z coordinate
const linesAngle = 45; // lines angle in deg
const cutWidth = 5; // how many points to cut
const cutNoiseFreq = 0.1; // cut offset noise freq
const cutNoiseAmp = 20; // cut offset noise amplitude
const squareGrid = true; // whether lines should initially draw a grid or just the sphere


let lines = [];


function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  let incY = 2 * radius / numLines;
  let s = Math.sin(angle * Math.PI / 180);
  let c = Math.cos(angle * Math.PI / 180);
  for (let i = 0; i < numLines; i++) {
    let y = incY * i + incY/2 - radius;
    let xr = Math.sqrt(radius * radius - y * y);
    let noiseL = noise(-xr * noiseFreq + width, y * noiseFreq + height) * noiseAmplitude * xr / 100;
    let noiseR = noise(xr * noiseFreq + width, y * noiseFreq + height) * noiseAmplitude * xr / 100;
    let line;
    if (squareGrid) {
      line = new Fresco.Line(
        createPoint(-linesBaseRadius + noiseL, y),
        createPoint(linesBaseRadius - noiseR, y),
        res
      );
    } else {
      line = new Fresco.Line(
          createPoint(-xr, y),
          createPoint(xr, y),
          res
      );
    }

    line.vertices.forEach(vtx => {
      // Compute each point's z. The max here avoids floating point arithmetic
      // issues and handles the points ouside the sphere in the same go
      vtx.z = Math.sqrt(Math.max(0, xr * xr - vtx.x * vtx.x));
      // Rotate
      let ybuff = vtx.y;
      let zbuff = vtx.z;
      vtx.y = lerp(ybuff, ybuff * c + zbuff * s,  zbuff / radius);
      vtx.z = lerp(zbuff, -s * ybuff + zbuff * c, zbuff / radius);
    });

    // resample to makes sure distance between vertices
    // is constant before applying noise
    line = resample(line, res, false, false);

    line.vertices.forEach(vtx => {
      vtx.z = Math.sqrt(Math.max(0, xr * xr - vtx.x * vtx.x));
      // If on sphere, displace with perlin noise
      if (Math.abs(vtx.x) < xr) {
        vtx.y += (noise(
          vtx.x * sphereNoiseFreq + width,
          vtx.y * sphereNoiseFreq + height,
          vtx.z * sphereNoiseFreq
          ) - 0.5)* sphereNoiseAmp * vtx.z / 100;
        }
    });

    // rotate and freeze transform
    line.rotation = linesAngle * Math.PI / 180;
    line.freezeTransform();
    line.isPolygonal = false;

    let line2 = line.copy();
    let offset = noise(y * cutNoiseFreq) * cutNoiseAmp;
    line.vertices.splice(Math.floor(res / 2  - cutWidth / 2 + offset + 0.5));
    line2.vertices.splice(0, Math.floor(res / 2 + cutWidth / 2 + offset + 0.5));

    lines.push(line);
    lines.push(line2);
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  if (showSphere) {
    let sphere = new Fresco.Circle(radius);
    sphere.draw();
  }
  lines.forEach(l => {
    l.draw();
  });
  noLoop();
}