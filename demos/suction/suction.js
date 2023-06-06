const backgroundClr = '000';
const resolution = 50;
const noiseFreq = 0.01;
const suction = 3;
const angle = 180 * Math.PI / 180;


let shapes = [];


function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  let stepSizeX = width / (resolution + 1);
  let stepSizeY = height / (resolution + 1);
  let baseSize = Math.min(stepSizeX, stepSizeY);

  //Spawn a grid of squares
  for (let x = -width / 2 + stepSizeX * 0.5; x < width / 2; x += stepSizeX) {
    for (let y = -height / 2 + stepSizeY * 0.5; y < height / 2; y += stepSizeY) {
      let size = baseSize * noise((x + width / 2) * noiseFreq, (y + height / 2) * noiseFreq);
      let square = new Fresco.Square(size);
      square.position = createPoint(x, y);
      shapes.push(square);
    }
  }

  //Suck squares towards a point
  let maxDist = Math.sqrt(width * width + height * height) / 2;
  // let suctionPoint = createVector(-width / 2 + random(width), -height / 2 + random(height));
  let suctionPoint = createVector(0,0);
  shapes.forEach(square => {
    // let d = distSquared(suctionPoint, square.position);
    // let contraction = Math.pow(d / maxDist, suction);
    // square.position = suctionPoint.copy().add(
    //   square.position.sub(suctionPoint).mult(contraction)
    // );
    square.position.sub(suctionPoint);
    let d = square.position.mag();
    let t = lerp(1, 0, d / maxDist);
    square.position.rotate(angle * Math.pow(t, suction));
    square.position.add(suctionPoint);
  });

}

// draw function which is automatically
// called in a loop
function draw() {
  shapes.forEach(square => {
    square.draw();
  });
}