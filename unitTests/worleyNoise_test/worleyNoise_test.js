const backgroundClr = '000';
const octaves = 2;
const lacunarity = 0.3;
const noiseFreq = 0.02;

function setup() {
  createCanvas(150, 150);
  background(colorFromHex(backgroundClr));
  setSeed();
}

// draw function which is automatically 
// called in a loop
function draw() {
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let n = 255 * fractalNoise(worleyNoise, octaves, lacunarity,
        i * noiseFreq, j * noiseFreq, frameCount * noiseFreq);
      stroke(n);
      point(i, j);
    }
  }
}