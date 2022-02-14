const backgroundClr = '000';
const res = 80;
const noiseFreq = 0.01;
const margin = 100;
const symetry = true;
const chars = ["F", "R", "E", "S", "C", "O", "f", "r", "e", "s", "c", "o", "."];
const layers = [0,  0,   0,   0,   0,   0,   1,   1,   1,   1,   1,   1,   1]

function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed(7262);
  loadFonts();

  let w = width - 2 * margin
  let h = height - 2 * margin
  let incX = w / res;
  let incY = h / Math.floor(res * h / w);
  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res * h / w; j++) {
      let pos = createVector(i * incX - w / 2, j * incY - h / 2)
      let offset = 0;
      if (!symetry) offset += width * height;
      let n = max(
        0,
        min(
          Math.floor(smoothstep(noise(
            pos.x * noiseFreq + offset,
            pos.y * noiseFreq + offset
          )) * chars.length),
          chars.length - 1
        )
      );
      let noiseChar = chars[n];
      let shapes = Fresco.Futural.drawText(noiseChar, 5, pos, false, false);
      shapes.forEach(s => {
        s.layer = layers[n];
        s.draw();
      });
    }
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  noLoop();
}