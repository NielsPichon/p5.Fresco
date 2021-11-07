const backgroundClr = '000114';
const potColors = ['83fcc5', 'fc846c', 'cb8ffc'];
const numLevels = 3;
const potResolution = 64;
const minBaseWidth = 0.2;
const maxBaseWidth = 0.8;
const minWidth = 0.2;
const maxWidth = 2.5;
const gridRes = 10;
const cylinderProb = 0.25;
const baseMinX = 0.2;
const baseMaxX = 1;
const margin = 0.1;
const swapProb = 0.1;

let pots = [];
let maxSize;

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  maxSize = height * (1 - margin) / (gridRes + 2);
  for (let i = 0; i < gridRes; i++)
  {
    for (let j = 0; j < gridRes; j++) {
      let new_p = new RandomPot(numLevels, maxSize, potResolution, minBaseWidth, maxBaseWidth, baseMinX, baseMaxX, minWidth, maxWidth, cylinderProb);
      new_p.position = createVector((i + 1) / (gridRes + 1) * width - width / 2,  (j + 1) / (gridRes + 1) * height - height / 2 - maxSize / 2);
      pots.push(new_p);
    }
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  setBackgroundColor(colorFromHex(backgroundClr));
  for (let i = 0; i < pots.length; i++) {
    pots[i].draw();
  }

  if (random() <= swapProb) {
    let idx = randomInt(pots.length);
    let new_p = new RandomPot(numLevels, maxSize, potResolution, minBaseWidth, maxBaseWidth, baseMinX, baseMaxX, minWidth, maxWidth, cylinderProb);
    new_p.position = pots[idx].position.copy();
    pots[idx] = new_p;
  }
}