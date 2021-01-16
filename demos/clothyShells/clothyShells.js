const numRings = 100;
const numSegments = 12; // resolution of the meshes
const radiusIncrement = 2; // distance between successive rings in pixels
const backgroundClr = 30;
const rotationSpeed = 0.05;
const colorOscillationSpeed = 0.01;
const distortShape = true; // should the shape be distorted
const noiseFreq = 0.01;
const distortionAmount = 0.5; // as a proportion of the ring's radius
const minAlpha = 20;

let rings = [];


function setup() {
  createCanvas(windowWidth, windowHeight);

  let k;
  let n;
  // create the specified amount of rings
  for (let i = 1; i < numRings + 1; i++) {
    append(rings, new Fresco.Circle(i * radiusIncrement, numSegments));
    
    // if distortShape, each ring sees each of its vertices displaced based on perlin noise. The value of the noise will tell
    // how much to move along the normal/radius. The amount is also proportional to the actual radius of the ring
    if (distortShape) {
      for (k = 0; k < numSegments - 1; k++) {
        // get normalized perlin noise at vertex position
        n = normalizedPerlin(noiseFreq * (rings[i - 1].vertices[k].x + width / 2), noiseFreq * (rings[i - 1].vertices[k].y + height / 2));
        // remap the noise to a [-maxDisplacement, + maxDisplacement]
        n = map(n, 0, 1, -distortionAmount * i * radiusIncrement, distortionAmount * i * radiusIncrement);
        // move point along radial direction
        rings[i - 1].vertices[k].add(rings[i - 1].vertices[k].copy().normalize().mult(n));
      }
      // make sure the shape reamins closed
      rings[i - 1].vertices[rings[i - 1].vertices.length - 1] =  rings[i - 1].vertices[0].copy();
    }
  }
}

function draw() {
  background(backgroundClr);
  
  // compute color based on the frameCount to evolve it over time
  let r = map(sin(colorOscillationSpeed * frameCount / 2), -1, 1, 100, 200);
  let g = map(sin(colorOscillationSpeed * frameCount), -1, 1, 100, 200);
  let b = map(cos(colorOscillationSpeed * frameCount), -1, 1, 200, 100);

  // for each successive ring, increase the rotation, based on the current frame
  // then draw the ring
  for (let i = 0; i < numRings; i++) {  
    let a = map(i, 0, numRings, minAlpha, 255);

    rings[i].color = [r, g, b, a];
    rings[i].rotation = radians(frameCount * rotationSpeed * i);
    rings[i].draw();
  }
}
