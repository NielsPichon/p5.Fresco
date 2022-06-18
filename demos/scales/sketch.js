const backgroundClr = '000';
const colorsSineFreq = 10;
const scaleSize = 10; // scale aspect ratio. 10 for dragon-like, >30 for anemon like
const scalesPerRow = 100; // 100 for dragon, 200 for anemon
const numRow = 37; // 10 for anemon, 37 for dragon
const minRadius = 100; // radius of the center hole
const noiseFreq = 0.005; // 0.005 for single octave, 0.0005 for fractal noise
const noiseAmp = 10; // 10 for single octave, 30 for fractal noise
const octaveNoise = false; // whether to use multiple noise octave to distort both scales and circle


let scales = [];


Scale = class extends Fresco.Shape {
  constructor(radius, x, y) {
    super([]);
    for (let theta = 0; theta <= Math.PI; theta += Math.PI / 20) {
      this.vertices.push(
        createPoint(
          x + radius * Math.cos(theta),
          y + radius * Math.sin(theta)
        )
      )
    }
  }
}


function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();

  if (octaveNoise) noiseDetail(8, 0.65);

  // Generate scales
  let totWidth = scalesPerRow * scaleSize * 2;
  let totHeight = scaleSize * numRow;
  for (let i = 0; i < numRow; i++) {
    let xOffset = scaleSize;
    if (i % 2 == 1) {
      xOffset = 2 * scaleSize
    }
    for (let j = 0; j < scalesPerRow; j++) {
      let scale = new Scale(scaleSize, j * scaleSize * 2 + xOffset, -totHeight + scaleSize * i);
      scales.push(scale);
    }
  }

  // Warp them in a circle
  scales.forEach(s => {
    s.vertices.forEach(v => {
      let r = minRadius + Math.abs(v.y);
      let theta = v.x / totWidth * Math.PI * 2;
      v.x = r * Math.cos(theta);
      v.y = r * Math.sin(theta);

      v.add(
        noiseVector(
          noise,
          (v.x + width / 2) * noiseFreq,
          (v.y + height / 2) * noiseFreq
        ).mult(noiseAmp)
      );
    })
  });
}

// draw function which is automatically
// called in a loop
function draw() {
  scales.forEach(s => s.draw());
  noLoop();
}