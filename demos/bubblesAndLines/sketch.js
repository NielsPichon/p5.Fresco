const backgroundClr = '000';
const minBubbleRadius = 30;
const maxBubbleRadius = 100;
const minLineLength = 50;
const maxLineLength = 100;
const lineProb = 0.2;
const maxIt = 100;

let bubbles = [];
let lines = [];

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;
}

// draw function which is automatically
// called in a loop
function draw() {
  step()
  bubbles.forEach(b => b.draw());
  lines.forEach(l => l.draw());
}


class Bubble extends Fresco.Circle {
  constructor(radius, position) {
    super(radius);
    this.position = position
    this.radius = radius
  }

  pointCollide(point) {
    return distSquared(point, this.position) < this.radius * this.radius;
  }

  bubbleCollide(bubble) {
    return (
      distSquared(bubble.position, this.position)
      < Math.pow(this.radius + bubble.radius, 2)
    );
  }

  lineCollide(line) {
    if (doSegmentIntersectCircle(
      line.vertices.at(0), line.vertices.at(-1), this.position, this.radius)
      === false) {
      return false

    } else {
      return true
    }
  }
}

function spawnBubble() {
  let randomPos = createVector(
    random(width) - width / 2, random(height) - height / 2)
  let radius = random(minBubbleRadius, maxBubbleRadius);
  let newBubble = new Bubble(radius, randomPos);

  for (let b of bubbles) {
    if (b.bubbleCollide(newBubble)) {
      return false
    }
  }
  // for (let l of lines) {
  //   if (newBubble.lineCollide(l)) {
  //     return false
  //   }
  // }

  bubbles.push(newBubble)
  return true;
}

function spawnLine() {
  let randomPos = createVector(
    random(width) - width / 2, random(height) - height / 2);
  let length = random(minLineLength, maxLineLength);
  let randomEnd = (
    randomPos.copy().add(createVector(random(), random()).mult(length)));
  let newLine = new Fresco.Line(randomPos, randomEnd);

  // for (let b of bubbles) {
  //   if (b.lineCollide(newLine)) {
  //     return false
  //   }
  // }

  lines.push(newLine)
  return true;
}

function step() {
  let spawned = false;
  let line = random() < lineProb;
  let counter = 0;
  while (!spawned || counter < maxIt) {
    if (line) {
      spawned = spawnLine();
    } else {
      spawned = spawnBubble();
    }
    counter++;
  }

  if (counter >= maxIt) {
    noLoop();
  }
}