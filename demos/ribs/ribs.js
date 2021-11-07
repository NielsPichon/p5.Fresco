// arcs properties
const arcSize = 200 * 1.8;
const yStep = 10 * 1.8;
// stroke weight modulation
const minWeight = 1 * 1.8;
const maxWeight = 3 * 1.8;
// width modulation
const widthModulation = 15 * 1.8;
const widthModPeriod = 5 / 1.8;
const widthModSpeed = 2 * Math.PI / 60;

//colors
const backgroundClr = '04001e';
const lineClr = '8c6a5c';
const marginThickness = 80  * 1.8;
const alphaFade = true; // whether to fade the alpha 
                        // as we get away from the center
const alphaFadeRadius = 300 * 1.8;

const render = false;

let arcWeight;
let alpha

function setup() {
  createCanvas(1440, 1440);

  if (render) {
    recordAnimation();
  }
}

function draw() {
  setBackgroundColor(colorFromHex(backgroundClr));
  noFill();
  stroke(colorFromHex(lineClr));

  // for each row;
  for (let y = -arcSize; y < height + arcSize; y += yStep) {
    // get downward facing arc strokeWeight
    arcWeight = map(sin(radians(y + frameCount)), -1, 1, minWeight, maxWeight);
    strokeWeight(arcWeight); 

    // draw all downward facing arcs. Each arc is a half turn
    // and is round with diameter arcsize / 2
    for (let x1 = arcSize / 2; x1 < width + arcSize; x1 += arcSize) {
      if (alphaFade) {
        alpha = map(dist(width / 2, height / 2, x1, y), 0, alphaFadeRadius, 255, 0);
        stroke(colorFromHex(lineClr, alpha));
      }
      arc(x1, y, arcSize / 2 +
        sin(widthModSpeed * frameCount + y * widthModPeriod) *
        widthModulation, arcSize / 2, 0, PI);
    }

    // get downward facing arc strokeWeight
    // note that while the downward facing ones will move towards the bottom
    // overtime, these will move upwards (hence the sign in front of frameCount)
    arcWeight = map(sin(radians(y - frameCount)), -1, 1, minWeight, maxWeight);
    strokeWeight(arcWeight);

    // draw all upward facing arcs. Each arc is a half turn
    // and is round with diameter arcsize / 2
    for (let x2 = 0; x2 < width + arcSize; x2 += arcSize) {
      if (alphaFade) {
        alpha = map(dist(width / 2, height / 2, x2, y), 0, alphaFadeRadius, 255, 0);
        stroke(colorFromHex(lineClr, alpha));
      }
      arc(x2, y, arcSize / 2 -
        sin(widthModSpeed * frameCount + y * widthModPeriod) *
        widthModulation, arcSize / 2, PI, TWO_PI);
    }
  }

  border(marginThickness, colorFromHex(backgroundClr));

  // 60 * 6 is the period of the animation
  if (render && frameCount > 60 * 6) {
    stopRecording();
  }
}
