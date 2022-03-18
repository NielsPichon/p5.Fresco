const backgroundClr = '000';
const radius = 400; // Sphere radius
const showSphere = false;
const numLines = 400;
const res = 50; // Number of points along each line
const angle = 30; // Sphere rotation in degrees around the x axis
const noiseFreq = 0.1; // Line length modulation frequency
const noiseAmplitude = 200; // Line length modulation amplitude in percent of sphere slice radius
const linesBaseRadius = 1000 * Math.sqrt(2) / 2; // Half of the Lines base length
const sphereNoiseFreq = 0.005;
const sphereNoiseAmp = 100; // In percent of z coordinate
const linesAngle = 135; // lines angle in deg
const cutWidth = 7; // how many points to cut
const cutNoiseFreq = 0.1; // cut offset noise freq
const cutNoiseAmp = 20; // cut offset noise amplitude
const squareGrid = true; // whether lines should initially draw a grid or just the sphere
const maxDashCutLength = 5; // max cut width
const maxDashLength = 10; // max length of a dash segment
const dashProb = 0.8; // probability of adding one more dash
const clip = false; // clips lines going out of the canvas
const drawRect = false; // draws a cans-sized rectangle
const noFirstHalf = true; // removes one half of the drawing. Needs the square grid to be ON

const drawSeed = 9978;

let lines = [];


function dashLine(line) {
  let lineBuff =[]
  while(line.vertices.length > 1 && random() < dashProb) {
    let dashLength = Math.min(Math.floor(random(maxDashLength)), line.vertices.length - 1);
    let cutLength = Math.floor(random(1, maxDashCutLength));
    if (dashLength == 0) {
      break;
    }
    let nuLine = line.copy();
    nuLine.vertices = line.vertices.splice(0, dashLength);
    if (nuLine.vertices.length == 1) {
      continue;
    }
    lineBuff.push(nuLine);
    line.vertices.splice(0, cutLength);
  }
  if (line.vertices.length > 1) {
    lineBuff.push(line);
  }

  return lineBuff;
}


function getLineInSphere(line) {
  let idx = 0;
  for (let i = 0; i < line.vertices.length; i++) {
    if (line.vertices.z == 0) {
      idx = i;
      break;
    }
  }

  let line1 = line.copy()
  line1.vertices = line.vertices.splice(idx);
  return [line, line1];
}


function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed(drawSeed);
  loadFonts();
  // Fresco.registerShapes = false;

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
      if (noFirstHalf) {
        line = new Fresco.Line(
          createPoint(-xr, y),
          createPoint(linesBaseRadius - noiseR, y),
          res
        );  
      } else {
        line = new Fresco.Line(
          createPoint(-linesBaseRadius + noiseL, y),
          createPoint(linesBaseRadius - noiseR, y),
          res
          );
      }
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

    // clamp to canvas
    for (let i = line.vertices.length - 1; i >=0; i--) {
      if (Math.abs(line.vertices[i]).x > width / 2 ||
        Math.abs(line.vertices[i]).y > height / 2 
      ) {
        line.vertices.pop();
      }
    }

    // cut shape in 2
    let line2 = line.copy();
    let offset = noise(y * cutNoiseFreq) * cutNoiseAmp;
    line.vertices.splice(Math.floor(res / 2  - cutWidth / 2 + offset + 0.5));
    line2.vertices.splice(0, Math.floor(res / 2 + cutWidth / 2 + offset + 0.5));

    if (squareGrid) {
      let lineBuff = [];
      // invert line 1 vertices array
      line.vertices.reverse();
      // splice each line to get the part in sphere and the part out
      let [line11, line12] = getLineInSphere(line);
      let [line21, line22] = getLineInSphere(line2);
      lineBuff.push(line11);
      lineBuff.push(line21);

      // make dashed line
      lineBuff.push(...dashLine(line12));
      lineBuff.push(...dashLine(line22));
      
      // register lines
      lines.push(...lineBuff);
    } else {
      lines.push(line);
      lines.push(line2);
    }

    // remove any point that would fall out of the canvas
    if (clip) {
      lines.forEach(l => {
        for (let i = l.vertices.length - 1; i >= 0; i--) {
          let truePos = l.applyTransform(l.vertices[i]);
          if (Math.abs(truePos.x) > width / 2 || Math.abs(truePos.y) > height / 2) {
            l.vertices.splice(i, 1);
          }
        }
      });
    }
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

  if (drawBounds) {
    let rect = new Fresco.Rect(width, height);
    rect.draw();
  }
  noLoop();
}