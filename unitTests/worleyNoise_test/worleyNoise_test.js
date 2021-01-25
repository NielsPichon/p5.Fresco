const backgroundClr = '000';

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
      stroke(worleyNoise(0.1 * i, 0.1 * j, 0.1 * frameCount) * 255);
      point(i, j);
    }
  }
}