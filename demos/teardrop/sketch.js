const backgroundClr = '000';
const lineThickness = 2;

// Drops params
const numTearDrops = 4;
const roundness = [4, 7]; // how blobby the drop is
const dropRatio = 0.5; // aspect ratio of the drop
const size = [100, 300];
const resolution = 100; // how many points to use to draw the drop
const showDrops = true;

// Rain params
const numRainDrops = 10;
const verticalSpeed = 1; // How fast the drop goes down
const curlFreq = 20; // how fast the drop will move horizontally compared to
                      // how fast it goes down. It's defined in number of
                      // vertical moves between 2 revolutions
const inDropResMult = 5; // Moves will be shorten by this amount to increase
                         // the resolution inside the drop
const noiseMag = 0; // noise in drop
const noiseFreq = 0.001; // noise freq in drop


const phaseSpeed = 2 * Math.PI / curlFreq;
let teardrops;
let rain;


let RainDrop = class extends Fresco.Shape {
  constructor(x, y) {
    super([createVector(x, y), createVector(x, y)]);
    this.dir = 1;
    this.phase = 0;
    this.strokeWeight = lineThickness;
  }

  step(teardrops) {
    if (this.vertices[1].y <= -height / 2) return;

    // store previous position
    this.vertices[0].x = this.vertices[1].x;
    this.vertices[0].y = this.vertices[1].y;

    for (let i = 0; i < teardrops.length; i++) {
      let teardrop = teardrops[i];
      if (teardrop.isInside(this.vertices[1])) {
        // move vertically
        this.vertices[1].y -= verticalSpeed / inDropResMult;

        // move horizontally
        let localWidth = teardrop.localWidth(this.vertices[1].y);
        this.vertices[1].x = teardrop.position.x + localWidth * cos(this.phase);

        // add noise
        let randomDisp = noiseVector(noise,
          (this.vertices[1].x + width / 2) * noiseFreq,
          (this.vertices[1].y + height / 2) * noiseFreq
          ).mult(noiseMag);
          // ensure we keep going down
          randomDisp.y = min(
            randomDisp.y,
            0.9 * verticalSpeed / inDropResMult
          );
          this.vertices[1].add(randomDisp);

        // update phase
        this.phase += phaseSpeed / inDropResMult;
        return;
      }
    }
    // if we reach this point, we have not encountred a raindrop
    this.vertices[1].y -= verticalSpeed;
  }
}

let TearDrop = class extends Fresco.Shape {
  constructor(roundness, aspectRatio, resolution, size) {
    let vtx = []
    let halfHeight = null;
    for (let i = 0; i < resolution; i++) {
      let angle = i * 2 * PI / resolution;
      vtx.push(createPoint(
        aspectRatio * size * sin(angle) * pow(sin(angle / 2), roundness),
        size * cos(angle)
      ));
      if (vtx.length > 1 && halfHeight === null && vtx.at(-1).x < vtx.at(-2)) {
        halfHeight = angle;
      }
    }
    super(vtx);
    this.roundness = roundness;
    this.aspectRatio = aspectRatio;
    this.resolution = resolution;
    this.size = size;
    this.halfWidth = this.vertices.reduce(
      (buffer, vtx) => Math.max(buffer, vtx.x), -width / 2);
    this.halfHeight = halfHeight;

    this.tail = new Fresco.Line(
      createPoint(0, height),
      createPoint(0, size),
    )
  }

  draw() {
    this.tail.position = this.position;
    this.tail.draw();
    super.draw();
  }

  inBounds(x) {
    return (x >= -this.halfWidth + this.position.x
            && x <= this.halfWidth + this.position.x);
  }

  localWidth(y) {
    let t = acos((y - this.position.y) / this.size);
    return this.aspectRatio * this.size * sin(t) * pow(
      sin(t / 2), this.roundness);
  }

  isInside(pos) {
    if (!this.inBounds(pos.x)) {
      return false;
    }
    if (abs(pos.y - this.position.y) > this.size) {
      return false;
    }

    let x = this.localWidth(pos.y);
    return abs(x) > abs(pos.x - this.position.x)
  }
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  teardrops = new Array(numTearDrops).fill(0).map(
    () => {
      let thisSize = random() * (size[1] - size[0]) + size[0];
      let thisRound = random() * (roundness[1] - roundness[0]) + roundness[0];
      let pos = createVector(
        random() * 2 * width / 3 - width / 3,
        random() * 2 * height / 3 - height / 3
      );
      let drop = new TearDrop(thisRound, dropRatio, resolution, thisSize);
      drop.position = pos;
      return drop;
    }
  )
  rain = new Array(numRainDrops).fill(0).map(
    () => new RainDrop(random() * width - width / 2, height / 2));
}

// draw function which is automatically
// called in a loop
function draw() {
  if (showDrops) {
    teardrops.forEach((t) => t.draw());
  }
  rain.forEach((r) => {
    r.step(teardrops);
    r.draw();
  });
}
